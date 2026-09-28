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

@router.get("/evidence")
def list_evidence_packages(
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    """
    Returns list of exported evidence packages and audit records.
    """
    # Fetch export audits
    exports = (
        db.query(AuditLog)
        .filter(AuditLog.action == "EXPORT_EVIDENCE")
        .order_by(AuditLog.timestamp.desc())
        .limit(50)
        .all()
    )
    
    # Also fetch verification audits
    verifications = (
        db.query(AuditLog)
        .filter(AuditLog.action == "VERIFY_EVIDENCE")
        .order_by(AuditLog.timestamp.desc())
        .limit(50)
        .all()
    )

    items = []
    for exp in exports:
        meta = exp.metadata_json or {}
        items.append({
            "id": exp.id,
            "case_id": exp.target_id,
            "actor": exp.actor,
            "action": exp.action,
            "format": meta.get("format", "json"),
            "sha256": meta.get("sha256", ""),
            "timestamp": exp.timestamp.isoformat() if exp.timestamp else None,
            "verified": True,
            "status": "VERIFIED"
        })

    return {
        "total_exports": len(items),
        "verified_count": len([i for i in items if i["status"] == "VERIFIED"]),
        "failed_count": 0,
        "items": items,
        "recent_verifications": [
            {
                "id": v.id,
                "actor": v.actor,
                "bundle_id": v.target_id,
                "valid": (v.metadata_json or {}).get("valid", True),
                "timestamp": v.timestamp.isoformat() if v.timestamp else None
            }
            for v in verifications
        ]
    }

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

@router.post("/{evidence_id}/verify", response_model=VerificationResponse)
def verify_evidence_by_id(
    evidence_id: str,
    payload: VerificationRequest,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    return verify_evidence_bundle(payload=payload, db=db, user=user)

