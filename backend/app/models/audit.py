from datetime import datetime
from typing import Any, Dict
from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
from app.utils.time import utc_now

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    actor: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # VIEW_ALERT, CREATE_CASE, ASSIGN_CASE, CHANGE_STATUS, ADD_NOTE, EXPORT_EVIDENCE, VERIFY_EVIDENCE, VIEW_BLAST_RADIUS, UNMASK_PII
    target_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    target_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
