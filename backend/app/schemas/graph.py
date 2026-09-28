from typing import Any

from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # CUSTOMER, ACCOUNT, EMPLOYEE, DEVICE, BRANCH
    properties: dict[str, Any] = {}
    is_suspicious: bool = False


class GraphEdge(BaseModel):
    source: str
    target: str
    type: str  # OWNS, TRANSFER, ACCESSED, EDITED, APPROVED, USED_DEVICE, LINKED_TO
    label: str | None = None
    properties: dict[str, Any] = {}
    is_highlighted: bool = False


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    highlighted_path: list[str] | None = []
    metadata: dict[str, Any] | None = {}
