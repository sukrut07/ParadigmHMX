from typing import Any

from pydantic import BaseModel


class TimelineEvent(BaseModel):
    event_id: str
    event_type: str  # ACCESS_LOG, ACCOUNT_CHANGE, TRANSACTION, APPROVAL, OVERRIDE
    timestamp: str
    actor: str | None = None
    entity: str
    description: str
    severity: str = "INFO"  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    source_record_id: str
    metadata: dict[str, Any] | None = None


class TimelineResponse(BaseModel):
    events: list[TimelineEvent]
    total_events: int
