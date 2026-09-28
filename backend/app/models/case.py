from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.time import utc_now

class Case(Base):
    __tablename__ = "cases"

    id = Column(String(64), primary_key=True, index=True)
    alert_id = Column(String(64), ForeignKey("alerts.id"), unique=True, nullable=False, index=True)
    assignee_id = Column(String(64), nullable=True, index=True)
    status = Column(String(32), default="OPEN", index=True)  # OPEN, IN_REVIEW, ESCALATED, CLOSED_CONFIRMED, CLOSED_FALSE_POSITIVE
    priority = Column(String(32), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    notes = Column(JSON, default=list)  # [{"author": "...", "text": "...", "timestamp": "..."}]
    closure_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    closed_at = Column(DateTime, nullable=True)

    alert = relationship("Alert", back_populates="case")
