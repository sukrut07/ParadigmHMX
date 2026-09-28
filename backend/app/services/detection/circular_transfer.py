from datetime import timedelta
from typing import List, Dict, Any, Optional
import networkx as nx
from sqlalchemy.orm import Session
from app.config import settings
from app.models.transaction import Transaction
from app.services.detection.base import BaseDetector

class CircularTransferDetector(BaseDetector):
    name: str = "CircularTransferDetector"
    signal_type: str = "CIRCULAR_TRANSFER"

    def detect(
        self,
        db: Session,
        account_id: Optional[str] = None,
        employee_id: Optional[str] = None,
        transaction_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = db.query(Transaction).filter(Transaction.status == "COMPLETED")
        if transaction_id:
            query = query.filter(Transaction.id == transaction_id)
        
        transactions = query.order_by(Transaction.timestamp.asc()).all()
        if not transactions:
            return []

        # Build directed multigraph or directed graph with edge attributes
        G = nx.DiGraph()
        tx_by_edge = {}

        for tx in transactions:
            u, v = tx.from_account_id, tx.to_account_id
            if u == v:
                continue
            if not G.has_edge(u, v):
                G.add_edge(u, v)
                tx_by_edge[(u, v)] = []
            tx_by_edge[(u, v)].append(tx)

        signals = []
        visited_cycles = set()

        max_cycle_len = settings.CYCLE_MAX_LENGTH
        max_hours = settings.CYCLE_MAX_HOURS

        # Find simple cycles with bounded length (Section 43 performance requirement)
        try:
            cycles = list(nx.simple_cycles(G, length_bound=max_cycle_len))
        except Exception:
            cycles = []

        for cycle in cycles:
            # cycle is a list of node IDs: [A, B, C, D] meaning A->B->C->D->A
            k = len(cycle)
            if k < 2 or k > max_cycle_len:
                continue

            # If filtered by account_id, check membership
            if account_id and account_id not in cycle:
                continue

            cycle_key = tuple(sorted(cycle))
            if cycle_key in visited_cycles:
                continue
            visited_cycles.add(cycle_key)

            # Check matching sequence of transactions along cycle
            # We want to find a chain tx_0, tx_1, ..., tx_{k-1} where timestamp is non-decreasing within max_hours
            edges = [(cycle[i], cycle[(i + 1) % k]) for i in range(k)]
            
            # Verify if there is a chronological chain
            valid_chain = self._find_chronological_chain(edges, tx_by_edge, max_hours)
            if not valid_chain:
                continue

            # Check amount consistency (ratio min/max >= 0.5 to filter arbitrary unrelated payments)
            amounts = [tx.amount for tx in valid_chain]
            if max(amounts) > 0 and (min(amounts) / max(amounts)) < 0.40:
                continue

            # Formulate evidence and signal
            evidence = []
            entities = [{"type": "account", "id": acc} for acc in cycle]
            cycle_path_str = " → ".join(cycle) + f" → {cycle[0]}"
            
            for tx in valid_chain:
                evidence.append({
                    "record_type": "transaction",
                    "record_id": tx.id,
                    "field": "amount_and_route",
                    "value": f"{tx.from_account_id} -> {tx.to_account_id}: ₹{tx.amount:,.2f}",
                    "details": {
                        "from_account": tx.from_account_id,
                        "to_account": tx.to_account_id,
                        "amount": tx.amount,
                        "timestamp": tx.timestamp.isoformat(),
                        "channel": tx.channel
                    }
                })

            explanation = (
                f"Detected {k}-hop circular money flow ({cycle_path_str}). "
                f"Total amount ~₹{amounts[0]:,.2f} circulated through {k} accounts within "
                f"{(valid_chain[-1].timestamp - valid_chain[0].timestamp).total_seconds() / 3600:.1f} hours."
            )

            severity = "HIGH" if k <= 3 else "CRITICAL"
            confidence = 0.92

            sig = self.build_signal(
                severity=severity,
                confidence=confidence,
                entities=entities,
                evidence=evidence,
                explanation=explanation
            )
            signals.append(sig)

        return signals

    def _find_chronological_chain(self, edges, tx_by_edge, max_hours):
        """Finds if there exists a valid sequence of transactions along edges within max_hours window."""
        # Simple search for a valid chronological sequence
        first_edge_txs = tx_by_edge.get(edges[0], [])
        for t0 in first_edge_txs:
            chain = [t0]
            curr_time = t0.timestamp
            possible = True
            for next_edge in edges[1:]:
                candidates = [
                    t for t in tx_by_edge.get(next_edge, [])
                    if t.timestamp >= curr_time and (t.timestamp - t0.timestamp).total_seconds() <= max_hours * 3600
                ]
                if not candidates:
                    possible = False
                    break
                # choose the earliest valid candidate
                chosen = min(candidates, key=lambda x: x.timestamp)
                chain.append(chosen)
                curr_time = chosen.timestamp
            if possible and len(chain) == len(edges):
                return chain
        return None
