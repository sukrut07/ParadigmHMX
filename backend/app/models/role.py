from sqlalchemy import Column, String, Integer, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), unique=True, index=True)
    permitted_actions = Column(JSON, default=list)  # ["VIEW", "EDIT", "APPROVE", "OVERRIDE", ...]
    permitted_branches = Column(JSON, default=list) # ["BR-01", ...] or ["*"]
    privilege_level = Column(Integer, default=1)

    employees = relationship("Employee", back_populates="role")
