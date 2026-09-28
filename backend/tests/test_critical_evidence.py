from app.services.correlation.linker import CorrelationLinker
from app.services.detection.engine import DetectionEngine


def test_every_alert_has_evidence(seeded_db):
    """
    CRITICAL MANDATORY TEST (Section 47 of Problem Statement):
    Asserts that every generated alert contains:
    1. evidence (non-empty)
    2. evidence_record_ids (non-empty)
    3. rule_trace (machine and human readable)
    4. counterfactual explanation
    """
    engine = DetectionEngine()
    det_res = engine.run_all(db=seeded_db, persist=True)
    assert det_res["total_signals"] > 0

    linker = CorrelationLinker()
    alerts = linker.correlate_and_generate_alerts(db=seeded_db, signals=det_res["signals"])
    assert len(alerts) > 0

    for alert in alerts:
        # 1. Assert evidence
        assert alert.evidence is not None, f"Alert {alert.id} missing evidence"
        assert isinstance(alert.evidence, list), f"Alert {alert.id} evidence not a list"
        assert len(alert.evidence) > 0, f"Alert {alert.id} has empty evidence list"

        # 2. Assert evidence record IDs
        assert alert.evidence_record_ids is not None, f"Alert {alert.id} missing evidence_record_ids"
        assert isinstance(alert.evidence_record_ids, list), f"Alert {alert.id} record_ids not a list"
        assert len(alert.evidence_record_ids) > 0, f"Alert {alert.id} has empty evidence_record_ids"

        # 3. Assert rule trace
        assert alert.rule_trace is not None, f"Alert {alert.id} missing rule_trace"
        assert "rules" in alert.rule_trace, f"Alert {alert.id} rule_trace missing 'rules'"
        assert len(alert.rule_trace["rules"]) > 0, f"Alert {alert.id} rule_trace has 0 rules"
        assert "human_explanation" in alert.rule_trace, f"Alert {alert.id} missing human_explanation"
        assert len(alert.rule_trace["human_explanation"].strip()) > 10

        # 4. Assert counterfactual
        assert alert.counterfactual is not None, f"Alert {alert.id} missing counterfactual"
        assert "condition_changed" in alert.counterfactual, f"Alert {alert.id} counterfactual missing condition_changed"
        assert "original_tier" in alert.counterfactual
        assert "counterfactual_tier" in alert.counterfactual
        assert "explanation" in alert.counterfactual
        assert len(alert.counterfactual["explanation"].strip()) > 10

        # 5. Assert graph and timeline snapshots
        assert alert.graph_snapshot is not None
        assert "nodes" in alert.graph_snapshot and "edges" in alert.graph_snapshot
        assert alert.timeline_snapshot is not None
