from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.schemas.signal import EvidenceItem, SignalResponse


class RuleMatch(BaseModel):
    rule: str
    matched: bool
    signals: list[str] = []
    entities: list[str] = []
    description: str | None = None


class RuleTrace(BaseModel):
    rules: list[RuleMatch] = []
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
    primary_signal: str | None = None
    employee_id: str | None = None
    account_id: str | None = None
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
    signal_ids: list[str]
    entity_ids: list[str]
    evidence: list[EvidenceItem]
    evidence_record_ids: list[str]
    rule_trace: dict[str, Any]
    counterfactual: dict[str, Any]
    graph_snapshot: dict[str, Any]
    timeline_snapshot: list[dict[str, Any]]
    signals: list[SignalResponse] | None = []
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlertFilter(BaseModel):
    tier: str | None = None
    status: str | None = None
    signal_type: str | None = None
    employee_id: str | None = None
    account_id: str | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
    limit: int = 50
    offset: int = 0
