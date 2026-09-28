import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.api.deps import get_db
from app.db.seed import seed_demo_and_synthetic_dataset
from app.db.session import Base
from app.main import app
from sqlalchemy.pool import StaticPool


@pytest.fixture(scope="function")
def engine():
    eng = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=eng)
    return eng


@pytest.fixture(scope="function")
def seeded_db(engine):
    """
    Provides a seeded in-memory SQLite database for test suites.
    """
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = Session()

    seed_demo_and_synthetic_dataset(
        db=session,
        num_customers=50,
        num_accounts=60,
        num_employees=10,
        num_transactions=150,
        num_events=100,
        seed=42,
        reset_db=False,
    )

    yield session

    session.close()


@pytest.fixture(scope="function")
def client(seeded_db):
    def override_get_db():
        yield seeded_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
