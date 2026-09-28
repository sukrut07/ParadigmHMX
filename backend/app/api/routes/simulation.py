from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, SecurityContext, require_role
from app.schemas.simulation import SimulationRequest, SimulationResponse
from app.services.simulation.red_team import RedTeamSimulator

router = APIRouter(prefix="/simulate", tags=["Red-Team Simulator"])

simulator = RedTeamSimulator()

@router.post("", response_model=SimulationResponse)
def run_red_team_simulation(
    payload: SimulationRequest,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(require_role(["ANALYST", "REVIEWER", "ADMIN"]))
):
    """
    Synthesizes and executes live adversary scenario attacks to validate detector resilience.
    Supported types: circular, structuring, insider_collusion, privilege_abuse, pass_through, profile_mismatch, hybrid.
    """
    valid_scenarios = {"circular", "structuring", "insider_collusion", "privilege_abuse", "pass_through", "profile_mismatch", "hybrid"}
    if payload.scenario_type.lower() not in valid_scenarios:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scenario_type '{payload.scenario_type}'. Valid choices: {list(valid_scenarios)}"
        )

    res = simulator.simulate(
        db=db,
        scenario_type=payload.scenario_type.lower(),
        seed=payload.seed or 42,
        intensity=payload.intensity or 1.0
    )
    return SimulationResponse(**res)
