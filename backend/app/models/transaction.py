from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.utils.time import utc_now


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    from_account_id: Mapped[str] = mapped_column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    to_account_id: Mapped[str] = mapped_column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    currency: Mapped[str] = mapped_column(String(8), default="INR")
    channel: Mapped[str] = mapped_column(
        String(32), default="UPI", index=True
    )  # UPI, NEFT, RTGS, BRANCH, INTERNAL, PAYROLL
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)
    initiated_by_employee_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    device_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(32), default="COMPLETED")
    reference: Mapped[str | None] = mapped_column(String(255), nullable=True)

    from_account = relationship("Account", foreign_keys=[from_account_id], back_populates="transactions_out")
    to_account = relationship("Account", foreign_keys=[to_account_id], back_populates="transactions_in")
