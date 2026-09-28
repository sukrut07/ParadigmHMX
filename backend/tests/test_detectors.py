from app.services.detection.action_transaction import ActionTransactionDetector
from app.services.detection.bulk_lookup import BulkLookupDetector
from app.services.detection.circular_transfer import CircularTransferDetector
from app.services.detection.off_hours import OffHoursDetector
from app.services.detection.out_of_role import OutOfRoleDetector
from app.services.detection.privilege_abuse import PrivilegeAbuseDetector
from app.services.detection.profile_mismatch import ProfileMismatchDetector
from app.services.detection.rapid_passthrough import RapidPassThroughDetector
from app.services.detection.structuring import StructuringDetector


def test_circular_transfer_detector(seeded_db):
    detector = CircularTransferDetector()
    signals = detector.detect(seeded_db)
    assert len(signals) >= 1
    # Check that circular transfer contains account path and transactions
    sig = next((s for s in signals if s["signal_type"] == "CIRCULAR_TRANSFER"), None)
    assert sig is not None
    assert sig["severity"] in ("HIGH", "CRITICAL")
    assert len(sig["evidence"]) >= 3
    assert len(sig["evidence_record_ids"]) >= 3


def test_out_of_role_detector(seeded_db):
    detector = OutOfRoleDetector()
    signals = detector.detect(seeded_db)
    # EMP-017 is Teller who performed OVERRIDE on ACC-0231
    sig = next((s for s in signals if any(e["id"] == "EMP-017" for e in s["entities"])), None)
    assert sig is not None
    assert sig["signal_type"] == "OUT_OF_ROLE_ACCESS"
    assert sig["severity"] == "HIGH"


def test_action_transaction_detector(seeded_db):
    detector = ActionTransactionDetector()
    signals = detector.detect(seeded_db)
    # EMP-017 action on ACC-0231 followed by rapid transfers
    sig = next((s for s in signals if any(e["id"] == "EMP-017" for e in s["entities"])), None)
    assert sig is not None
    assert sig["signal_type"] == "ACTION_TRANSACTION_LINK"
    assert sig["severity"] in ("HIGH", "CRITICAL")
    assert any("ACC-0231" in e["id"] for e in sig["entities"])


def test_bulk_lookup_detector(seeded_db):
    detector = BulkLookupDetector()
    signals = detector.detect(seeded_db)
    # EMP-022 accessed 45 accounts in one day
    sig = next((s for s in signals if any(e["id"] == "EMP-022" for e in s["entities"])), None)
    assert sig is not None
    assert sig["signal_type"] == "BULK_LOOKUP"
    assert len(sig["evidence"]) >= 1


def test_privilege_abuse_detector(seeded_db):
    detector = PrivilegeAbuseDetector()
    signals = detector.detect(seeded_db)
    # Checks for repeated overrides or sensitive changes
    assert isinstance(signals, list)


def test_structuring_detector(seeded_db):
    detector = StructuringDetector()
    signals = detector.detect(seeded_db)
    assert isinstance(signals, list)


def test_rapid_passthrough_detector(seeded_db):
    detector = RapidPassThroughDetector()
    signals = detector.detect(seeded_db)
    assert isinstance(signals, list)


def test_profile_mismatch_detector(seeded_db):
    detector = ProfileMismatchDetector()
    signals = detector.detect(seeded_db)
    assert isinstance(signals, list)


def test_off_hours_detector(seeded_db):
    detector = OffHoursDetector()
    signals = detector.detect(seeded_db)
    assert isinstance(signals, list)
