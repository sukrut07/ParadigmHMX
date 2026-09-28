import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if (backend_dir / "app").exists():
    sys.path.insert(0, str(backend_dir))
else:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.db.session import SessionLocal
from app.services.detection.engine import DetectionEngine
from app.services.correlation.linker import CorrelationLinker

def main():
    print("Running InsiderTrace detection pipeline across all 9 detectors...")
    db = SessionLocal()
    try:
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

    finally:
        db.close()

if __name__ == "__main__":
    main()
