from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.time import utc_now

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(64), primary_key=True, index=True)
    tier = Column(String(32), nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    signal_ids = Column(JSON, nullable=False, default=list)
    entity_ids = Column(JSON, nullable=False, default=list)
    evidence = Column(JSON, nullable=False, default=list)
    evidence_record_ids = Column(JSON, nullable=False, default=list)
    rule_trace = Column(JSON, nullable=False, default=dict)
    counterfactual = Column(JSON, nullable=False, default=dict)
    graph_snapshot = Column(JSON, nullable=False, default=dict)
    timeline_snapshot = Column(JSON, nullable=False, default=list)
    status = Column(String(32), default="OPEN", index=True)  # OPEN, IN_REVIEW, ESCALATED, CLOSED_CONFIRMED, CLOSED_FALSE_POSITIVE
    dedup_hash = Column(String(128), index=True, nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    case = relationship("Case", back_populates="alert", uselist=False, cascade="all, delete-orphan")
