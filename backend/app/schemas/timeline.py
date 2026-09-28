from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class TimelineEvent(BaseModel):
    event_id: str
    event_type: str  # ACCESS_LOG, ACCOUNT_CHANGE, TRANSACTION, APPROVAL, OVERRIDE
    timestamp: str
    actor: Optional[str] = None
    entity: str
    description: str
    severity: str = "INFO"  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    source_record_id: str
    metadata: Optional[Dict[str, Any]] = None

class TimelineResponse(BaseModel):
    events: List[TimelineEvent]
    total_events: int
