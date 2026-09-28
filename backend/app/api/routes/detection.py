from typing import Any

from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session

from app.api.deps import SecurityContext, get_db, require_role
from app.services.correlation.linker import CorrelationLinker
from app.services.detection.engine import DetectionEngine
from app.utils.ids import generate_id

router = APIRouter(prefix="/detection", tags=["Detection Pipeline"])

engine = DetectionEngine()
linker = CorrelationLinker()


@router.post("/run")
def run_detection_pipeline(
    payload: dict[str, Any] = Body(default={"detectors": ["all"]}),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(require_role(["ANALYST", "REVIEWER", "ADMIN"])),
):
    """
    Triggers end-to-end detection, correlation, tiering, and alert generation pipeline.
    """
    run_id = generate_id("RUN")

    # 1. Run detection
    det_res = engine.run_all(db=db, persist=True)
    signals = det_res["signals"]

    # 2. Correlate and generate alerts
    alerts = linker.correlate_and_generate_alerts(db=db, signals=signals)

    return {
        "run_id": run_id,
        "signals_generated": len(signals),
        "alerts_generated": len(alerts),
        "duration_seconds": det_res["duration_seconds"],
        "detector_summary": det_res["detector_summary"],
        "alerts_summary": [{"id": a.id, "tier": a.tier, "title": a.title} for a in alerts],
    }
