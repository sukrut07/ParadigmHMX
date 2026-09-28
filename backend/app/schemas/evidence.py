from typing import Any

from pydantic import BaseModel


class ExportResponse(BaseModel):
    bundle_id: str
    sha256: str
    generated_at: str
    bundle: dict[str, Any]


class VerificationRequest(BaseModel):
    bundle: dict[str, Any]
    hash: str


class VerificationResponse(BaseModel):
    valid: bool
    expected_hash: str
    computed_hash: str
    message: str
