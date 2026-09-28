from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, SecurityContext
from app.models.account import Account

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("")
def list_accounts(
    branch_id: Optional[str] = Query(None),
    account_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    query = db.query(Account)
    if branch_id:
        query = query.filter(Account.branch_id == branch_id)
    if account_type:
        query = query.filter(Account.account_type == account_type.upper())
    if status:
        query = query.filter(Account.status == status.upper())

    accounts = query.offset(offset).limit(limit).all()
    return [
        {
            "id": a.id,
            "customer_id": a.customer_id,
            "account_type": a.account_type,
            "branch_id": a.branch_id,
            "status": a.status,
            "daily_limit": a.daily_limit,
            "currency": a.currency,
            "opened_at": a.opened_at.isoformat() if a.opened_at else None
        }
        for a in accounts
    ]

@router.get("/{account_id}")
def get_account_detail(
    account_id: str,
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail=f"Account '{account_id}' not found.")

    cust = acc.customer
    return {
        "id": acc.id,
        "customer": {
            "id": cust.id if cust else None,
            "pseudonym_id": cust.pseudonym_id if cust else None,
            "occupation": cust.declared_occupation if cust else None,
            "income_band": cust.declared_income_band if cust else None,
            "risk_profile": cust.risk_profile if cust else None
        },
        "account_type": acc.account_type,
        "branch_id": acc.branch_id,
        "status": acc.status,
        "daily_limit": acc.daily_limit,
        "currency": acc.currency,
        "opened_at": acc.opened_at.isoformat() if acc.opened_at else None
    }
