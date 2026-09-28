import pytest
from app.services.detection.validator import (
    ValidationError,
    validate_alert,
    validate_signal,
)


def test_validate_signal_success():
    valid_sig = {
        "signal_id": "SIG-TEST-01",
        "signal_type": "OUT_OF_ROLE_ACCESS",
        "severity": "HIGH",
        "confidence": 0.95,
        "entities": [{"type": "employee", "id": "EMP-017"}],
        "evidence": [{"record_type": "access_log", "record_id": "LOG-01", "field": "action", "value": "OVERRIDE"}],
        "evidence_record_ids": ["LOG-01"],
        "explanation": "Employee EMP-017 performed an unauthorized OVERRIDE action.",
    }
    assert validate_signal(valid_sig) is True


def test_validate_signal_missing_evidence():
    invalid_sig = {
        "signal_id": "SIG-TEST-02",
        "signal_type": "OUT_OF_ROLE_ACCESS",
        "severity": "HIGH",
        "confidence": 0.95,
        "entities": [{"type": "employee", "id": "EMP-017"}],
        "evidence": [],  # Empty evidence!
        "evidence_record_ids": [],
        "explanation": "No evidence attached.",
    }
    with pytest.raises(ValidationError, match="at least one evidence item"):
        validate_signal(invalid_sig)


def test_validate_signal_invalid_severity():
    invalid_sig = {
        "signal_id": "SIG-TEST-03",
        "signal_type": "OUT_OF_ROLE_ACCESS",
        "severity": "SUPER_CRITICAL",  # Invalid severity
        "entities": [{"type": "employee", "id": "EMP-017"}],
        "evidence": [{"record_type": "access_log", "record_id": "LOG-01"}],
        "evidence_record_ids": ["LOG-01"],
        "explanation": "Valid explanation.",
    }
    with pytest.raises(ValidationError, match="Invalid severity"):
        validate_signal(invalid_sig)


def test_validate_alert_missing_counterfactual():
    invalid_alert = {
        "tier": "HIGH",
        "title": "Suspicious Activity Alert",
        "summary": "Detailed summary explanation of the alert.",
        "signal_ids": ["SIG-01"],
        "entity_ids": ["ACC-01"],
        "evidence": [{"record_type": "transaction", "record_id": "TX-01"}],
        "evidence_record_ids": ["TX-01"],
        "rule_trace": {"rules": []},
        "counterfactual": {},  # Missing condition_changed
    }
    with pytest.raises(ValidationError, match="valid counterfactual"):
        validate_alert(invalid_alert)


def test_validate_alert_missing_evidence():
    invalid_alert = {
        "tier": "CRITICAL",
        "title": "Alert Without Evidence",
        "summary": "This alert fails validation.",
        "signal_ids": ["SIG-01"],
        "entity_ids": ["ACC-01"],
        "evidence": [],
        "evidence_record_ids": [],
        "rule_trace": {"rules": []},
        "counterfactual": {"condition_changed": "x"},
    }
    with pytest.raises(ValidationError, match="CRITICAL: Alert has NO evidence"):
        validate_alert(invalid_alert)
