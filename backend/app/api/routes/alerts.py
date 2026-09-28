from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, SecurityContext
from app.models.alert import Alert
from app.models.signal import Signal
from app.models.audit import AuditLog
from app.schemas.alert import AlertListItem, AlertDetailResponse
from app.schemas.graph import GraphResponse
from app.schemas.timeline import TimelineResponse
from app.services.graph.builder import GraphBuilder
from app.services.timeline.builder import TimelineBuilder
from app.utils.ids import generate_id
from app.utils.time import utc_now

router = APIRouter(prefix="/alerts", tags=["Alerts"])

graph_builder = GraphBuilder()
timeline_builder = TimelineBuilder()

@router.get("", response_model=List[AlertListItem])
def list_alerts(
    tier: Optional[str] = Query(None, description="LOW, MEDIUM, HIGH, CRITICAL"),
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
    """
    List alerts with multi-dimensional filtering, pagination, and sorting.
    """
    query = db.query(Alert)

    if tier:
        query = query.filter(Alert.tier == tier.upper())
    if status_filter:
        query = query.filter(Alert.status == status_filter.upper())
    if date_from:
        query = query.filter(Alert.created_at >= date_from)
    if date_to:
        query = query.filter(Alert.created_at <= date_to)

    alerts = query.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()

    # In-memory filter for entity ids in JSON array
    filtered = []
    for a in alerts:
        if employee_id and employee_id not in a.entity_ids:
            continue
        if account_id and account_id not in a.entity_ids:
            continue

        primary_emp = next((e for e in a.entity_ids if e.startswith("EMP-")), None)
        primary_acc = next((e for e in a.entity_ids if e.startswith("ACC-")), None)

        filtered.append(AlertListItem(
            id=a.id,
            tier=a.tier,
            title=a.title,
            summary=a.summary,
            primary_signal=a.signal_ids[0] if a.signal_ids else None,
            employee_id=primary_emp,
            account_id=primary_acc,
            status=a.status,
            created_at=a.created_at,
            updated_at=a.updated_at
        ))

    return filtered

@router.get("/{alert_id}", response_model=AlertDetailResponse)
def get_alert_detail(
    alert_id: str,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    """
    Returns complete investigation dossier for an alert:
    Evidence, rule trace, counterfactuals, timeline, and graph snapshot.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "ALERT_NOT_FOUND", "message": f"Alert '{alert_id}' does not exist."}}
        )

    # Log audit
    audit = AuditLog(
        id=generate_id("AUD"),
        actor=user.user_id,
        action="VIEW_ALERT",
        target_type="ALERT",
        target_id=alert.id,
        metadata_json={"user_role": user.role},
        timestamp=utc_now()
    )
    db.add(audit)
    db.commit()

    # Load associated signals
    signals = db.query(Signal).filter(Signal.id.in_(alert.signal_ids)).all()
    signals_data = [
        {
            "signal_id": s.id,
            "signal_type": s.signal_type,
            "severity": s.severity,
            "confidence": s.confidence,
            "entities": s.entities,
            "evidence": s.evidence,
            "evidence_record_ids": s.evidence_record_ids,
            "explanation": s.explanation,
            "detected_at": s.detected_at
        }
        for s in signals
    ]

    return AlertDetailResponse(
        id=alert.id,
        tier=alert.tier,
        title=alert.title,
        summary=alert.summary,
        signal_ids=alert.signal_ids,
        entity_ids=alert.entity_ids,
        evidence=alert.evidence,
        evidence_record_ids=alert.evidence_record_ids,
        rule_trace=alert.rule_trace,
        counterfactual=alert.counterfactual,
        graph_snapshot=alert.graph_snapshot,
        timeline_snapshot=alert.timeline_snapshot,
        signals=signals_data,
        status=alert.status,
        created_at=alert.created_at,
        updated_at=alert.updated_at
    )

@router.get("/{alert_id}/graph", response_model=GraphResponse)
def get_alert_graph(
    alert_id: str,
    depth: int = Query(2, ge=1, le=3),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    """
    Returns NetworkX generated sub-graph focused on the entities of this alert.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")

    res = graph_builder.build_network(db, focus_entity_ids=set(alert.entity_ids), max_depth=depth)
    return GraphResponse(**res)

@router.get("/{alert_id}/timeline", response_model=TimelineResponse)
def get_alert_timeline(
    alert_id: str,
    limit: int = Query(50, ge=5, le=200),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    """
    Returns chronological merged event timeline for this alert's entities.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")

    events = timeline_builder.build_timeline(db, entity_ids=set(alert.entity_ids), limit=limit)
    return TimelineResponse(events=events, total_events=len(events))
