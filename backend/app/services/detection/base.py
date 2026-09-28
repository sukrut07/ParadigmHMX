from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.utils.ids import generate_id
from app.utils.time import utc_now
from app.services.detection.validator import validate_signal

class BaseDetector(ABC):
    name: str = "BaseDetector"
    signal_type: str = "BASE_SIGNAL"

    @abstractmethod
    def detect(
        self,
        db: Session,
        account_id: Optional[str] = None,
        employee_id: Optional[str] = None,
        transaction_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Executes detection over database session, optionally filtered by entity.
        Returns list of valid signal dicts.
        """
        pass

    def build_signal(
        self,
        severity: str,
        confidence: float,
        entities: List[Dict[str, str]],
        evidence: List[Dict[str, Any]],
        explanation: str,
        signal_id: Optional[str] = None,
        signal_type: Optional[str] = None,
    ) -> Dict[str, Any]:
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
