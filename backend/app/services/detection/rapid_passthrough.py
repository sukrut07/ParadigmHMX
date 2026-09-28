from typing import List, Dict, Any, Optional
from collections import defaultdict
from sqlalchemy.orm import Session
from app.config import settings
from app.models.transaction import Transaction
from app.services.detection.base import BaseDetector

class RapidPassThroughDetector(BaseDetector):
    name: str = "RapidPassThroughDetector"
    signal_type: str = "RAPID_PASSTHROUGH"

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
        if account_id:
            query = query.filter((Transaction.from_account_id == account_id) | (Transaction.to_account_id == account_id))

        transactions = query.order_by(Transaction.timestamp.asc()).all()
        if not transactions:
            return []

        # Map transactions by account
        inflows = defaultdict(list)
        outflows = defaultdict(list)

        for tx in transactions:
            if tx.channel == "PAYROLL":
                continue
            inflows[tx.to_account_id].append(tx)
            outflows[tx.from_account_id].append(tx)

        max_hours = settings.RAPID_PASSTHROUGH_HOURS
        min_ratio = settings.RAPID_PASSTHROUGH_RATIO
        signals = []
        matched_pairs = set()

        for acc, in_list in inflows.items():
            if account_id and acc != account_id:
                continue
            out_list = outflows.get(acc, [])
            if not out_list:
                continue

            for tx_in in in_list:
                for tx_out in out_list:
                    if tx_out.timestamp <= tx_in.timestamp:
                        continue
                    delta_hours = (tx_out.timestamp - tx_in.timestamp).total_seconds() / 3600.0
                    if delta_hours > max_hours:
                        continue

                    # Check amount similarity (e.g. out between 80% and 105% of in)
                    if tx_in.amount <= 0:
                        continue
                    ratio = tx_out.amount / tx_in.amount
                    if min_ratio <= ratio <= 1.05 and tx_in.amount >= 10000:
                        pair_key = (tx_in.id, tx_out.id)
                        if pair_key in matched_pairs:
                            continue
                        matched_pairs.add(pair_key)

                        evidence = [
                            {
                                "record_type": "transaction",
                                "record_id": tx_in.id,
                                "field": "inflow",
                                "value": f"Inflow ₹{tx_in.amount:,.2f} from {tx_in.from_account_id}",
                                "details": {
                                    "amount": tx_in.amount,
                                    "from": tx_in.from_account_id,
                                    "to": acc,
                                    "timestamp": tx_in.timestamp.isoformat()
                                }
                            },
                            {
                                "record_type": "transaction",
                                "record_id": tx_out.id,
                                "field": "outflow",
                                "value": f"Outflow ₹{tx_out.amount:,.2f} to {tx_out.to_account_id}",
                                "details": {
                                    "amount": tx_out.amount,
                                    "from": acc,
                                    "to": tx_out.to_account_id,
                                    "timestamp": tx_out.timestamp.isoformat()
                                }
                            }
                        ]

                        entities = [
                            {"type": "account", "id": acc},
                            {"type": "account", "id": tx_in.from_account_id},
                            {"type": "account", "id": tx_out.to_account_id}
                        ]

                        explanation = (
                            f"Account {acc} exhibited rapid mule/pass-through activity: "
                            f"received ₹{tx_in.amount:,.2f} from {tx_in.from_account_id} and transferred out "
                            f"₹{tx_out.amount:,.2f} ({ratio*100:.1f}%) to {tx_out.to_account_id} within "
                            f"{delta_hours:.1f} hours, retaining minimal balance."
                        )

                        sig = self.build_signal(
                            severity="HIGH" if tx_in.amount >= 50000 else "MEDIUM",
                            confidence=0.86,
                            entities=entities,
                            evidence=evidence,
                            explanation=explanation
                        )
                        signals.append(sig)

        return signals
