from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import SecurityContext, get_current_user, get_db
from app.api.routes.alerts import (
    get_alert_detail,
    get_alert_graph,
    get_alert_timeline,
    list_alerts,
)
from app.schemas.alert import AlertDetailResponse, AlertListItem
from app.schemas.graph import GraphResponse
from app.schemas.timeline import TimelineResponse

router = APIRouter(prefix="/investigations", tags=["Investigations"])


@router.get("", response_model=list[AlertListItem])
def list_investigations(
    tier: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    employee_id: str | None = Query(None),
    account_id: str | None = Query(None),
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user),
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
        user=user,
    )


@router.get("/{investigation_id}", response_model=AlertDetailResponse)
def get_investigation_detail(
    investigation_id: str, db: Session = Depends(get_db), user: SecurityContext = Depends(get_current_user)
):
    return get_alert_detail(alert_id=investigation_id, db=db, user=user)


@router.get("/{investigation_id}/graph", response_model=GraphResponse)
def get_investigation_graph(
    investigation_id: str,
    depth: int = Query(2, ge=1, le=3),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user),
):
    return get_alert_graph(alert_id=investigation_id, depth=depth, db=db, user=user)


@router.get("/{investigation_id}/timeline", response_model=TimelineResponse)
def get_investigation_timeline(
    investigation_id: str, db: Session = Depends(get_db), user: SecurityContext = Depends(get_current_user)
):
    return get_alert_timeline(alert_id=investigation_id, db=db, user=user)
