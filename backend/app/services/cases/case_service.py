from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.case import Case
from app.models.alert import Alert
from app.models.audit import AuditLog
from app.utils.ids import generate_id
from app.utils.time import utc_now

VALID_STATUSES = {"OPEN", "IN_REVIEW", "ESCALATED", "CLOSED_CONFIRMED", "CLOSED_FALSE_POSITIVE"}

class CaseService:
    def __init__(self):
        pass

    def create_case(
        self,
        db: Session,
        alert_id: str,
        actor: str = "ANALYST-1",
        assignee_id: Optional[str] = None,
        priority: str = "MEDIUM",
        initial_note: Optional[str] = None
    ) -> Case:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise ValueError(f"Alert '{alert_id}' does not exist.")

        existing_case = db.query(Case).filter(Case.alert_id == alert_id).first()
        if existing_case:
            return existing_case

        notes = []
        if initial_note:
            notes.append({
                "author": actor,
                "text": initial_note,
                "timestamp": utc_now().isoformat()
            })

        case_id = generate_id("CASE")
        new_case = Case(
            id=case_id,
            alert_id=alert_id,
            assignee_id=assignee_id,
            status="OPEN",
            priority=priority,
            notes=notes,
            created_at=utc_now(),
            updated_at=utc_now()
        )
        db.add(new_case)

        # Audit Log
        audit = AuditLog(
            id=generate_id("AUD"),
            actor=actor,
            action="CREATE_CASE",
            target_type="CASE",
            target_id=case_id,
            metadata_json={"alert_id": alert_id, "priority": priority, "assignee": assignee_id},
            timestamp=utc_now()
        )
        db.add(audit)

        db.commit()
        db.refresh(new_case)
        return new_case

    def update_case(
        self,
        db: Session,
        case_id: str,
        actor: str = "REVIEWER-1",
        status: Optional[str] = None,
        assignee_id: Optional[str] = None,
        priority: Optional[str] = None,
        note: Optional[str] = None,
        closure_reason: Optional[str] = None
    ) -> Case:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError(f"Case '{case_id}' does not exist.")

        audit_actions: list[tuple[str, dict[str, Any]]] = []

        if assignee_id and assignee_id != case.assignee_id:
            case.assignee_id = assignee_id
            audit_actions.append(("ASSIGN_CASE", {"new_assignee": assignee_id}))

        if priority and priority != case.priority:
            case.priority = priority
            audit_actions.append(("CHANGE_PRIORITY", {"new_priority": priority}))

        if note:
            raw_notes = case.notes
            case_notes = list(raw_notes) if isinstance(raw_notes, list) else []
            case_notes.append({
                "author": actor,
                "text": note,
                "timestamp": utc_now().isoformat()
            })
            case.notes = case_notes
            audit_actions.append(("ADD_NOTE", {"text": note}))

        if status and status != case.status:
            if status not in VALID_STATUSES:
                raise ValueError(f"Invalid status '{status}'. Must be one of {VALID_STATUSES}")

            # Business rules for closure
            if status in ("CLOSED_CONFIRMED", "CLOSED_FALSE_POSITIVE"):
                if not closure_reason or len(closure_reason.strip()) < 5:
                    raise ValueError(f"Status transition to '{status}' requires a detailed 'closure_reason'.")
                if status == "CLOSED_CONFIRMED" and not note:
                    raise ValueError("Closing case as CONFIRMED requires a reviewer note documenting evidence findings.")
                case.closure_reason = closure_reason
                case.closed_at = utc_now()
            
            case.status = status
            audit_actions.append(("CHANGE_STATUS", {"new_status": status, "closure_reason": closure_reason}))

        case.updated_at = utc_now()

        for action_name, meta in audit_actions:
            audit = AuditLog(
                id=generate_id("AUD"),
                actor=actor,
                action=action_name,
                target_type="CASE",
                target_id=case.id,
                metadata_json=meta,
                timestamp=utc_now()
            )
            db.add(audit)

        db.commit()
        db.refresh(case)
        return case
