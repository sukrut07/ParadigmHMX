from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, SecurityContext, require_role
from app.models.alert import Alert
from app.schemas.evaluation import EvaluationResponse
from app.services.evaluation.metrics import EvaluationEngine

router = APIRouter(prefix="/metrics", tags=["Evaluation & Benchmarks"])

eval_engine = EvaluationEngine()

@router.get("/evaluation", response_model=EvaluationResponse)
def get_evaluation_metrics(
    db: Session = Depends(get_db),
    user: SecurityContext = Depends(require_role(["AUDITOR", "ANALYST", "REVIEWER", "ADMIN"]))
):
    """
    Evaluates detection and correlation performance against hidden ground truth:
    Precision, Recall, F1, FPR, Confusion Matrix, Hard-Negatives, and Baseline Ablation.
    """
    alerts = db.query(Alert).all()
    results = eval_engine.evaluate(db, alerts)
    return EvaluationResponse(**results)
