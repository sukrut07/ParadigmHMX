from typing import Dict, List
from pydantic import BaseModel

class MetricsBlock(BaseModel):
    tp: int
    tn: int
    fp: int
    fn: int
    precision: float
    recall: float
    f1: float
    fpr: float
    detection_rate: float
    accuracy: float

class ConfusionMatrix(BaseModel):
    true_positive: int
    true_negative: int
    false_positive: int
    false_negative: int

class ScenarioRecall(BaseModel):
    scenario_type: str
    total_ground_truth: int
    detected: int
    recall: float

class AblationComparison(BaseModel):
    baseline_financial_only: MetricsBlock
    ours_financial_and_insider: MetricsBlock
    improvement_f1_delta: float
    improvement_fpr_reduction: float
    detector_ablation: Dict[str, Dict[str, float]]

class HardNegativeSummary(BaseModel):
    total_hard_negatives: int
    false_positives: int
    true_negatives: int
    fp_rate: float
    scenarios_tested: List[str]

class EvaluationResponse(BaseModel):
    overall: MetricsBlock
    confusion_matrix: ConfusionMatrix
    per_scenario: List[ScenarioRecall]
    ablation: AblationComparison
    hard_negatives: HardNegativeSummary
    evaluated_at: str
