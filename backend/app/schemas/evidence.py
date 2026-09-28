from typing import Dict, Any
from pydantic import BaseModel

class ExportResponse(BaseModel):
    bundle_id: str
    sha256: str
    generated_at: str
    bundle: Dict[str, Any]

class VerificationRequest(BaseModel):
    bundle: Dict[str, Any]
    hash: str

class VerificationResponse(BaseModel):
    valid: bool
    expected_hash: str
    computed_hash: str
    message: str
