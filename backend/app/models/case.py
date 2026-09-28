from datetime import datetime
from typing import Any, List, Optional
from sqlalchemy import String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.session import Base
from app.utils.time import utc_now

class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    alert_id: Mapped[str] = mapped_column(String(64), ForeignKey("alerts.id"), unique=True, nullable=False, index=True)
    assignee_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(32), default="OPEN", index=True)  # OPEN, IN_REVIEW, ESCALATED, CLOSED_CONFIRMED, CLOSED_FALSE_POSITIVE
    priority: Mapped[str] = mapped_column(String(32), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    notes: Mapped[List[Any]] = mapped_column(JSON, default=list)  # [{"author": "...", "text": "...", "timestamp": "..."}]
    closure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    alert = relationship("Alert", back_populates="case")
