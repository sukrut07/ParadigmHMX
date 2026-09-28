from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.time import utc_now

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True, index=True)
    from_account_id = Column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    to_account_id = Column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False, index=True)
    currency = Column(String(8), default="INR")
    channel = Column(String(32), default="UPI", index=True)  # UPI, NEFT, RTGS, BRANCH, INTERNAL, PAYROLL
    timestamp = Column(DateTime, default=utc_now, index=True)
    initiated_by_employee_id = Column(String(64), nullable=True, index=True)
    device_id = Column(String(64), nullable=True, index=True)
    status = Column(String(32), default="COMPLETED")
    reference = Column(String(255), nullable=True)

    from_account = relationship("Account", foreign_keys=[from_account_id], back_populates="transactions_out")
    to_account = relationship("Account", foreign_keys=[to_account_id], back_populates="transactions_in")
