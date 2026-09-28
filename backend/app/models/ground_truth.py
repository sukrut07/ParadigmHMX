from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.utils.time import utc_now


class GroundTruth(Base):
    __tablename__ = "ground_truth"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    entity_type: Mapped[str] = mapped_column(
        String(32), nullable=False, index=True
    )  # account, employee, transaction, scenario
    entity_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # suspicious, legitimate
    scenario_type: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True
    )  # circular, structuring, rapid_passthrough, profile_mismatch, insider_collusion, bulk_lookup, privilege_abuse, payroll_legitimate, normal
    scenario_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
