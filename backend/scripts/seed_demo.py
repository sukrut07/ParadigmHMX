import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if (backend_dir / "app").exists():
    sys.path.insert(0, str(backend_dir))
else:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.db.seed import seed_demo_and_synthetic_dataset
from app.db.session import SessionLocal


def main():
    print("Seeding InsiderTrace demo dataset (4 explicit demo scenarios + background retail baseline)...")
    db = SessionLocal()
    try:
        counts = seed_demo_and_synthetic_dataset(
            db=db, num_customers=500, num_accounts=600, num_transactions=15000, num_events=5000, seed=42
        )
        print("Demo seed complete:")
        for k, v in counts.items():
            print(f"  {k}: {v}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
