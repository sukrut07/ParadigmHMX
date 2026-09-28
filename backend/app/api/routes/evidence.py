from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, SecurityContext
from app.schemas.evidence import VerificationRequest, VerificationResponse
from app.services.evidence.exporter import EvidenceExporter
from app.models.audit import AuditLog
from app.utils.ids import generate_id
from app.utils.time import utc_now

router = APIRouter(tags=["Evidence & Export"])

exporter = EvidenceExporter()

@router.post("/evidence/verify", response_model=VerificationResponse)
@router.post("/export/verify", response_model=VerificationResponse)
def verify_evidence_bundle(
    payload: VerificationRequest,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    """
    Verifies the cryptographic SHA-256 tamper-evident integrity of an exported evidence package.
    """
    is_valid, computed_hash, expected_hash = exporter.verify_bundle(payload.bundle, payload.hash)

    # Audit verification check
    audit = AuditLog(
        id=generate_id("AUD"),
        actor=user.user_id,
        action="VERIFY_EVIDENCE",
        target_type="BUNDLE",
        target_id=payload.bundle.get("bundle_id", "UNKNOWN"),
        metadata_json={"valid": is_valid, "expected": expected_hash, "computed": computed_hash},
        timestamp=utc_now()
    )
    db.add(audit)
    db.commit()

    message = "Integrity check passed. Evidence bundle is authentic and unmodified." if is_valid else "Hash mismatch! Evidence bundle has been tampered with or modified."

    return VerificationResponse(
        valid=is_valid,
        expected_hash=expected_hash,
        computed_hash=computed_hash,
        message=message
    )
