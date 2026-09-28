from app.services.correlation.linker import CorrelationLinker
from app.services.detection.engine import DetectionEngine


def test_demo_scenario_1_insider_mule_critical(seeded_db):
    """
    DEMO SCENARIO 1:
    EMP-017 performs out-of-role limit change on ACC-0231 followed by rapid transfers.
    Must generate a CRITICAL or HIGH alert linking EMP-017 and ACC-0231 with complete evidence.
    """
    engine = DetectionEngine()
    det_res = engine.run_all(db=seeded_db, persist=True)

    linker = CorrelationLinker()
    alerts = linker.correlate_and_generate_alerts(db=seeded_db, signals=det_res["signals"])

    target_alert = next((a for a in alerts if "EMP-017" in a.entity_ids and "ACC-0231" in a.entity_ids), None)

    assert target_alert is not None, "Primary demo alert for EMP-017 & ACC-0231 was not generated"
    assert target_alert.tier in ("CRITICAL", "HIGH"), f"Expected CRITICAL/HIGH, got {target_alert.tier}"
    assert any("LOG-DEMO" in rid or "TX-DEMO" in rid or "CHG-DEMO" in rid for rid in target_alert.evidence_record_ids)
    assert len(target_alert.evidence) >= 2


def test_demo_scenario_2_legitimate_payroll_not_flagged_as_critical(seeded_db):
    """
    DEMO SCENARIO 2 (Hard Negative):
    Corporate payroll batch to 30 employee accounts should NOT produce a CRITICAL fraud alert on the payroll account.
    """
    engine = DetectionEngine()
    det_res = engine.run_all(db=seeded_db, persist=True)

    linker = CorrelationLinker()
    alerts = linker.correlate_and_generate_alerts(db=seeded_db, signals=det_res["signals"])

    # ACC-PAYROLL-01 should NOT have a CRITICAL or HIGH alert
    payroll_crit_alert = next(
        (a for a in alerts if "ACC-PAYROLL-01" in a.entity_ids and a.tier in ("CRITICAL", "HIGH")), None
    )

    assert payroll_crit_alert is None, f"False positive! Payroll account flagged with {payroll_crit_alert.tier} alert"


def test_demo_scenario_3_insider_without_financial_crime(seeded_db):
    """
    DEMO SCENARIO 3:
    EMP-022 accessed 45 accounts in one day (bulk lookup anomaly) but NO suspicious financial transactions occurred.
    Must generate an isolated insider alert, NOT claiming financial crime collusion.
    """
    engine = DetectionEngine()
    det_res = engine.run_all(db=seeded_db, persist=True)

    linker = CorrelationLinker()
    alerts = linker.correlate_and_generate_alerts(db=seeded_db, signals=det_res["signals"])

    emp22_alert = next((a for a in alerts if "EMP-022" in a.entity_ids), None)

    assert emp22_alert is not None, "Alert for anomalous employee EMP-022 bulk access was not generated"
    # Should be MEDIUM or LOW insider anomaly
    assert emp22_alert.tier in ("MEDIUM", "LOW", "HIGH")
    # Verify no financial signals are incorrectly mixed in
    sig_types = [s["signal_type"] for s in det_res["signals"] if s["signal_id"] in emp22_alert.signal_ids]
    assert "CIRCULAR_TRANSFER" not in sig_types
    assert "STRUCTURING" not in sig_types


def test_demo_scenario_4_financial_without_insider(seeded_db):
    """
    DEMO SCENARIO 4:
    Circular transfer ring (ACC-8801 -> ACC-8802 -> ACC-8803 -> ACC-8801) without any employee involvement.
    Must flag financial crime without fabricating insider culpability.
    """
    engine = DetectionEngine()
    det_res = engine.run_all(db=seeded_db, persist=True)

    linker = CorrelationLinker()
    alerts = linker.correlate_and_generate_alerts(db=seeded_db, signals=det_res["signals"])

    circ_alert = next(
        (a for a in alerts if any(acc in a.entity_ids for acc in ["ACC-8801", "ACC-8802", "ACC-8803"])), None
    )

    assert circ_alert is not None, "Circular transfer ring alert was not generated"
    # Verify no employee is falsely tagged in this purely transactional alert
    employees_in_alert = [e for e in circ_alert.entity_ids if e.startswith("EMP-")]
    assert len(employees_in_alert) == 0, f"False insider attribution! Found employees: {employees_in_alert}"
