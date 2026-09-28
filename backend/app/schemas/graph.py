from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # CUSTOMER, ACCOUNT, EMPLOYEE, DEVICE, BRANCH
    properties: Dict[str, Any] = {}
    is_suspicious: bool = False

class GraphEdge(BaseModel):
    source: str
    target: str
    type: str  # OWNS, TRANSFER, ACCESSED, EDITED, APPROVED, USED_DEVICE, LINKED_TO
    label: Optional[str] = None
    properties: Dict[str, Any] = {}
    is_highlighted: bool = False

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    highlighted_path: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}
