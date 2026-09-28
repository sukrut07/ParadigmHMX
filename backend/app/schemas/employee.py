from typing import List, Dict, Any, Optional
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
    role_name: Optional[str] = None
    accounts_touched: List[str]
    customers_touched: List[str]
    devices_used: List[str]
    actions_performed: Dict[str, int]  # e.g. {"VIEW": 10, "OVERRIDE": 2}
    transactions_following_actions: List[Dict[str, Any]]
    alerts_involved: List[str]
    suspicious_accounts: List[str]
    risk_clusters: List[Dict[str, Any]]
    timeline: List[TimelineEvent]
    total_actions_count: int
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
