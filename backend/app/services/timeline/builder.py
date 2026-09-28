from typing import Any

from sqlalchemy.orm import Session

from app.models.access_log import AccessLog
from app.models.account_change import AccountChange
from app.models.transaction import Transaction


class TimelineBuilder:
    def __init__(self):
        pass

    def build_timeline(self, db: Session, entity_ids: set[str] | None = None, limit: int = 100) -> list[dict[str, Any]]:
        """
        Merges AccessLogs, AccountChanges, and Transactions into a unified chronological event stream.
        """
        events: list[dict[str, Any]] = []

        # 1. Fetch AccessLogs
        q_logs = db.query(AccessLog)
        if entity_ids:
            q_logs = q_logs.filter((AccessLog.employee_id.in_(entity_ids)) | (AccessLog.account_id.in_(entity_ids)))
        logs = q_logs.all()

        for log in logs:
            severity = (
                "HIGH" if log.action in ("OVERRIDE", "APPROVE") else ("MEDIUM" if log.action == "EDIT" else "INFO")
            )
            events.append(
                {
                    "event_id": f"EVT-LOG-{log.id}",
                    "event_type": "ACCESS_LOG",
                    "timestamp": log.timestamp.isoformat(),
                    "actor": log.employee_id,
                    "entity": log.account_id,
                    "description": f"Employee {log.employee_id} performed '{log.action}' on account {log.account_id}",
                    "severity": severity,
                    "source_record_id": log.id,
                    "metadata": {"action": log.action, "branch_id": log.branch_id, "device_id": log.device_id},
                }
            )

        # 2. Fetch AccountChanges
        q_chgs = db.query(AccountChange)
        if entity_ids:
            q_chgs = q_chgs.filter(
                (AccountChange.employee_id.in_(entity_ids)) | (AccountChange.account_id.in_(entity_ids))
            )
        changes = q_chgs.all()

        for chg in changes:
            events.append(
                {
                    "event_id": f"EVT-CHG-{chg.id}",
                    "event_type": "ACCOUNT_CHANGE",
                    "timestamp": chg.timestamp.isoformat(),
                    "actor": chg.employee_id,
                    "entity": chg.account_id,
                    "description": f"Employee {chg.employee_id} modified field '{chg.field}' on account {chg.account_id} (Reason: {chg.reason or 'Unspecified'})",
                    "severity": "HIGH" if chg.field in ("daily_limit", "KYC", "beneficiary") else "MEDIUM",
                    "source_record_id": chg.id,
                    "metadata": {
                        "field": chg.field,
                        "approval_required": chg.approval_required,
                        "approved_by": chg.approved_by,
                    },
                }
            )

        # 3. Fetch Transactions
        q_tx = db.query(Transaction)
        if entity_ids:
            q_tx = q_tx.filter(
                (Transaction.from_account_id.in_(entity_ids)) | (Transaction.to_account_id.in_(entity_ids))
            )
        transactions = q_tx.all()

        for tx in transactions:
            events.append(
                {
                    "event_id": f"EVT-TX-{tx.id}",
                    "event_type": "TRANSACTION",
                    "timestamp": tx.timestamp.isoformat(),
                    "actor": tx.initiated_by_employee_id or tx.from_account_id,
                    "entity": tx.from_account_id,
                    "description": f"Fund transfer of ₹{tx.amount:,.2f} from {tx.from_account_id} to {tx.to_account_id} via {tx.channel}",
                    "severity": "HIGH" if tx.amount >= 100000 else "INFO",
                    "source_record_id": tx.id,
                    "metadata": {
                        "to_account": tx.to_account_id,
                        "amount": tx.amount,
                        "channel": tx.channel,
                        "reference": tx.reference,
                    },
                }
            )

        # Sort chronologically
        events.sort(key=lambda x: str(x["timestamp"]))
        return events[:limit]
