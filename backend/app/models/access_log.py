from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.time import utc_now

class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(String(64), primary_key=True, index=True)
    employee_id = Column(String(64), ForeignKey("employees.id"), nullable=False, index=True)
    account_id = Column(String(64), ForeignKey("accounts.id"), nullable=False, index=True)
    action = Column(String(32), nullable=False, index=True)  # VIEW, EDIT, APPROVE, OVERRIDE, EXPORT, CREATE, DELETE
    timestamp = Column(DateTime, default=utc_now, index=True)
    device_id = Column(String(64), nullable=True)
    branch_id = Column(String(64), nullable=True)
    session_id = Column(String(64), nullable=True)
    metadata_json = Column(JSON, default=dict)

    employee = relationship("Employee", back_populates="access_logs")
    account = relationship("Account", back_populates="access_logs")
