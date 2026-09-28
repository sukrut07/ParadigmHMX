from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class EntityRef(BaseModel):
    type: str  # employee, account, customer, device, transaction
    id: str


class EvidenceItem(BaseModel):
    record_type: str  # access_log, account_change, transaction, customer, account, employee
    record_id: str
    field: str | None = None
    value: Any | None = None
    details: dict[str, Any] | None = None


class SignalBase(BaseModel):
    signal_type: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    entities: list[EntityRef]
    evidence: list[EvidenceItem]
    evidence_record_ids: list[str]
    explanation: str


class SignalCreate(SignalBase):
    signal_id: str | None = None
    detected_at: datetime | None = None


class SignalResponse(SignalBase):
    signal_id: str
    detected_at: datetime

    class Config:
        from_attributes = True
