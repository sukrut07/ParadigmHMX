from sqlalchemy import Column, String, DateTime
from app.db.session import Base
from app.utils.time import utc_now

class Device(Base):
    __tablename__ = "devices"

    id = Column(String(64), primary_key=True, index=True)
    pseudonym_id = Column(String(64), unique=True, index=True)
    device_type = Column(String(64), default="DESKTOP")  # DESKTOP, MOBILE, ATM, BRANCH_TERMINAL
    branch_id = Column(String(64), nullable=True)
    first_seen = Column(DateTime, default=utc_now)
    last_seen = Column(DateTime, default=utc_now)
