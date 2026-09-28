from app.db.seed import seed_demo_and_synthetic_dataset
from app.db.session import Base
from app.services.correlation.linker import CorrelationLinker
from app.services.detection.engine import DetectionEngine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def run_pipeline_with_seed(seed: int):
    eng = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=eng)
    Session = sessionmaker(bind=eng)
    session = Session()

    seed_demo_and_synthetic_dataset(
        db=session, num_customers=40, num_accounts=50, num_employees=8, num_transactions=100, num_events=60, seed=seed
    )

    det_engine = DetectionEngine()
    det_res = det_engine.run_all(db=session, persist=True)

    linker = CorrelationLinker()
    alerts = linker.correlate_and_generate_alerts(db=session, signals=det_res["signals"])

    # Extract signature of alerts
    alert_signatures = []
    for a in alerts:
        alert_signatures.append(
            {
                "tier": a.tier,
                "title": a.title,
                "entity_ids": sorted(a.entity_ids),
                "signal_count": len(a.signal_ids),
                "rule_names": [r["rule"] for r in a.rule_trace.get("rules", [])],
            }
        )
    alert_signatures.sort(key=lambda x: (str(x["tier"]), str(x["title"]), ",".join(str(e) for e in x["entity_ids"])))

    session.close()
    return alert_signatures


def test_determinism_identical_runs():
    """
    DETERMINISM TEST (Section 48):
    Two separate detection pipelines with seed=42 must produce exactly identical alert results.
    """
    run_1 = run_pipeline_with_seed(42)
    run_2 = run_pipeline_with_seed(42)

    assert len(run_1) == len(run_2)
    assert run_1 == run_2
