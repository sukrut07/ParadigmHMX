from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, SecurityContext
from app.api.routes.alerts import list_alerts, get_alert_detail, get_alert_graph, get_alert_timeline
from app.schemas.alert import AlertListItem, AlertDetailResponse
from app.schemas.graph import GraphResponse
from app.schemas.timeline import TimelineResponse

router = APIRouter(prefix="/investigations", tags=["Investigations"])

@router.get("", response_model=List[AlertListItem])
def list_investigations(
    tier: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    employee_id: Optional[str] = Query(None),
    account_id: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    return list_alerts(
        tier=tier,
        status_filter=status_filter,
        employee_id=employee_id,
        account_id=account_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
        db=db,
        user=user
    )

@router.get("/{investigation_id}", response_model=AlertDetailResponse)
def get_investigation_detail(
    investigation_id: str,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    return get_alert_detail(alert_id=investigation_id, db=db, user=user)

@router.get("/{investigation_id}/graph", response_model=GraphResponse)
def get_investigation_graph(
    investigation_id: str,
    depth: int = Query(2, ge=1, le=3),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    return get_alert_graph(alert_id=investigation_id, depth=depth, db=db, user=user)

@router.get("/{investigation_id}/timeline", response_model=TimelineResponse)
def get_investigation_timeline(
    investigation_id: str,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    return get_alert_timeline(alert_id=investigation_id, db=db, user=user)
