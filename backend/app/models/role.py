from typing import Any

from sqlalchemy import JSON, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    permitted_actions: Mapped[list[Any]] = mapped_column(
        JSON, default=list
    )  # ["VIEW", "EDIT", "APPROVE", "OVERRIDE", ...]
    permitted_branches: Mapped[list[Any]] = mapped_column(JSON, default=list)  # ["BR-01", ...] or ["*"]
    privilege_level: Mapped[int] = mapped_column(Integer, default=1)

    employees = relationship("Employee", back_populates="role")
