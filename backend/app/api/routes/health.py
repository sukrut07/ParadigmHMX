from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.deps import get_db
from app.models.customer import Customer
from app.models.account import Account
from app.models.employee import Employee
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.models.case import Case

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Returns database status, connectivity, and entity counts.
    """
    db_status = "HEALTHY"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"UNHEALTHY: {str(e)}"

    return {
        "status": "UP",
        "database": db_status,
        "dataset_counts": {
            "customers": db.query(Customer).count(),
            "accounts": db.query(Account).count(),
            "employees": db.query(Employee).count(),
            "transactions": db.query(Transaction).count(),
            "alerts": db.query(Alert).count(),
            "cases": db.query(Case).count(),
        }
    }
