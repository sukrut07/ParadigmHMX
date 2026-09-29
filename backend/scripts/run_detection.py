import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if (backend_dir / "app").exists():
    sys.path.insert(0, str(backend_dir))
else:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.db.session import SessionLocal
from app.services.correlation.linker import CorrelationLinker
from app.services.detection.engine import DetectionEngine


def main():
    print("Running InsiderTrace detection pipeline across all 9 detectors...")
    db = SessionLocal()
    try:
        from app.models.alert import Alert
        from app.models.case import Case
        from app.models.signal import Signal

        db.query(Case).delete()
        db.query(Alert).delete()
        db.query(Signal).delete()
        db.commit()

        engine = DetectionEngine()
        det_res = engine.run_all(db=db, persist=True)
        print(f"Generated {det_res['total_signals']} signals in {det_res['duration_seconds']:.2f}s.")
        for name, info in det_res["detector_summary"].items():
            print(f"  - {name}: {info['signals_count']} signals ({info['duration_seconds']:.2f}s)")

        print("\nCorrelating signals and synthesizing evidence-first alerts...")
        linker = CorrelationLinker()
        alerts = linker.correlate_and_generate_alerts(db=db, signals=det_res["signals"])
        print(f"Synthesized {len(alerts)} alerts:")
        for al in alerts:
            print(f"  [{al.tier}] {al.id} - {al.title}")

        # Seed initial investigation cases for top alerts to support reviewer workflow
        from app.services.cases.case_service import CaseService

        case_svc = CaseService()

        reviewers = [
            (
                "Analyst Priya Sharma (Fraud Ops)",
                "IN_REVIEW",
                "Corroborated multi-hop circular flow following unauthorized override. Escalating to AML review.",
            ),
            (
                "Reviewer Vikram Seth (AML Review)",
                "OPEN",
                "Action-transaction link verified on target account. Pending customer outreach.",
            ),
            (
                "Senior Investigator Ananya Rao (Insider Risk)",
                "ESCALATED",
                "Bulk customer lookup pattern deviation exceeding peer group baseline (z-score > 3.0).",
            ),
        ]

        print("\nInitializing active reviewer case files...")
        for idx, al in enumerate(alerts[:3]):
            assignee, status, note = reviewers[idx % len(reviewers)]
            case = case_svc.create_case(
                db=db,
                alert_id=al.id,
                actor="SYSTEM_INIT",
                assignee_id=assignee,
                priority=al.tier,
                initial_note=note,
            )
            if status != "OPEN":
                case_svc.update_case(db=db, case_id=case.id, actor="SYSTEM_INIT", status=status)
            print(f"  Created Case {case.id} -> {assignee} [{status}] for Alert {al.id}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
