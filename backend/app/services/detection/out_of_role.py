from typing import Any

from sqlalchemy.orm import Session

from app.models.access_log import AccessLog
from app.models.employee import Employee
from app.models.role import Role
from app.services.detection.base import BaseDetector


class OutOfRoleDetector(BaseDetector):
    name: str = "OutOfRoleDetector"
    signal_type: str = "OUT_OF_ROLE_ACCESS"

    def detect(
        self,
        db: Session,
        account_id: str | None = None,
        employee_id: str | None = None,
        transaction_id: str | None = None,
    ) -> list[dict[str, Any]]:
        query = db.query(AccessLog)
        if employee_id:
            query = query.filter(AccessLog.employee_id == employee_id)
        if account_id:
            query = query.filter(AccessLog.account_id == account_id)

        logs = query.order_by(AccessLog.timestamp.desc()).all()
        signals = []

        # Cache roles and employees
        employees = {e.id: e for e in db.query(Employee).all()}
        roles = {r.id: r for r in db.query(Role).all()}

        for log in logs:
            emp = employees.get(log.employee_id)
            if not emp:
                continue
            role = roles.get(emp.role_id)
            if not role:
                continue

            permitted_actions = role.permitted_actions or []
            permitted_branches = role.permitted_branches or []

            # Check action permission
            action_unauthorized = log.action not in permitted_actions and "*" not in permitted_actions
            # Check branch permission if log has branch
            branch_unauthorized = False
            if log.branch_id and permitted_branches and "*" not in permitted_branches:
                branch_unauthorized = log.branch_id not in permitted_branches

            if action_unauthorized or branch_unauthorized:
                reason = "action outside permitted scope" if action_unauthorized else "branch outside jurisdiction"
                evidence = [
                    {
                        "record_type": "access_log",
                        "record_id": log.id,
                        "field": "action",
                        "value": f"{log.action} at branch {log.branch_id or emp.branch_id}",
                        "details": {
                            "action": log.action,
                            "timestamp": log.timestamp.isoformat(),
                            "role_id": role.id,
                            "role_name": role.name,
                            "permitted_actions": permitted_actions,
                            "permitted_branches": permitted_branches,
                        },
                    }
                ]

                entities = [{"type": "employee", "id": emp.id}, {"type": "account", "id": log.account_id}]

                explanation = (
                    f"Employee {emp.id} with role '{role.name}' executed unauthorized action '{log.action}' "
                    f"on account {log.account_id} ({reason}). Permitted actions: {', '.join(permitted_actions)}."
                )

                severity = "HIGH" if log.action in ("OVERRIDE", "APPROVE", "DELETE") else "MEDIUM"
                confidence = 0.95

                sig = self.build_signal(
                    severity=severity,
                    confidence=confidence,
                    entities=entities,
                    evidence=evidence,
                    explanation=explanation,
                )
                signals.append(sig)

        return signals
