import argparse
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if (backend_dir / "app").exists():
    sys.path.insert(0, str(backend_dir))
else:
    # If run from root scripts/
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.db.session import SessionLocal
from app.db.seed import seed_demo_and_synthetic_dataset

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic banking data for InsiderTrace")
    parser.add_argument("--customers", type=int, default=500, help="Number of customers")
    parser.add_argument("--accounts", type=int, default=600, help="Number of accounts")
    parser.add_argument("--transactions", type=int, default=20000, help="Number of transactions")
    parser.add_argument("--events", type=int, default=10000, help="Number of employee events")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    
    args = parser.parse_args()

    print(f"Generating synthetic dataset with seed={args.seed}...")
    db = SessionLocal()
    try:
        counts = seed_demo_and_synthetic_dataset(
            db=db,
            num_customers=args.customers,
            num_accounts=args.accounts,
            num_transactions=args.transactions,
            num_events=args.events,
            seed=args.seed
        )
        print("Dataset generated successfully:")
        for k, v in counts.items():
            print(f"  - {k}: {v}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
