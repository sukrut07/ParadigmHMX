from datetime import datetime
from typing import Any

from pydantic import BaseModel


class CaseNote(BaseModel):
    author: str
    text: str
    timestamp: str


class CaseCreate(BaseModel):
    alert_id: str
    assignee_id: str | None = None
    priority: str | None = "MEDIUM"
    initial_note: str | None = None


class CaseUpdate(BaseModel):
    assignee_id: str | None = None
    assigned_to: str | None = None
    status: str | None = None  # OPEN, IN_REVIEW, ESCALATED, CLOSED_CONFIRMED, CLOSED_FALSE_POSITIVE
    priority: str | None = None
    note: str | None = None
    closure_reason: str | None = None


class CaseResponse(BaseModel):
    id: str
    alert_id: str
    title: str | None = None
    assignee_id: str | None = None
    assigned_to: str | None = None
    status: str
    priority: str
    notes: list[dict[str, Any]] = []
    notes_json: list[dict[str, Any]] = []
    closure_reason: str | None = None
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None = None

    class Config:
        from_attributes = True
