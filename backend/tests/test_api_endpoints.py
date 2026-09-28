from fastapi.testclient import TestClient

def test_health_and_demo_summary(client: TestClient):
    h_resp = client.get("/health")
    assert h_resp.status_code == 200
    assert h_resp.json()["status"] == "UP"

    d_resp = client.get("/demo/summary")
    assert d_resp.status_code == 200
    assert d_resp.json()["accounts"] > 0

def test_alerts_and_cases_workflow(client: TestClient):
    # 1. Run detection
    run_resp = client.post("/detection/run")
    assert run_resp.status_code == 200

    # 2. List alerts
    alerts_resp = client.get("/alerts")
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    assert len(alerts) > 0

    first_alert = alerts[0]
    alert_id = first_alert["id"]

    # 3. Alert Detail
    detail_resp = client.get(f"/alerts/{alert_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == alert_id
    assert "evidence" in detail and len(detail["evidence"]) > 0

    # 4. Alert Graph & Timeline
    graph_resp = client.get(f"/alerts/{alert_id}/graph")
    assert graph_resp.status_code == 200
    assert "nodes" in graph_resp.json()

    timeline_resp = client.get(f"/alerts/{alert_id}/timeline")
    assert timeline_resp.status_code == 200
    assert "events" in timeline_resp.json()

    # 5. Create Case from Alert
    case_create_resp = client.post("/cases", json={
        "alert_id": alert_id,
        "priority": "HIGH",
        "initial_note": "Initiating formal insider fraud investigation."
    })
    assert case_create_resp.status_code == 201
    case = case_create_resp.json()
    case_id = case["id"]
    assert case["status"] == "OPEN"

    # 6. Update Case (Assign and Change Status to IN_REVIEW)
    patch_resp = client.patch(f"/cases/{case_id}", json={
        "assignee_id": "USR-REVIEWER-2",
        "status": "IN_REVIEW",
        "note": "Case assigned for cross-branch forensic review."
    }, headers={"X-User-Role": "REVIEWER"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "IN_REVIEW"

    # 7. Export Case Evidence Bundle (JSON)
    export_json_resp = client.get(f"/cases/{case_id}/export?format=json", headers={"X-User-Role": "AUDITOR"})
    assert export_json_resp.status_code == 200
    export_data = export_json_resp.json()
    assert "sha256" in export_data
    bundle = export_data["bundle"]
    sha256_hash = export_data["sha256"]

    # 8. Export Case Evidence as PDF
    export_pdf_resp = client.get(f"/cases/{case_id}/export?format=pdf", headers={"X-User-Role": "AUDITOR"})
    assert export_pdf_resp.status_code == 200
    assert export_pdf_resp.headers["content-type"] == "application/pdf"
    assert len(export_pdf_resp.content) > 100

    # 9. Verify Tamper-evident Hash
    verify_resp = client.post("/evidence/verify", json={
        "bundle": bundle,
        "hash": sha256_hash
    })
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True

def test_employee_blast_radius(client: TestClient):
    resp = client.get("/employees/EMP-017/blast-radius")
    assert resp.status_code == 200
    data = resp.json()
    assert data["employee"]["id"] == "EMP-017"
    assert "accounts_touched" in data
    assert "actions_performed" in data
    assert "timeline" in data

def test_red_team_simulation_api(client: TestClient):
    sim_resp = client.post("/simulate", json={
        "scenario_type": "structuring",
        "intensity": 1.2
    })
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert sim_data["scenario_type"] == "structuring"
    assert sim_data["matched_expected"] is True
