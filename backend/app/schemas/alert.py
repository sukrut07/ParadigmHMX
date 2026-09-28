from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.signal import SignalResponse, EvidenceItem

class RuleMatch(BaseModel):
    rule: str
    matched: bool
    signals: List[str] = []
    entities: List[str] = []
    description: Optional[str] = None

class RuleTrace(BaseModel):
    rules: List[RuleMatch] = []
    human_explanation: str = ""

class CounterfactualExplanation(BaseModel):
    condition_changed: str
    original_tier: str
    counterfactual_tier: str
    explanation: str

class AlertListItem(BaseModel):
    id: str
    tier: str
    title: str
    summary: str
    primary_signal: Optional[str] = None
    employee_id: Optional[str] = None
    account_id: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AlertDetailResponse(BaseModel):
    id: str
    tier: str
    title: str
    summary: str
    signal_ids: List[str]
    entity_ids: List[str]
    evidence: List[EvidenceItem]
    evidence_record_ids: List[str]
    rule_trace: Dict[str, Any]
    counterfactual: Dict[str, Any]
    graph_snapshot: Dict[str, Any]
    timeline_snapshot: List[Dict[str, Any]]
    signals: Optional[List[SignalResponse]] = []
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AlertFilter(BaseModel):
    tier: Optional[str] = None
    status: Optional[str] = None
    signal_type: Optional[str] = None
    employee_id: Optional[str] = None
    account_id: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = 50
    offset: int = 0
