from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SimulationRequest(BaseModel):
    scenario_type: str = Field(..., description="circular, structuring, insider_collusion, privilege_abuse, pass_through, profile_mismatch, hybrid")
    seed: Optional[int] = 42
    intensity: Optional[float] = Field(1.0, ge=0.1, le=5.0)

class SimulationResponse(BaseModel):
    scenario_id: str
    scenario_type: str
    expected_behaviour: str
    generated_records_count: Dict[str, int]
    generated_records_summary: List[Dict[str, Any]]
    detected_signals: List[Dict[str, Any]]
    detected_alerts: List[Dict[str, Any]]
    matched_expected: bool
    summary: str
