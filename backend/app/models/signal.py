from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.utils.time import utc_now


class Signal(Base):
    __tablename__ = "signals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    signal_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    entities: Mapped[list[Any]] = mapped_column(
        JSON, nullable=False, default=list
    )  # [{"type": "employee", "id": "EMP-017"}]
    evidence: Mapped[list[Any]] = mapped_column(
        JSON, nullable=False, default=list
    )  # [{"record_type": "...", "record_id": "...", "field": "...", "value": "..."}]
    evidence_record_ids: Mapped[list[Any]] = mapped_column(JSON, nullable=False, default=list)  # ["LOG-1", "TX-2"]
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
