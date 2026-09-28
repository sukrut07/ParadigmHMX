from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.session import Base
from app.utils.time import utc_now

class AccountChange(Base):
    __tablename__ = "account_changes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    account_id: Mapped[str] = mapped_column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    employee_id: Mapped[str] = mapped_column(String(64), ForeignKey("employees.id"), nullable=False, index=True)
    field: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # phone, email, address, KYC, daily_limit, beneficiary, risk_status
    old_value_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    new_value_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    approval_required: Mapped[bool] = mapped_column(Boolean, default=False)
    approved_by: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    account = relationship("Account", back_populates="account_changes")
    employee = relationship("Employee", back_populates="account_changes")
