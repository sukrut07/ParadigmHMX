from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.time import utc_now

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(64), primary_key=True, index=True)
    pseudonym_id = Column(String(64), unique=True, index=True)
    role_id = Column(String(64), ForeignKey("roles.id"), nullable=False, index=True)
    branch_id = Column(String(64), nullable=False, index=True)
    joined_at = Column(DateTime, default=utc_now)
    normal_work_start = Column(String(8), default="09:00")  # HH:MM format
    normal_work_end = Column(String(8), default="18:00")    # HH:MM format
    status = Column(String(32), default="ACTIVE")

    role = relationship("Role", back_populates="employees")
    access_logs = relationship("AccessLog", back_populates="employee")
    account_changes = relationship("AccountChange", back_populates="employee")
