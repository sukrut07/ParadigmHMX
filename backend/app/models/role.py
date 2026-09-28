from typing import Any, List
from sqlalchemy import String, Integer, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.session import Base

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    permitted_actions: Mapped[List[Any]] = mapped_column(JSON, default=list)  # ["VIEW", "EDIT", "APPROVE", "OVERRIDE", ...]
    permitted_branches: Mapped[List[Any]] = mapped_column(JSON, default=list) # ["BR-01", ...] or ["*"]
    privilege_level: Mapped[int] = mapped_column(Integer, default=1)

    employees = relationship("Employee", back_populates="role")
