from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.utils.time import utc_now


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    pseudonym_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    role_id: Mapped[str] = mapped_column(String(64), ForeignKey("roles.id"), nullable=False, index=True)
    branch_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    normal_work_start: Mapped[str] = mapped_column(String(8), default="09:00")  # HH:MM format
    normal_work_end: Mapped[str] = mapped_column(String(8), default="18:00")  # HH:MM format
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")

    role = relationship("Role", back_populates="employees")
    access_logs = relationship("AccessLog", back_populates="employee")
    account_changes = relationship("AccountChange", back_populates="employee")
