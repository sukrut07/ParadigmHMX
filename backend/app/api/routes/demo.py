from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.customer import Customer
from app.models.account import Account
from app.models.employee import Employee
from app.models.transaction import Transaction
from app.models.signal import Signal
from app.models.alert import Alert
from app.models.case import Case

router = APIRouter(prefix="/demo", tags=["Demo & Overview"])

@router.get("/summary")
def get_demo_summary(db: Session = Depends(get_db)):
    """
    Returns platform-wide metrics for executive intelligence dashboard.
    """
    return {
        "customers": db.query(Customer).count(),
        "accounts": db.query(Account).count(),
        "transactions": db.query(Transaction).count(),
        "employees": db.query(Employee).count(),
        "signals": db.query(Signal).count(),
        "alerts": db.query(Alert).count(),
        "cases": db.query(Case).count(),
        "critical_alerts": db.query(Alert).filter(Alert.tier == "CRITICAL").count(),
        "high_alerts": db.query(Alert).filter(Alert.tier == "HIGH").count(),
        "medium_alerts": db.query(Alert).filter(Alert.tier == "MEDIUM").count(),
        "low_alerts": db.query(Alert).filter(Alert.tier == "LOW").count(),
    }
