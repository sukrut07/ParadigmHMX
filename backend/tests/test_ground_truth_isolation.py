from fastapi.testclient import TestClient

def test_ground_truth_not_exposed_in_normal_alert_apis(client: TestClient):
    """
    GROUND TRUTH ISOLATION TEST (Section 49):
    Normal alert APIs and case APIs must NEVER expose ground truth or scenario labels.
    """
    # 1. Trigger detection to have alerts
    resp = client.post("/detection/run", json={"detectors": ["all"]})
    assert resp.status_code == 200

    # 2. Inspect /alerts
    alerts_resp = client.get("/alerts")
    assert alerts_resp.status_code == 200
    alerts_data = alerts_resp.json()
    assert len(alerts_data) > 0

    for al in alerts_data:
        al_str = str(al).lower()
        assert "ground_truth" not in al_str
        assert "groundtruth" not in al_str
        assert "is_fraud_ground_truth" not in al_str

    # 3. Inspect /alerts/{id}
    first_id = alerts_data[0]["id"]
    detail_resp = client.get(f"/alerts/{first_id}")
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    detail_str = str(detail_data).lower()
    assert "ground_truth" not in detail_str
    assert "groundtruth" not in detail_str

    # 4. Verify that ground truth IS available on dedicated evaluation endpoint
    eval_resp = client.get("/metrics/evaluation")
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert "confusion_matrix" in eval_data
    assert "overall" in eval_data
