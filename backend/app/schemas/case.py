from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CaseNote(BaseModel):
    author: str
    text: str
    timestamp: str

class CaseCreate(BaseModel):
    alert_id: str
    assignee_id: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    initial_note: Optional[str] = None

class CaseUpdate(BaseModel):
    assignee_id: Optional[str] = None
    status: Optional[str] = None  # OPEN, IN_REVIEW, ESCALATED, CLOSED_CONFIRMED, CLOSED_FALSE_POSITIVE
    priority: Optional[str] = None
    note: Optional[str] = None
    closure_reason: Optional[str] = None

class CaseResponse(BaseModel):
    id: str
    alert_id: str
    assignee_id: Optional[str]
    status: str
    priority: str
    notes: List[Dict[str, Any]]
    closure_reason: Optional[str]
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True
