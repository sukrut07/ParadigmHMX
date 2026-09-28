from typing import List, Dict, Any, Optional
from collections import defaultdict
from sqlalchemy.orm import Session
from app.config import settings
from app.models.customer import Customer
from app.models.account import Account
from app.models.transaction import Transaction
from app.services.detection.base import BaseDetector

class ProfileMismatchDetector(BaseDetector):
    name: str = "ProfileMismatchDetector"
    signal_type: str = "PROFILE_MISMATCH"

    def detect(
        self,
        db: Session,
        account_id: Optional[str] = None,
        employee_id: Optional[str] = None,
        transaction_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        # Fetch accounts with their customers
        query = db.query(Account)
        if account_id:
            query = query.filter(Account.id == account_id)
        
        accounts = query.all()
        signals = []

        # Pre-group transactions by account to eliminate N+1 queries
        tx_by_account = defaultdict(list)
        all_tx_query = db.query(Transaction).filter(Transaction.status == "COMPLETED")
        if account_id:
            all_tx_query = all_tx_query.filter((Transaction.from_account_id == account_id) | (Transaction.to_account_id == account_id))
        for tx in all_tx_query.all():
            tx_by_account[tx.from_account_id].append(tx)
            tx_by_account[tx.to_account_id].append(tx)

        for acc in accounts:
            customer = acc.customer
            if not customer:
                continue

            declared_max = customer.declared_income_max or 50000.0
            txs = tx_by_account.get(acc.id, [])
            if not txs:
                continue

            total_volume = sum(t.amount for t in txs)
            single_max_tx = max(t.amount for t in txs)

            # Mismatch criteria:
            # Total volume > declared_max * 10 OR single transaction > declared_max * 6
            if total_volume > declared_max * settings.PROFILE_MISMATCH_RATIO or single_max_tx > declared_max * 4.0:
                highest_txs = sorted(txs, key=lambda x: x.amount, reverse=True)[:3]
                evidence = [
                    {
                        "record_type": "customer",
                        "record_id": customer.id,
                        "field": "declared_income",
                        "value": f"Declared: ₹{declared_max:,.2f}/mo ({customer.declared_occupation or 'Unknown'})",
                        "details": {
                            "income_band": customer.declared_income_band,
                            "kyc_status": customer.kyc_status,
                            "risk_profile": customer.risk_profile
                        }
                    }
                ]

                for t in highest_txs:
                    evidence.append({
                        "record_type": "transaction",
                        "record_id": t.id,
                        "field": "amount",
                        "value": f"Transaction ₹{t.amount:,.2f} on {t.timestamp.strftime('%Y-%m-%d')}",
                        "details": {
                            "amount": t.amount,
                            "channel": t.channel
                        }
                    })

                entities = [
                    {"type": "account", "id": acc.id},
                    {"type": "customer", "id": customer.id}
                ]

                ratio = total_volume / (declared_max if declared_max > 0 else 1)
                explanation = (
                    f"Customer {customer.id} (Account {acc.id}) with declared income of ₹{declared_max:,.2f}/month "
                    f"({customer.declared_occupation}) conducted transactions totaling ₹{total_volume:,.2f} "
                    f"({ratio:.1f}x declared monthly income), including single transfers up to ₹{single_max_tx:,.2f}."
                )

                sig = self.build_signal(
                    severity="HIGH" if ratio > 10.0 else "MEDIUM",
                    confidence=0.85,
                    entities=entities,
                    evidence=evidence,
                    explanation=explanation
                )
                signals.append(sig)

        return signals
