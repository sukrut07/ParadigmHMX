from typing import Any

from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    scenario_type: str = Field(
        ...,
        description="circular, structuring, insider_collusion, privilege_abuse, pass_through, profile_mismatch, hybrid",
    )
    seed: int | None = 42
    intensity: float | None = Field(1.0, ge=0.1, le=5.0)


class SimulationResponse(BaseModel):
    scenario_id: str
    scenario_type: str
    expected_behaviour: str
    generated_records_count: dict[str, int]
    generated_records_summary: list[dict[str, Any]]
    detected_signals: list[dict[str, Any]]
    detected_alerts: list[dict[str, Any]]
    matched_expected: bool
    summary: str
