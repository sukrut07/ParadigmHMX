from sqlalchemy import Column, String, DateTime, JSON
from app.db.session import Base
from app.utils.time import utc_now

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    actor = Column(String(64), nullable=False, index=True)
    action = Column(String(64), nullable=False, index=True)  # VIEW_ALERT, CREATE_CASE, ASSIGN_CASE, CHANGE_STATUS, ADD_NOTE, EXPORT_EVIDENCE, VERIFY_EVIDENCE, VIEW_BLAST_RADIUS, UNMASK_PII
    target_type = Column(String(64), nullable=False, index=True)
    target_id = Column(String(64), nullable=False, index=True)
    metadata_json = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=utc_now, index=True)
