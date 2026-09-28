from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, SecurityContext, require_role
from app.models.case import Case
from app.models.alert import Alert
from app.models.audit import AuditLog
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse
from app.schemas.evidence import ExportResponse
from app.services.cases.case_service import CaseService
from app.services.evidence.exporter import EvidenceExporter
from app.utils.ids import generate_id
from app.utils.time import utc_now

router = APIRouter(prefix="/cases", tags=["Cases"])

case_service = CaseService()
evidence_exporter = EvidenceExporter()

@router.get("", response_model=List[CaseResponse])
def list_cases(
    status_filter: Optional[str] = Query(None, alias="status"),
    assignee_id: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    query = db.query(Case)
    if status_filter:
        query = query.filter(Case.status == status_filter.upper())
    if assignee_id:
        query = query.filter(Case.assignee_id == assignee_id)
    if priority:
        query = query.filter(Case.priority == priority.upper())

    cases = query.order_by(Case.created_at.desc()).offset(offset).limit(limit).all()
    return cases

@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "CASE_NOT_FOUND", "message": f"Case '{case_id}' does not exist."}}
        )
    return case

@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(require_role(["ANALYST", "REVIEWER", "ADMIN"]))
):
    try:
        new_case = case_service.create_case(
            db=db,
            alert_id=payload.alert_id,
            actor=user.user_id,
            assignee_id=payload.assignee_id,
            priority=payload.priority or "MEDIUM",
            initial_note=payload.initial_note
        )
        return new_case
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": {"code": "CASE_CREATION_FAILED", "message": str(e)}})

@router.patch("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    payload: CaseUpdate,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(require_role(["REVIEWER", "ADMIN"]))
):
    try:
        updated = case_service.update_case(
            db=db,
            case_id=case_id,
            actor=user.user_id,
            status=payload.status,
            assignee_id=payload.assignee_id,
            priority=payload.priority,
            note=payload.note,
            closure_reason=payload.closure_reason
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": {"code": "CASE_UPDATE_FAILED", "message": str(e)}})

@router.post("/{case_id}/notes", response_model=CaseResponse)
def add_case_note(
    case_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(require_role(["ANALYST", "REVIEWER", "ADMIN"]))
):
    note_text = payload.get("note") or payload.get("text")
    if not note_text:
        raise HTTPException(status_code=400, detail="Note text is required.")
    try:
        updated = case_service.update_case(
            db=db,
            case_id=case_id,
            actor=user.user_id,
            note=note_text
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": {"code": "CASE_NOTE_FAILED", "message": str(e)}})

@router.get("/{case_id}/export")
def export_case_evidence(
    case_id: str,
    format: str = Query("json", description="json or pdf"),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(require_role(["AUDITOR", "REVIEWER", "ADMIN"]))
):
    """
    Generates canonical tamper-evident JSON bundle with SHA-256 hash, or downloadable PDF dossier.
    """
    try:
        bundle, sha256_hash = evidence_exporter.export_canonical_bundle(db, case_id)
        
        # Log export audit
        audit = AuditLog(
            id=generate_id("AUD"),
            actor=user.user_id,
            action="EXPORT_EVIDENCE",
            target_type="CASE",
            target_id=case_id,
            metadata_json={"format": format, "sha256": sha256_hash},
            timestamp=utc_now()
        )
        db.add(audit)
        db.commit()

        if format.lower() == "pdf":
            pdf_bytes = evidence_exporter.generate_pdf_report(bundle)
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename=evidence_case_{case_id}.pdf",
                    "X-Payload-SHA256": sha256_hash
                }
            )

        return ExportResponse(
            bundle_id=bundle["bundle_id"],
            sha256=sha256_hash,
            generated_at=bundle["generated_at"],
            bundle=bundle
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"error": {"code": "EXPORT_FAILED", "message": str(e)}})
