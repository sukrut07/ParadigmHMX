from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, SecurityContext
from app.models.transaction import Transaction

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("")
def list_transactions(
    account_id: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(get_current_user)
):
    query = db.query(Transaction)
    if account_id:
        query = query.filter((Transaction.from_account_id == account_id) | (Transaction.to_account_id == account_id))
    if channel:
        query = query.filter(Transaction.channel == channel.upper())
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)

    txs = query.order_by(Transaction.timestamp.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": t.id,
            "from_account_id": t.from_account_id,
            "to_account_id": t.to_account_id,
            "amount": t.amount,
            "currency": t.currency,
            "channel": t.channel,
            "timestamp": t.timestamp.isoformat(),
            "status": t.status,
            "reference": t.reference
        }
        for t in txs
    ]
