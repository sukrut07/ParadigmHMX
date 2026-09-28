from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy.orm import Session

from app.config import settings
from app.models.access_log import AccessLog
from app.models.account_change import AccountChange
from app.models.transaction import Transaction
from app.services.detection.base import BaseDetector


class ActionTransactionDetector(BaseDetector):
    name: str = "ActionTransactionDetector"
    signal_type: str = "ACTION_TRANSACTION_LINK"

    def detect(
        self,
        db: Session,
        account_id: str | None = None,
        employee_id: str | None = None,
        transaction_id: str | None = None,
    ) -> list[dict[str, Any]]:
        # Link employee actions/account changes to subsequent transactions on that account
        window_hours = settings.ACTION_TRANSACTION_WINDOW_HOURS

        query_changes = db.query(AccountChange)
        if employee_id:
            query_changes = query_changes.filter(AccountChange.employee_id == employee_id)
        if account_id:
            query_changes = query_changes.filter(AccountChange.account_id == account_id)
        changes = query_changes.order_by(AccountChange.timestamp.asc()).all()

        query_logs = db.query(AccessLog).filter(AccessLog.action.in_(["EDIT", "OVERRIDE", "APPROVE"]))
        if employee_id:
            query_logs = query_logs.filter(AccessLog.employee_id == employee_id)
        if account_id:
            query_logs = query_logs.filter(AccessLog.account_id == account_id)
        logs = query_logs.order_by(AccessLog.timestamp.asc()).all()

        signals = []
        seen_pairs = set()

        # Combine modifications
        actions: list[dict[str, Any]] = []
        for chg in changes:
            actions.append(
                {
                    "source": "account_change",
                    "id": chg.id,
                    "employee_id": chg.employee_id,
                    "account_id": chg.account_id,
                    "field": chg.field,
                    "timestamp": chg.timestamp,
                    "details": f"Modified {chg.field}",
                }
            )
        for log in logs:
            actions.append(
                {
                    "source": "access_log",
                    "id": log.id,
                    "employee_id": log.employee_id,
                    "account_id": log.account_id,
                    "field": log.action,
                    "timestamp": log.timestamp,
                    "details": f"Executed {log.action}",
                }
            )

        # Pre-group transactions by from_account_id to eliminate N+1 query overhead
        tx_by_sender: dict[str, list[Transaction]] = defaultdict(list)
        all_tx_query = db.query(Transaction).filter(Transaction.status == "COMPLETED")
        if transaction_id:
            all_tx_query = all_tx_query.filter(Transaction.id == transaction_id)
        elif account_id:
            all_tx_query = all_tx_query.filter(Transaction.from_account_id == account_id)

        for t in all_tx_query.order_by(Transaction.timestamp.asc()).all():
            tx_by_sender[t.from_account_id].append(t)

        for act in actions:
            emp_id = str(act["employee_id"])
            acc_id = str(act["account_id"])
            act_time: datetime = act["timestamp"]

            # Look for subsequent transactions from this account within window_hours
            cand_txs = tx_by_sender.get(acc_id, [])
            subsequent_txs = [
                t for t in cand_txs if act_time <= t.timestamp <= act_time + timedelta(hours=window_hours)
            ]
            if not subsequent_txs:
                continue

            pair_key = (emp_id, acc_id, act["id"])
            if pair_key in seen_pairs:
                continue
            seen_pairs.add(pair_key)

            total_amount = sum(t.amount for t in subsequent_txs)
            first_tx = subsequent_txs[0]
            first_delta_minutes = (first_tx.timestamp - act_time).total_seconds() / 60.0

            evidence = [
                {
                    "record_type": act["source"],
                    "record_id": act["id"],
                    "field": act["field"],
                    "value": f"{act['details']} on account {acc_id}",
                    "details": {"employee_id": emp_id, "timestamp": act_time.isoformat()},
                }
            ]

            for t in subsequent_txs[:4]:
                delta_m = (t.timestamp - act_time).total_seconds() / 60.0
                evidence.append(
                    {
                        "record_type": "transaction",
                        "record_id": t.id,
                        "field": "amount",
                        "value": f"₹{t.amount:,.2f} transferred to {t.to_account_id}",
                        "details": {
                            "timestamp": t.timestamp.isoformat(),
                            "time_delta_minutes": round(delta_m, 1),
                            "recipient": t.to_account_id,
                        },
                    }
                )

            entities = [{"type": "employee", "id": emp_id}, {"type": "account", "id": acc_id}]

            explanation = (
                f"Employee {emp_id} performed '{act['details']}' on account {acc_id}. "
                f"Within {first_delta_minutes:.1f} minutes, {len(subsequent_txs)} outbound transfer(s) "
                f"totaling ₹{total_amount:,.2f} were initiated from {acc_id}, establishing direct "
                f"temporal and entity linkage between insider manipulation and fund depletion."
            )

            severity = "CRITICAL" if total_amount >= 100000 or first_delta_minutes <= 60 else "HIGH"
            confidence = 0.96

            sig = self.build_signal(
                severity=severity, confidence=confidence, entities=entities, evidence=evidence, explanation=explanation
            )
            signals.append(sig)

        return signals
