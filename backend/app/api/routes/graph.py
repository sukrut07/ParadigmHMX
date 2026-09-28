from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import SecurityContext, get_current_user, get_db
from app.schemas.graph import GraphResponse
from app.services.graph.builder import GraphBuilder

router = APIRouter(prefix="/graph", tags=["Graph Engine"])

graph_builder = GraphBuilder()


@router.get("/global", response_model=GraphResponse)
def get_global_graph(db: Session = Depends(get_db), user: SecurityContext = Depends(get_current_user)):
    """
    Returns global network representation of entities and relationships.
    """
    res = graph_builder.build_network(db)
    return GraphResponse(**res)


@router.get("/entity/{entity_id}", response_model=GraphResponse)
def get_entity_subgraph(
    entity_id: str,
    depth: int = Query(2, ge=1, le=3),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user),
):
    """
    Returns ego subgraph around an entity (customer, account, employee, or device).
    """
    res = graph_builder.build_network(db, focus_entity_ids={entity_id}, max_depth=depth)
    return GraphResponse(**res)
