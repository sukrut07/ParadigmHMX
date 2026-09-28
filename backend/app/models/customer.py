from datetime import datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.utils.time import utc_now


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    pseudonym_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    declared_occupation: Mapped[str | None] = mapped_column(String(128), nullable=True)
    declared_income_band: Mapped[str | None] = mapped_column(String(64), nullable=True)
    declared_income_min: Mapped[float] = mapped_column(Float, default=0.0)
    declared_income_max: Mapped[float] = mapped_column(Float, default=0.0)
    kyc_status: Mapped[str] = mapped_column(String(32), default="VERIFIED")
    risk_profile: Mapped[str] = mapped_column(String(32), default="LOW")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    accounts = relationship("Account", back_populates="customer", cascade="all, delete-orphan")
