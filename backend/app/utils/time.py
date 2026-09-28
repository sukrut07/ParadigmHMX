from datetime import datetime, timezone

def utc_now() -> datetime:
    """Returns current UTC datetime."""
    return datetime.now(timezone.utc)

def to_iso(dt: datetime) -> str:
    """Converts datetime to ISO 8601 string."""
    if dt is None:
        return ""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()

def parse_iso(dt_str: str) -> datetime:
    """Parses ISO 8601 string to datetime."""
    if not dt_str:
        return utc_now()
    dt = datetime.fromisoformat(dt_str)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt
