from typing import Any

from pydantic import BaseModel

from app.schemas.timeline import TimelineEvent


class EmployeeBase(BaseModel):
    id: str
    pseudonym_id: str
    role_id: str
    branch_id: str
    normal_work_start: str
    normal_work_end: str
    status: str

    class Config:
        from_attributes = True


class BlastRadiusResponse(BaseModel):
    employee: EmployeeBase
    role_name: str | None = None
    accounts_touched: list[str]
    customers_touched: list[str]
    devices_used: list[str]
    actions_performed: dict[str, int]  # e.g. {"VIEW": 10, "OVERRIDE": 2}
    transactions_following_actions: list[dict[str, Any]]
    alerts_involved: list[str]
    suspicious_accounts: list[str]
    risk_clusters: list[dict[str, Any]]
    timeline: list[TimelineEvent]
    total_actions_count: int
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
