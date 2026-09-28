from datetime import datetime
from typing import Any, Dict, Optional
from sqlalchemy import String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.session import Base
from app.utils.time import utc_now

class AccessLog(Base):
    __tablename__ = "access_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    employee_id: Mapped[str] = mapped_column(String(64), ForeignKey("employees.id"), nullable=False, index=True)
    account_id: Mapped[str] = mapped_column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # VIEW, EDIT, APPROVE, OVERRIDE, EXPORT, CREATE, DELETE
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    device_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    branch_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    session_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)

    employee = relationship("Employee", back_populates="access_logs")
    account = relationship("Account", back_populates="access_logs")
