import pytest
from app.services.correlation.linker import CorrelationLinker
from app.services.detection.engine import DetectionEngine
from app.services.evaluation.metrics import EvaluationEngine


def test_detection_accuracy_and_false_positive_rate(seeded_db):
    """
    Validates platform detection accuracy on suspicious scenarios and low false positive rate on legitimate scenarios.
    Ensures:
    - 100% recall on planted suspicious ground-truth accounts
    - Low false positive rate (<= 10%) on legitimate scenarios (hard negatives like payroll and rent)
    - Precision >= 70% and F1 score >= 80%
    - Multi-dimensional explainable risk levels present in alerts (not just an opaque score)
    """
    engine = DetectionEngine()
    det_res = engine.run_all(db=seeded_db, persist=True)

    linker = CorrelationLinker()
    alerts = linker.correlate_and_generate_alerts(db=seeded_db, signals=det_res["signals"])

    eval_engine = EvaluationEngine()
    metrics = eval_engine.evaluate(seeded_db, alerts)

    overall = metrics["overall"]
    hard_negs = metrics["hard_negatives"]
    confusion = metrics["confusion_matrix"]

    # 1. Detection Accuracy (Recall / Sensitivity) on suspicious scenarios
    assert overall["recall"] == 1.0, f"Expected 100% recall on ground truth suspicious accounts, got {overall['recall']}"
    assert overall["detection_rate"] == 1.0
    assert confusion["false_negative"] == 0, f"Expected 0 false negatives, got {confusion['false_negative']}"

    # 2. Precision and F1 Score
    assert overall["precision"] >= 0.70, f"Expected precision >= 70%, got {overall['precision']}"
    assert overall["f1"] >= 0.80, f"Expected F1 >= 80%, got {overall['f1']}"

    # 3. False Positive Rate on Legitimate Scenarios
    assert hard_negs["fp_rate"] <= 0.10, f"Expected FPR <= 10% on hard negatives, got {hard_negs['fp_rate']}"
    assert hard_negs["true_negatives"] >= 25, f"Expected high true negative count on benign controls, got {hard_negs['true_negatives']}"

    # 4. Mandatory explainable risk levels verification (not an opaque single score)
    for al in alerts:
        rule_trace = al.rule_trace or {}
        assert "risk_factors" in rule_trace or "risk_breakdown" in rule_trace, f"Alert {al.id} missing explainable risk breakdown"
        rf = rule_trace.get("risk_factors") or rule_trace.get("risk_breakdown")
        assert "insider_privilege_risk" in rf
        assert "money_flow_topology_risk" in rf
        assert "profile_kyc_mismatch_risk" in rf
        assert "causal_temporal_linkage_risk" in rf
        assert "network_exposure_risk" in rf

        # Each dimension must have a discrete explainable level and indicators
        assert rf["insider_privilege_risk"]["level"] in ("CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE")
        assert len(rf["insider_privilege_risk"]["indicators"]) > 0
        assert rf["money_flow_topology_risk"]["level"] in ("CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE")
        assert len(rf["money_flow_topology_risk"]["indicators"]) > 0


def test_hard_negative_payroll_isolation(seeded_db):
    """
    Explicit test on legitimate high-volume corporate payroll scenario:
    Ensures payroll account is NOT falsely flagged with a CRITICAL or HIGH alert.
    """
    engine = DetectionEngine()
    det_res = engine.run_all(db=seeded_db, persist=True)

    linker = CorrelationLinker()
    alerts = linker.correlate_and_generate_alerts(db=seeded_db, signals=det_res["signals"])

    crit_payroll = [a for a in alerts if "ACC-PAYROLL-01" in a.entity_ids and a.tier in ("CRITICAL", "HIGH")]
    assert len(crit_payroll) == 0, f"Payroll account falsely flagged with high severity alert: {crit_payroll}"


def test_suspicious_scenario_circular_and_structuring_detected(seeded_db):
    """
    Explicit test on suspicious money laundering scenarios:
    Ensures circular transfers and structuring patterns are detected with explainable evidence.
    """
    engine = DetectionEngine()
    det_res = engine.run_all(db=seeded_db, persist=True)

    detected_types = {s["signal_type"] for s in det_res["signals"]}
    assert "CIRCULAR_TRANSFER" in detected_types, "Circular transfer ring failed to trigger"
    assert "STRUCTURING" in detected_types, "Structuring / smurfing failed to trigger"
    assert "ACTION_TRANSACTION_LINK" in detected_types, "Cross-domain action-transaction link failed to trigger"
