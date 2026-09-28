from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.utils.time import utc_now


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    tier: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    signal_ids: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)
    entity_ids: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)
    evidence: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)
    evidence_record_ids: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)
    rule_trace: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    counterfactual: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    graph_snapshot: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    timeline_snapshot: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(
        String(32), default="OPEN", index=True
    )  # OPEN, IN_REVIEW, ESCALATED, CLOSED_CONFIRMED, CLOSED_FALSE_POSITIVE
    dedup_hash: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)

    case = relationship("Case", back_populates="alert", uselist=False, cascade="all, delete-orphan")
