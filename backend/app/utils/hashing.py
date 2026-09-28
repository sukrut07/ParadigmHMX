import json
import hashlib
from typing import Any, Tuple

def canonical_json_dump(obj: Any) -> str:
    """
    Serializes a Python object to canonical JSON:
    - Sorted keys
    - Compact separators (',', ':')
    - UTF-8 encoding
    - Handles datetime or stringifiable objects gracefully
    """
    def default_serializer(o):
        if hasattr(o, "isoformat"):
            return o.isoformat()
        return str(o)

    return json.dumps(
        obj,
        sort_keys=True,
        separators=(',', ':'),
        ensure_ascii=False,
        default=default_serializer
    )

def calculate_sha256(canonical_str: str) -> str:
    """Computes SHA-256 hex digest of a canonical string."""
    return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

def canonical_hash_payload(payload: Any) -> Tuple[str, str]:
    """Returns canonical string and its SHA-256 hash."""
    canonical = canonical_json_dump(payload)
    sha256_hash = calculate_sha256(canonical)
    return canonical, sha256_hash

def verify_payload_hash(payload: Any, expected_hash: str) -> Tuple[bool, str]:
    """Verifies payload against expected SHA-256 hash."""
    canonical, computed_hash = canonical_hash_payload(payload)
    return (computed_hash.lower() == expected_hash.strip().lower(), computed_hash)
