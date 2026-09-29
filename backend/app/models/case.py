from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.utils.time import utc_now


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    alert_id: Mapped[str] = mapped_column(String(64), ForeignKey("alerts.id"), unique=True, nullable=False, index=True)
    assignee_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    status: Mapped[str] = mapped_column(
        String(32), default="OPEN", index=True
    )  # OPEN, IN_REVIEW, ESCALATED, CLOSED_CONFIRMED, CLOSED_FALSE_POSITIVE
    priority: Mapped[str] = mapped_column(String(32), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    notes: Mapped[list[Any]] = mapped_column(
        JSON, default=list
    )  # [{"author": "...", "text": "...", "timestamp": "..."}]
    closure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    alert = relationship("Alert", back_populates="case")

    @property
    def title(self) -> str:
        return self.alert.title if self.alert else f"Investigation Case {self.id}"

    @property
    def assigned_to(self) -> str | None:
        return self.assignee_id

    @property
    def notes_json(self) -> list[Any]:
        return self.notes if isinstance(self.notes, list) else []
