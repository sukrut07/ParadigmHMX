from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, SecurityContext, require_role
from app.models.employee import Employee
from app.models.audit import AuditLog
from app.schemas.employee import EmployeeBase, BlastRadiusResponse
from app.services.graph.blast_radius import BlastRadiusAnalyzer
from app.utils.ids import generate_id
from app.utils.time import utc_now

router = APIRouter(prefix="/employees", tags=["Employees"])

blast_analyzer = BlastRadiusAnalyzer()

@router.get("", response_model=List[EmployeeBase])
def list_employees(
    branch_id: Optional[str] = Query(None),
    role_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    query = db.query(Employee)
    if branch_id:
        query = query.filter(Employee.branch_id == branch_id)
    if role_id:
        query = query.filter(Employee.role_id == role_id)
    return query.offset(offset).limit(limit).all()

@router.get("/{employee_id}", response_model=EmployeeBase)
def get_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")
    return emp

@router.get("/{employee_id}/blast-radius", response_model=BlastRadiusResponse)
def get_employee_blast_radius(
    employee_id: str,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    """
    Computes blast radius of an employee: accounts touched, customers touched,
    actions performed, downstream transactions, and linked risk clusters.
    """
    try:
        # Audit inspection of blast radius
        audit = AuditLog(
            id=generate_id("AUD"),
            actor=user.user_id,
            action="VIEW_BLAST_RADIUS",
            target_type="EMPLOYEE",
            target_id=employee_id,
            metadata_json={"user_role": user.role},
            timestamp=utc_now()
        )
        db.add(audit)
        db.commit()

        res = blast_analyzer.analyze_employee(db, employee_id)
        return BlastRadiusResponse(**res)
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"error": {"code": "BLAST_RADIUS_FAILED", "message": str(e)}})

@router.post("/{employee_id}/unmask")
def unmask_employee(
    employee_id: str,
    reason: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(require_role(["ADMIN", "REVIEWER"]))
):
    """
    Privileged unmasking of employee identity with mandatory audit logging.
    """
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")

    audit = AuditLog(
        id=generate_id("AUD"),
        actor=user.user_id,
        action="UNMASK_PII",
        target_type="EMPLOYEE",
        target_id=emp.id,
        metadata_json={"reason": reason, "pseudonym_id": emp.pseudonym_id},
        timestamp=utc_now()
    )
    db.add(audit)
    db.commit()

    return {
        "employee_id": emp.id,
        "pseudonym_id": emp.pseudonym_id,
        "unmasked_name": f"Authorized Identity Record for {emp.id}",
        "branch_id": emp.branch_id,
        "role_id": emp.role_id,
        "audit_id": audit.id,
        "unmasked_at": utc_now().isoformat()
    }
