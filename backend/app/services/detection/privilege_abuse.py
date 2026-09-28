from typing import List, Dict, Any, Optional
from collections import defaultdict
from sqlalchemy.orm import Session
from app.config import settings
from app.models.access_log import AccessLog
from app.models.account_change import AccountChange
from app.services.detection.base import BaseDetector

class PrivilegeAbuseDetector(BaseDetector):
    name: str = "PrivilegeAbuseDetector"
    signal_type: str = "PRIVILEGE_ABUSE"

    def detect(
        self,
        db: Session,
        account_id: Optional[str] = None,
        employee_id: Optional[str] = None,
        transaction_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        # Check AccountChanges and AccessLogs for high-privilege actions (OVERRIDE, APPROVE, limit increase, KYC override)
        query_changes = db.query(AccountChange)
        if employee_id:
            query_changes = query_changes.filter(AccountChange.employee_id == employee_id)
        if account_id:
            query_changes = query_changes.filter(AccountChange.account_id == account_id)
        
        changes = query_changes.order_by(AccountChange.timestamp.asc()).all()

        query_logs = db.query(AccessLog).filter(AccessLog.action.in_(["OVERRIDE", "APPROVE"]))
        if employee_id:
            query_logs = query_logs.filter(AccessLog.employee_id == employee_id)
        if account_id:
            query_logs = query_logs.filter(AccessLog.account_id == account_id)
        logs = query_logs.order_by(AccessLog.timestamp.asc()).all()

        signals = []
        window_hours = settings.PRIVILEGE_OVERRIDE_WINDOW_HOURS
        threshold = settings.PRIVILEGE_OVERRIDE_THRESHOLD

        # Group sensitive events by employee
        emp_events = defaultdict(list)
        for chg in changes:
            if chg.field in ("daily_limit", "KYC", "risk_status", "beneficiary") or chg.approval_required:
                emp_events[chg.employee_id].append({
                    "type": "account_change",
                    "id": chg.id,
                    "field": chg.field,
                    "account_id": chg.account_id,
                    "timestamp": chg.timestamp,
                    "reason": chg.reason
                })

        for log in logs:
            emp_events[log.employee_id].append({
                "type": "access_log",
                "id": log.id,
                "field": log.action,
                "account_id": log.account_id,
                "timestamp": log.timestamp,
                "reason": "Administrative override"
            })

        for emp_id, ev_list in emp_events.items():
            ev_list.sort(key=lambda x: x["timestamp"])
            n = len(ev_list)
            for i in range(n):
                window = [ev_list[i]]
                start_t = ev_list[i]["timestamp"]
                for j in range(i + 1, n):
                    if (ev_list[j]["timestamp"] - start_t).total_seconds() <= window_hours * 3600:
                        window.append(ev_list[j])
                    else:
                        break

                if len(window) >= threshold:
                    evidence = []
                    target_accounts = list({ev["account_id"] for ev in window})
                    for ev in window:
                        evidence.append({
                            "record_type": ev["type"],
                            "record_id": ev["id"],
                            "field": ev["field"],
                            "value": f"{ev['field']} modification on {ev['account_id']}",
                            "details": {
                                "timestamp": ev["timestamp"].isoformat(),
                                "reason": ev["reason"]
                            }
                        })

                    entities = [{"type": "employee", "id": emp_id}]
                    if len(target_accounts) == 1:
                        entities.append({"type": "account", "id": target_accounts[0]})

                    time_span_h = (window[-1]["timestamp"] - window[0]["timestamp"]).total_seconds() / 3600.0
                    explanation = (
                        f"Employee {emp_id} executed {len(window)} sensitive privilege overrides/limit modifications "
                        f"across {len(target_accounts)} accounts within {time_span_h:.1f} hours, "
                        f"exceeding safety threshold ({threshold} per {window_hours}h) without mandatory dual-custody authorization."
                    )

                    sig = self.build_signal(
                        severity="CRITICAL" if len(window) >= 5 else "HIGH",
                        confidence=0.92,
                        entities=entities,
                        evidence=evidence,
                        explanation=explanation
                    )
                    signals.append(sig)
                    break # avoid duplicate reports for overlapping windows

        return signals
