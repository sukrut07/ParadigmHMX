import time
from typing import Any

from sqlalchemy.orm import Session

from app.models.signal import Signal
from app.services.detection.action_transaction import ActionTransactionDetector
from app.services.detection.bulk_lookup import BulkLookupDetector
from app.services.detection.circular_transfer import CircularTransferDetector
from app.services.detection.off_hours import OffHoursDetector
from app.services.detection.out_of_role import OutOfRoleDetector
from app.services.detection.privilege_abuse import PrivilegeAbuseDetector
from app.services.detection.profile_mismatch import ProfileMismatchDetector
from app.services.detection.rapid_passthrough import RapidPassThroughDetector
from app.services.detection.structuring import StructuringDetector
from app.utils.time import parse_iso

ALL_DETECTORS = [
    CircularTransferDetector(),
    StructuringDetector(),
    RapidPassThroughDetector(),
    ProfileMismatchDetector(),
    OutOfRoleDetector(),
    OffHoursDetector(),
    BulkLookupDetector(),
    PrivilegeAbuseDetector(),
    ActionTransactionDetector(),
]


class DetectionEngine:
    def __init__(self, detectors: list[Any] | None = None):
        self.detectors = detectors or ALL_DETECTORS

    def run_all(
        self,
        db: Session,
        account_id: str | None = None,
        employee_id: str | None = None,
        transaction_id: str | None = None,
        persist: bool = True,
    ) -> dict[str, Any]:
        start_time = time.time()
        all_signals = []
        detector_summary = {}

        for detector in self.detectors:
            det_start = time.time()
            sigs = detector.detect(db=db, account_id=account_id, employee_id=employee_id, transaction_id=transaction_id)
            duration = time.time() - det_start
            detector_summary[detector.name] = {"signals_count": len(sigs), "duration_seconds": round(duration, 4)}
            all_signals.extend(sigs)

        if persist:
            self._persist_signals(db, all_signals)

        total_duration = time.time() - start_time
        return {
            "signals": all_signals,
            "total_signals": len(all_signals),
            "detector_summary": detector_summary,
            "duration_seconds": round(total_duration, 4),
        }

    def run_detector(self, db: Session, detector_name: str, persist: bool = True) -> list[dict[str, Any]]:
        target = next((d for d in self.detectors if d.name.lower() == detector_name.lower()), None)
        if not target:
            raise ValueError(f"Detector '{detector_name}' not found. Available: {[d.name for d in self.detectors]}")
        sigs = target.detect(db=db)
        if persist:
            self._persist_signals(db, sigs)
        return sigs

    def _persist_signals(self, db: Session, signals: list[dict[str, Any]]):
        for s in signals:
            existing = db.query(Signal).filter(Signal.id == s["signal_id"]).first()
            if not existing:
                sig_record = Signal(
                    id=s["signal_id"],
                    signal_type=s["signal_type"],
                    severity=s["severity"],
                    confidence=s["confidence"],
                    entities=s["entities"],
                    evidence=s["evidence"],
                    evidence_record_ids=s["evidence_record_ids"],
                    explanation=s["explanation"],
                    detected_at=parse_iso(s["detected_at"]),
                )
                db.add(sig_record)
        db.commit()
