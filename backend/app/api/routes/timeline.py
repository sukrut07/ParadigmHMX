from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import SecurityContext, get_current_user, get_db
from app.schemas.timeline import TimelineEvent, TimelineResponse
from app.services.timeline.builder import TimelineBuilder

router = APIRouter(prefix="/timeline", tags=["Timeline"])

timeline_builder = TimelineBuilder()


@router.get("", response_model=TimelineResponse)
def get_timeline(
    entity_id: str | None = Query(None, description="Optional filter by account or employee ID"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user),
):
    focus = {entity_id} if entity_id else None
    events = timeline_builder.build_timeline(db, entity_ids=focus, limit=limit)
    return TimelineResponse(events=[TimelineEvent(**e) for e in events], total_events=len(events))
