from app.utils.hashing import canonical_json_dump, calculate_sha256, canonical_hash_payload, verify_payload_hash

def test_canonical_json_key_order_independence():
    dict1 = {"b": 2, "a": 1, "nested": {"y": 20, "x": 10}}
    dict2 = {"nested": {"x": 10, "y": 20}, "a": 1, "b": 2}
    
    dump1 = canonical_json_dump(dict1)
    dump2 = canonical_json_dump(dict2)
    assert dump1 == dump2

    _, hash1 = canonical_hash_payload(dict1)
    _, hash2 = canonical_hash_payload(dict2)
    assert hash1 == hash2

def test_tamper_detection():
    bundle = {
        "case_id": "CASE-001",
        "evidence_records": ["TX-101", "LOG-202"],
        "tier": "CRITICAL"
    }
    _, valid_hash = canonical_hash_payload(bundle)

    is_valid, _ = verify_payload_hash(bundle, valid_hash)
    assert is_valid is True

    # Tamper with bundle
    tampered_bundle = dict(bundle)
    tampered_bundle["tier"] = "LOW"

    is_valid_tampered, computed_hash = verify_payload_hash(tampered_bundle, valid_hash)
    assert is_valid_tampered is False
    assert computed_hash != valid_hash
