from sqlalchemy import Column, String, DateTime
from app.db.session import Base
from app.utils.time import utc_now

class GroundTruth(Base):
    __tablename__ = "ground_truth"

    id = Column(String(64), primary_key=True, index=True)
    entity_type = Column(String(32), nullable=False, index=True)  # account, employee, transaction, scenario
    entity_id = Column(String(64), nullable=False, index=True)
    label = Column(String(32), nullable=False, index=True)        # suspicious, legitimate
    scenario_type = Column(String(64), nullable=False, index=True) # circular, structuring, rapid_passthrough, profile_mismatch, insider_collusion, bulk_lookup, privilege_abuse, payroll_legitimate, normal
    scenario_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now)
