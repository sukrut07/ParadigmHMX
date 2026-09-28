from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.time import utc_now

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(64), primary_key=True, index=True)
    pseudonym_id = Column(String(64), unique=True, index=True)
    declared_occupation = Column(String(128), nullable=True)
    declared_income_band = Column(String(64), nullable=True)
    declared_income_min = Column(Float, default=0.0)
    declared_income_max = Column(Float, default=0.0)
    kyc_status = Column(String(32), default="VERIFIED")
    risk_profile = Column(String(32), default="LOW")
    created_at = Column(DateTime, default=utc_now)

    accounts = relationship("Account", back_populates="customer", cascade="all, delete-orphan")
