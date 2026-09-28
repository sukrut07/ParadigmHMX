from abc import ABC, abstractmethod
from typing import Any

from sqlalchemy.orm import Session

from app.services.detection.validator import validate_signal
from app.utils.ids import generate_id
from app.utils.time import utc_now


class BaseDetector(ABC):
    name: str = "BaseDetector"
    signal_type: str = "BASE_SIGNAL"

    @abstractmethod
    def detect(
        self,
        db: Session,
        account_id: str | None = None,
        employee_id: str | None = None,
        transaction_id: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Executes detection over database session, optionally filtered by entity.
        Returns list of valid signal dicts.
        """

    def build_signal(
        self,
        severity: str,
        confidence: float,
        entities: list[dict[str, str]],
        evidence: list[dict[str, Any]],
        explanation: str,
        signal_id: str | None = None,
        signal_type: str | None = None,
    ) -> dict[str, Any]:
        """
        Constructs and validates a Signal object.
        """
        record_ids = list({e["record_id"] for e in evidence if "record_id" in e})
        sig = {
            "signal_id": signal_id or generate_id("SIG"),
            "signal_type": signal_type or self.signal_type,
            "severity": severity,
            "confidence": round(confidence, 2),
            "entities": entities,
            "evidence": evidence,
            "evidence_record_ids": record_ids,
            "explanation": explanation,
            "detected_at": utc_now().isoformat(),
        }
        validate_signal(sig)
        return sig
