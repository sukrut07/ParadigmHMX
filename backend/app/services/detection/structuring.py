from datetime import timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict
from sqlalchemy.orm import Session
from app.config import settings
from app.models.transaction import Transaction
from app.models.account import Account
from app.services.detection.base import BaseDetector

class StructuringDetector(BaseDetector):
    name: str = "StructuringDetector"
    signal_type: str = "STRUCTURING"

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

        # Group outbound transactions by sender account
        txs_by_sender = defaultdict(list)
        for tx in transactions:
            # Exclude explicit payroll batches
            if tx.channel == "PAYROLL" or (tx.reference and "PAYROLL" in tx.reference.upper()):
                continue
            txs_by_sender[tx.from_account_id].append(tx)

        threshold = settings.STRUCTURING_THRESHOLD
        window_hours = settings.STRUCTURING_WINDOW_HOURS
        min_tx_count = settings.STRUCTURING_MIN_TX_COUNT
        signals = []

        for sender_id, tx_list in txs_by_sender.items():
            if len(tx_list) < min_tx_count:
                continue

            # Check sender account type (e.g. if PAYROLL account, skip standard payroll runs)
            sender_account = db.query(Account).filter(Account.id == sender_id).first()
            if sender_account and sender_account.account_type == "PAYROLL":
                continue

            # Sliding window search
            n = len(tx_list)
            for i in range(n):
                window_txs = [tx_list[i]]
                start_time = tx_list[i].timestamp

                for j in range(i + 1, n):
                    if (tx_list[j].timestamp - start_time).total_seconds() <= window_hours * 3600:
                        window_txs.append(tx_list[j])
                    else:
                        break

                if len(window_txs) < min_tx_count:
                    continue

                total_amount = sum(t.amount for t in window_txs)
                # Check structuring pattern:
                # 1. Total split amount exceeds the reporting threshold (e.g., total >= threshold * 1.2)
                # 2. Individual transaction amounts are deliberately sized just below threshold (0.60 * threshold to 0.99 * threshold)
                # 3. Multiple split transactions in close proximity
                sub_threshold_txs = [t for t in window_txs if 0.60 * threshold <= t.amount < 0.99 * threshold]
                total_split = sum(t.amount for t in sub_threshold_txs)
                if len(sub_threshold_txs) >= min_tx_count and total_split >= threshold * 1.2:
                    # Found structuring group!
                    evidence = []
                    participating_targets = list({t.to_account_id for t in sub_threshold_txs})
                    
                    for t in sub_threshold_txs:
                        evidence.append({
                            "record_type": "transaction",
                            "record_id": t.id,
                            "field": "amount",
                            "value": f"₹{t.amount:,.2f} to {t.to_account_id}",
                            "details": {
                                "from_account": t.from_account_id,
                                "to_account": t.to_account_id,
                                "amount": t.amount,
                                "timestamp": t.timestamp.isoformat(),
                                "channel": t.channel
                            }
                        })

                    # Primary investigated entity is the structuring sender account
                    entities = [{"type": "account", "id": sender_id}]

                    total_split = sum(t.amount for t in sub_threshold_txs)
                    time_span_hours = (sub_threshold_txs[-1].timestamp - sub_threshold_txs[0].timestamp).total_seconds() / 3600

                    explanation = (
                        f"Account {sender_id} executed {len(sub_threshold_txs)} transactions just below threshold (₹{threshold:,.2f}) "
                        f"totaling ₹{total_split:,.2f} within {time_span_hours:.1f} hours to {len(participating_targets)} recipient accounts, "
                        f"indicating deliberate structuring / transaction splitting to evade reporting."
                    )

                    sig = self.build_signal(
                        severity="HIGH" if total_split >= threshold * 1.5 else "MEDIUM",
                        confidence=0.88,
                        entities=entities,
                        evidence=evidence,
                        explanation=explanation
                    )
                    signals.append(sig)
                    break # avoid overlapping duplicate windows for same sender

        return signals
