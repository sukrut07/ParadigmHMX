import os
from pathlib import Path
from typing import Any

import yaml
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "InsiderTrace — Financial Crime & Insider Risk Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/insidertrace.db")

    # Security / Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "insidertrace-super-secret-production-key-2026")
    DEFAULT_AUTH_ROLE: str = "ANALYST"  # ADMIN, ANALYST, REVIEWER, AUDITOR

    # Detection Thresholds
    STRUCTURING_THRESHOLD: float = 50000.0
    STRUCTURING_MIN_TX_COUNT: int = 3
    STRUCTURING_WINDOW_HOURS: int = 24

    RAPID_PASSTHROUGH_HOURS: float = 4.0
    RAPID_PASSTHROUGH_RATIO: float = 0.85

    ACTION_TRANSACTION_WINDOW_HOURS: float = 24.0

    CYCLE_MAX_LENGTH: int = 5
    CYCLE_MAX_HOURS: float = 48.0

    BULK_LOOKUP_DEVIATION_FACTOR: float = 2.5
    BULK_LOOKUP_MIN_THRESHOLD: int = 15

    PRIVILEGE_OVERRIDE_WINDOW_HOURS: float = 12.0
    PRIVILEGE_OVERRIDE_THRESHOLD: int = 3

    PROFILE_MISMATCH_RATIO: float = 5.0

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()


def load_risk_rules() -> dict[str, Any]:
    rules_file = Path(__file__).resolve().parent / "risk_rules.yaml"
    if rules_file.exists():
        with open(rules_file, encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {
        "tiers": {
            "CRITICAL": {
                "description": "High linked insider anomaly with multiple accounts, repeated pattern, or circular movement",
                "rules": [
                    "INSIDER_FINANCIAL_LINK_AND_CIRCULAR",
                    "INSIDER_FINANCIAL_MULTI_ACCOUNT",
                    "REPEATED_INSIDER_FINANCIAL",
                ],
            },
            "HIGH": {
                "description": "Directly linked insider action and financial crime anomaly on same account/customer",
                "rules": ["INSIDER_FINANCIAL_LINK", "SEVERE_STRUCTURING_RING", "CRITICAL_PRIVILEGE_ABUSE"],
            },
            "MEDIUM": {
                "description": "Multiple independent financial signals or single strong financial anomaly or isolated insider anomaly",
                "rules": ["MULTIPLE_FINANCIAL_SIGNALS", "STRONG_CIRCULAR_FLOW", "HIGH_BULK_LOOKUP_ANOMALY"],
            },
            "LOW": {
                "description": "Single weak or unlinked signal",
                "rules": ["ISOLATED_WEAK_SIGNAL", "OFF_HOURS_ROUTINE"],
            },
        }
    }
