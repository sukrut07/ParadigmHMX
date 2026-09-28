from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.utils.time import utc_now


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    customer_id: Mapped[str] = mapped_column(String(64), ForeignKey("customers.id"), nullable=False, index=True)
    account_type: Mapped[str] = mapped_column(String(32), default="SAVINGS")  # SAVINGS, CURRENT, PAYROLL
    branch_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")  # ACTIVE, DORMANT, FROZEN
    daily_limit: Mapped[float] = mapped_column(Float, default=100000.0)
    currency: Mapped[str] = mapped_column(String(8), default="INR")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    customer = relationship("Customer", back_populates="accounts")
    transactions_out = relationship(
        "Transaction", foreign_keys="Transaction.from_account_id", back_populates="from_account"
    )
    transactions_in = relationship("Transaction", foreign_keys="Transaction.to_account_id", back_populates="to_account")
    access_logs = relationship("AccessLog", back_populates="account")
    account_changes = relationship("AccountChange", back_populates="account")
