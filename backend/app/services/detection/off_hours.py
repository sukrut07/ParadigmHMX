from datetime import time
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.access_log import AccessLog
from app.services.detection.base import BaseDetector

class OffHoursDetector(BaseDetector):
    name: str = "OffHoursDetector"
    signal_type: str = "OFF_HOURS_ACCESS"

    def detect(
        self,
        db: Session,
        account_id: Optional[str] = None,
        employee_id: Optional[str] = None,
        transaction_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = db.query(AccessLog)
        if employee_id:
            query = query.filter(AccessLog.employee_id == employee_id)
        if account_id:
            query = query.filter(AccessLog.account_id == account_id)

        logs = query.all()
        signals = []

        employees = {e.id: e for e in db.query(Employee).all()}

        for log in logs:
            emp = employees.get(log.employee_id)
            if not emp:
                continue

            # Check for authorized exceptions in metadata (e.g. EMERGENCY_OPERATIONS or NIGHT_SHIFT_PERMIT)
            meta = log.metadata_json or {}
            if meta.get("authorized_exception") or meta.get("emergency_op"):
                continue

            # Parse employee normal hours
            start_hour, start_min = [int(x) for x in emp.normal_work_start.split(":")]
            end_hour, end_min = [int(x) for x in emp.normal_work_end.split(":")]

            work_start = time(start_hour, start_min)
            work_end = time(end_hour, end_min)
            log_time = log.timestamp.time()

            # Handle standard daytime vs overnight shift
            is_off_hours = False
            if work_start <= work_end:
                if log_time < work_start or log_time > work_end:
                    is_off_hours = True
            else:
                # Overnight shift, e.g. 21:00 to 06:00
                if work_end < log_time < work_start:
                    is_off_hours = True

            if is_off_hours:
                evidence = [
                    {
                        "record_type": "access_log",
                        "record_id": log.id,
                        "field": "timestamp",
                        "value": f"{log.timestamp.strftime('%Y-%m-%d %H:%M:%S')} (Action: {log.action})",
                        "details": {
                            "action": log.action,
                            "access_time": log_time.strftime("%H:%M:%S"),
                            "shift_start": emp.normal_work_start,
                            "shift_end": emp.normal_work_end,
                            "device_id": log.device_id
                        }
                    }
                ]

                entities = [
                    {"type": "employee", "id": emp.id},
                    {"type": "account", "id": log.account_id}
                ]

                explanation = (
                    f"Employee {emp.id} accessed account {log.account_id} at {log_time.strftime('%H:%M:%S')}, "
                    f"outside authorized shift window ({emp.normal_work_start}–{emp.normal_work_end}) "
                    f"for action '{log.action}' without recorded emergency exception."
                )

                severity = "HIGH" if log.action in ("OVERRIDE", "EDIT", "EXPORT") else "MEDIUM"
                confidence = 0.89

                sig = self.build_signal(
                    severity=severity,
                    confidence=confidence,
                    entities=entities,
                    evidence=evidence,
                    explanation=explanation
                )
                signals.append(sig)

        return signals
