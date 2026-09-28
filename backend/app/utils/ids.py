import uuid


def generate_id(prefix: str) -> str:
    """Generate a clean human-readable prefixed ID."""
    hex_str = uuid.uuid4().hex[:8].upper()
    return f"{prefix}-{hex_str}"
