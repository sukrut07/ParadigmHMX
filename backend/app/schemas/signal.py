from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class EntityRef(BaseModel):
    type: str  # employee, account, customer, device, transaction
    id: str

class EvidenceItem(BaseModel):
    record_type: str  # access_log, account_change, transaction, customer, account, employee
    record_id: str
    field: Optional[str] = None
    value: Optional[Any] = None
    details: Optional[Dict[str, Any]] = None

class SignalBase(BaseModel):
    signal_type: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    entities: List[EntityRef]
    evidence: List[EvidenceItem]
    evidence_record_ids: List[str]
    explanation: str

class SignalCreate(SignalBase):
    signal_id: Optional[str] = None
    detected_at: Optional[datetime] = None

class SignalResponse(SignalBase):
    signal_id: str
    detected_at: datetime

    class Config:
        from_attributes = True
