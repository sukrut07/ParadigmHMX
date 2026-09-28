from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.time import utc_now

class AccountChange(Base):
    __tablename__ = "account_changes"

    id = Column(String(64), primary_key=True, index=True)
    account_id = Column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    employee_id = Column(String(64), ForeignKey("employees.id"), nullable=False, index=True)
    field = Column(String(64), nullable=False, index=True)  # phone, email, address, KYC, daily_limit, beneficiary, risk_status
    old_value_hash = Column(String(128), nullable=True)
    new_value_hash = Column(String(128), nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)
    reason = Column(String(255), nullable=True)
    approval_required = Column(Boolean, default=False)
    approved_by = Column(String(64), nullable=True)

    account = relationship("Account", back_populates="account_changes")
    employee = relationship("Employee", back_populates="account_changes")
