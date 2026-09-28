from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from app.db.session import Base
from app.utils.time import utc_now

class Signal(Base):
    __tablename__ = "signals"

    id = Column(String(64), primary_key=True, index=True)
    signal_type = Column(String(64), nullable=False, index=True)
    severity = Column(String(32), nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, nullable=False, default=1.0)
    entities = Column(JSON, nullable=False, default=list)  # [{"type": "employee", "id": "EMP-017"}]
    evidence = Column(JSON, nullable=False, default=list)  # [{"record_type": "...", "record_id": "...", "field": "...", "value": "..."}]
    evidence_record_ids = Column(JSON, nullable=False, default=list) # ["LOG-1", "TX-2"]
    explanation = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=utc_now, index=True)
