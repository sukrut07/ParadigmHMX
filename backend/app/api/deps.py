from typing import Generator, Optional
from fastapi import Depends, HTTPException, Header, status
from app.db.session import SessionLocal

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SecurityContext:
    def __init__(self, user_id: str, role: str):
        self.user_id = user_id
        self.role = role.upper()

def get_current_user(
    x_user_id: Optional[str] = Header("USR-ANALYST-1", alias="X-User-ID"),
    x_user_role: Optional[str] = Header("ANALYST", alias="X-User-Role")
) -> SecurityContext:
    """
    RBAC dependency extracting actor credentials from request headers.
    Roles: ADMIN, ANALYST, REVIEWER, AUDITOR.
    """
    valid_roles = {"ADMIN", "ANALYST", "REVIEWER", "AUDITOR"}
    role = x_user_role.upper() if x_user_role else "ANALYST"
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid security role '{role}'. Permitted roles: {list(valid_roles)}"
        )
    return SecurityContext(user_id=x_user_id or "ANONYMOUS", role=role)

def require_role(allowed_roles: list[str]):
    def role_checker(user: SecurityContext = Depends(get_current_user)):
        if "ADMIN" == user.role or user.role in allowed_roles:
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Action requires one of {allowed_roles}, your role is {user.role}"
        )
    return role_checker
