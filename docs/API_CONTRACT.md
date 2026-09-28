# InsiderTrace — Frontend API Contract Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000` (or configured gateway)  
**Standard Response Headers:**
* `Content-Type: application/json`
* `X-Payload-SHA256: <hash>` (on tamper-evident evidence exports)

**Standard Authentication / RBAC Headers:**
* `X-User-ID`: String identifier of the current operator (e.g. `USR-ANALYST-1`).
* `X-User-Role`: Security role. Permitted values: `ANALYST`, `REVIEWER`, `AUDITOR`, `ADMIN`.

**Unified Error Response Format:**
All error responses adhere to the standard error model:
```json
{
  "error": {
    "code": "ALERT_NOT_FOUND",
    "message": "Alert 'ALERT-XYZ' does not exist.",
    "details": {}
  }
}
```

---

## 1. System & Health

### `GET /health`
Returns system uptime and counts of active dataset entities.
* **Method:** `GET`
* **Response:**
```json
{
  "status": "UP",
  "database": "HEALTHY",
  "dataset_counts": {
    "customers": 500,
    "accounts": 600,
    "employees": 30,
    "transactions": 19947,
    "alerts": 95,
    "cases": 1
  }
}
```

### `GET /demo/summary`
Returns high-level statistics of seeded demo entities and detection distribution.
* **Method:** `GET`
* **Response:**
```json
{
  "customers": 500,
  "accounts": 600,
  "transactions": 19947,
  "employees": 30,
  "signals": 169,
  "alerts": 95,
  "cases": 1,
  "critical_alerts": 1,
  "high_alerts": 1,
  "medium_alerts": 93,
  "low_alerts": 0
}
```

---

## 2. Alert Queue & Alert Detail

### `GET /alerts`
Lists synthesized alerts with multi-dimensional filtering, pagination, and sorting.
* **Method:** `GET`
* **Query Parameters:**
  * `tier` (optional): `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
  * `status` (optional): `OPEN`, `IN_REVIEW`, `ESCALATED`, `CLOSED_CONFIRMED`, `CLOSED_FALSE_POSITIVE`
  * `employee_id` (optional): e.g. `EMP-017`
  * `account_id` (optional): e.g. `ACC-0231`
  * `limit` (default: 50, max: 200)
  * `offset` (default: 0)
* **Response (Array of `AlertListItem`):**
```json
[
  {
    "id": "ALERT-8455D142",
    "tier": "CRITICAL",
    "title": "CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-0231",
    "summary": "Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns...",
    "primary_signal": "SIG-84E347A1",
    "employee_id": "EMP-017",
    "account_id": "ACC-0231",
    "status": "OPEN",
    "created_at": "2026-09-29T00:20:41.229193Z",
    "updated_at": "2026-09-29T00:20:41.229193Z"
  }
]
```

### `GET /alerts/{alert_id}`
Returns complete investigation dossier for an alert: individual signals, evidence records, rule trace, counterfactual explanations, graph snapshot, and timeline snapshot.
* **Method:** `GET`
* **Response (`AlertDetailResponse`):**
```json
{
  "id": "ALERT-8455D142",
  "tier": "CRITICAL",
  "title": "CRITICAL: Insider Linked Risk — Employee EMP-017 & Account ACC-0231",
  "summary": "Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns...",
  "signal_ids": [
    "SIG-84E347A1",
    "SIG-F1A5B4C2"
  ],
  "entity_ids": [
    "ACC-0231",
    "ACC-0442",
    "ACC-0553",
    "EMP-017"
  ],
  "evidence": [
    {
      "record_type": "access_log",
      "record_id": "LOG-DEMO-02",
      "field": "action",
      "value": "OVERRIDE",
      "details": {
        "employee_id": "EMP-017",
        "account_id": "ACC-0231",
        "branch_id": "BR-03",
        "device_id": "DEV-010"
      }
    },
    {
      "record_type": "transaction",
      "record_id": "TX-DEMO-01",
      "field": "amount",
      "value": "₹280,000.00 transferred to ACC-0442",
      "details": {
        "from_account": "ACC-0231",
        "to_account": "ACC-0442",
        "amount": 280000.0,
        "channel": "RTGS"
      }
    }
  ],
  "evidence_record_ids": [
    "LOG-DEMO-02",
    "TX-DEMO-01",
    "TX-DEMO-02"
  ],
  "rule_trace": {
    "tier": "CRITICAL",
    "rules": [
      {
        "rule": "RULE_CRITICAL_INSIDER_FINANCIAL_CYCLE",
        "name": "Critical Insider-Assisted Laundering Cycle",
        "matched": true,
        "signals": ["ACTION_TRANSACTION_LINK", "CIRCULAR_TRANSFER"],
        "entities": ["EMP-017", "ACC-0231"],
        "description": "Employee performed privileged action directly followed by circular/structuring transactions."
      }
    ],
    "human_explanation": "Alert classified as CRITICAL because insider activity by employee(s) EMP-017 directly intersected with suspicious financial patterns on account(s) ACC-0231, ACC-0442."
  },
  "counterfactual": {
    "condition_changed": "Simulated employee access as fully authorized within role/shift (removed OUT_OF_ROLE_ACCESS, ACTION_TRANSACTION_LINK)",
    "original_tier": "CRITICAL",
    "counterfactual_tier": "HIGH",
    "explanation": "If the employee's access had been within permitted role and branch jurisdiction with dual-authorization, the cross-domain insider linkage would be severed. The alert severity would decrease from CRITICAL to HIGH."
  },
  "graph_snapshot": {
    "nodes": [],
    "edges": []
  },
  "timeline_snapshot": [],
  "signals": [],
  "status": "OPEN",
  "created_at": "2026-09-29T00:20:41.229193Z",
  "updated_at": "2026-09-29T00:20:41.229193Z"
}
```

---

## 3. Investigation Graph & Activity Timeline

### `GET /alerts/{alert_id}/graph`
Returns NetworkX-generated focused case subgraph (maximum 2-3 hops) around the entities in the alert.
* **Method:** `GET`
* **Query Parameters:**
  * `depth` (default: 2, min: 1, max: 3)
* **Response (`GraphResponse`):**
```json
{
  "nodes": [
    {
      "id": "EMP-017",
      "type": "EMPLOYEE",
      "label": "EMP-017 (Teller)",
      "properties": {
        "role": "ROLE-TELLER",
        "branch": "BR-01",
        "status": "ACTIVE"
      }
    },
    {
      "id": "ACC-0231",
      "type": "ACCOUNT",
      "label": "ACC-0231",
      "properties": {
        "account_type": "SAVINGS",
        "current_balance": 1420500.0,
        "daily_limit": 500000.0
      }
    }
  ],
  "edges": [
    {
      "source": "EMP-017",
      "target": "ACC-0231",
      "type": "EDITED",
      "label": "EDITED (Limit Increase)",
      "properties": {
        "timestamp": "2026-09-02T14:15:00Z",
        "record_id": "CHG-DEMO-02"
      }
    },
    {
      "source": "ACC-0231",
      "target": "ACC-0442",
      "type": "TRANSFER",
      "label": "TRANSFER (₹280,000.00)",
      "properties": {
        "amount": 280000.0,
        "channel": "RTGS",
        "record_id": "TX-DEMO-01",
        "timestamp": "2026-09-02T14:45:00Z"
      }
    }
  ],
  "total_nodes": 2,
  "total_edges": 2
}
```

### `GET /alerts/{alert_id}/timeline`
Returns chronologically unified event stream merging access logs, account changes, transactions, approvals, and overrides.
* **Method:** `GET`
* **Query Parameters:**
  * `limit` (default: 50, max: 200)
* **Response (`TimelineResponse`):**
```json
{
  "events": [
    {
      "event_id": "LOG-DEMO-01",
      "event_type": "ACCESS_LOG",
      "timestamp": "2026-09-02T14:10:00Z",
      "actor": "EMP-017",
      "entity": "ACC-0231",
      "description": "Employee EMP-017 performed 'VIEW' on account ACC-0231 from branch BR-03",
      "source_record_id": "LOG-DEMO-01",
      "severity": "HIGH",
      "details": {
        "action": "VIEW",
        "branch": "BR-03",
        "device": "DEV-010"
      }
    },
    {
      "event_id": "CHG-DEMO-02",
      "event_type": "ACCOUNT_CHANGE",
      "timestamp": "2026-09-02T14:15:00Z",
      "actor": "EMP-017",
      "entity": "ACC-0231",
      "description": "Daily transfer limit elevated from ₹50,000 to ₹500,000 by EMP-017 without dual approval",
      "source_record_id": "CHG-DEMO-02",
      "severity": "CRITICAL",
      "details": {
        "field_changed": "daily_limit",
        "old_value": "50000",
        "new_value": "500000"
      }
    },
    {
      "event_id": "TX-DEMO-01",
      "event_type": "TRANSACTION",
      "timestamp": "2026-09-02T14:45:00Z",
      "actor": "ACC-0231",
      "entity": "ACC-0442",
      "description": "Transferred ₹280,000.00 via RTGS to ACC-0442",
      "source_record_id": "TX-DEMO-01",
      "severity": "HIGH",
      "details": {
        "amount": 280000.0,
        "channel": "RTGS"
      }
    }
  ],
  "total_events": 3
}
```

---

## 4. Case Management Lifecycle & Audit Trail

### `POST /cases`
Creates an investigation case from an alert.
* **Method:** `POST`
* **Headers:** `X-User-Role: ANALYST` | `REVIEWER` | `ADMIN`
* **Request Body (`CaseCreate`):**
```json
{
  "alert_id": "ALERT-8455D142",
  "assignee_id": "USR-INVESTIGATOR-01",
  "priority": "HIGH",
  "initial_note": "Initiating high-priority case due to teller limit manipulation."
}
```
* **Response (`CaseResponse`):** Status `201 Created`
```json
{
  "id": "CASE-571B3401",
  "alert_id": "ALERT-8455D142",
  "assignee_id": "USR-INVESTIGATOR-01",
  "status": "OPEN",
  "priority": "HIGH",
  "closure_reason": null,
  "notes": [
    {
      "author": "USR-ANALYST-1",
      "text": "Initiating high-priority case due to teller limit manipulation.",
      "timestamp": "2026-09-29T00:25:31.100Z"
    }
  ],
  "created_at": "2026-09-29T00:25:31.100Z",
  "updated_at": "2026-09-29T00:25:31.100Z",
  "closed_at": null
}
```

### `PATCH /cases/{case_id}`
Updates case status, assignee, priority, notes, or closes case.
* **Method:** `PATCH`
* **Headers:** `X-User-Role: REVIEWER` | `ADMIN`
* **Closure Invariant:** Setting `status` to `CLOSED_CONFIRMED` or `CLOSED_FALSE_POSITIVE` **strictly requires** a detailed `closure_reason` string (min 5 characters) and a concluding reviewer note.
* **Request Body (`CaseUpdate`):**
```json
{
  "status": "CLOSED_CONFIRMED",
  "closure_reason": "Confirmed insider collusion with branch teller EMP-017 and mule accounts.",
  "note": "Final investigation finding confirmed: unauthorized limit elevation and fraudulent dissipation."
}
```
* **Response (`CaseResponse`):** Status `200 OK`

### `POST /cases/{case_id}/notes`
Appends a reviewer note to the case dossier.
* **Method:** `POST`
* **Headers:** `X-User-Role: ANALYST` | `REVIEWER` | `ADMIN`
* **Request Body:**
```json
{
  "note": "Corroborated out-of-role branch access with door badge system."
}
```
* **Response (`CaseResponse`):** Status `200 OK`

---

## 5. Evidence Export & Cryptographic Verification

### `GET /cases/{case_id}/export`
Generates a complete, immutable legal evidence dossier in canonical JSON or downloadable PDF.
* **Method:** `GET`
* **Headers:** `X-User-Role: AUDITOR` | `REVIEWER` | `ADMIN`
* **Query Parameters:**
  * `format` (default: `json`): `json` or `pdf`
* **Response (JSON):**
```json
{
  "bundle_id": "BUNDLE-4FE6A529",
  "sha256": "44669c973101602a884761611dcf545a901844917a80b0373e35a09289291f09",
  "generated_at": "2026-09-29T00:25:35.819Z",
  "bundle": {
    "bundle_id": "BUNDLE-4FE6A529",
    "case_metadata": { ... },
    "alert": { ... },
    "signals": [ ... ],
    "evidence": [ ... ],
    "evidence_record_ids": [ ... ],
    "related_entities": [ ... ],
    "rule_trace": { ... },
    "counterfactual": { ... },
    "graph_snapshot": { ... },
    "timeline_snapshot": [ ... ],
    "reviewer_notes": [ ... ],
    "audit_history": [ ... ],
    "generated_at": "2026-09-29T00:25:35.819Z"
  }
}
```
* **Response (PDF):** `Content-Type: application/pdf`, `X-Payload-SHA256: <hash>` with complete formatted tables, timeline, and cryptographic watermark.

### `POST /export/verify` (or `POST /evidence/verify`)
Verifies cryptographic SHA-256 tamper-evidence of an exported evidence package.
* **Method:** `POST`
* **Request Body (`VerificationRequest`):**
```json
{
  "bundle": { ... },
  "hash": "44669c973101602a884761611dcf545a901844917a80b0373e35a09289291f09"
}
```
* **Response (`VerificationResponse`):**
```json
{
  "valid": true,
  "expected_hash": "44669c973101602a884761611dcf545a901844917a80b0373e35a09289291f09",
  "computed_hash": "44669c973101602a884761611dcf545a901844917a80b0373e35a09289291f09",
  "message": "Integrity check passed. Evidence bundle is authentic and unmodified."
}
```
*(If any byte of the payload is modified, `valid` evaluates to `false`).*

---

## 6. Blast Radius Analysis

### `GET /employees/{employee_id}/blast-radius`
Computes the complete organizational footprint and risk exposure of an employee.
* **Method:** `GET`
* **Path Parameters:** `employee_id` (e.g. `EMP-017`)
* **Response (`BlastRadiusResponse`):**
```json
{
  "employee": {
    "id": "EMP-017",
    "pseudonym_id": "P-EMP-017",
    "role_id": "ROLE-TELLER",
    "branch_id": "BR-01",
    "normal_work_start": "09:00",
    "normal_work_end": "18:00",
    "status": "ACTIVE"
  },
  "role_name": "Teller",
  "accounts_touched": ["ACC-0231", "ACC-0105", "ACC-0042"],
  "customers_touched": ["CUST-0013", "CUST-0089"],
  "devices_used": ["DEV-010", "DEV-001"],
  "actions_performed": {
    "VIEW": 38,
    "OVERRIDE": 2,
    "EDIT": 3
  },
  "transactions_following_actions": [ ... ],
  "alerts_involved": ["ALERT-8455D142"],
  "suspicious_accounts": ["ACC-0231"],
  "risk_clusters": [ ... ],
  "timeline": [ ... ],
  "total_actions_count": 43,
  "risk_level": "CRITICAL"
}
```

---

## 7. Model Evaluation & Benchmark Metrics

### `GET /metrics/evaluation`
Evaluates active detection rules against hidden ground-truth benchmarks, producing confusion matrices, scenario recalls, ablation metrics, and hard negative testing.
* **Method:** `GET`
* **Response (`EvaluationResponse`):**
```json
{
  "overall": {
    "tp": 6,
    "tn": 30,
    "fp": 2,
    "fn": 0,
    "precision": 0.75,
    "recall": 1.0,
    "f1": 0.8571,
    "fpr": 0.0625,
    "detection_rate": 1.0,
    "accuracy": 0.9474
  },
  "confusion_matrix": {
    "true_positive": 6,
    "true_negative": 30,
    "false_positive": 2,
    "false_negative": 0
  },
  "per_scenario": [
    {
      "scenario_type": "insider_collusion",
      "total_ground_truth": 1,
      "detected": 1,
      "recall": 1.0
    },
    {
      "scenario_type": "circular",
      "total_ground_truth": 4,
      "detected": 4,
      "recall": 1.0
    },
    {
      "scenario_type": "bulk_lookup",
      "total_ground_truth": 1,
      "detected": 1,
      "recall": 1.0
    }
  ],
  "ablation": {
    "baseline_financial_only": {
      "tp": 4,
      "tn": 26,
      "fp": 6,
      "fn": 2,
      "precision": 0.40,
      "recall": 0.667,
      "f1": 0.50,
      "fpr": 0.1875,
      "detection_rate": 0.667,
      "accuracy": 0.7895
    },
    "ours_financial_and_insider": {
      "tp": 6,
      "tn": 30,
      "fp": 2,
      "fn": 0,
      "precision": 0.75,
      "recall": 1.0,
      "f1": 0.8571,
      "fpr": 0.0625,
      "detection_rate": 1.0,
      "accuracy": 0.9474
    },
    "improvement_f1_delta": 0.3571,
    "improvement_fpr_reduction": -0.125,
    "detector_ablation": { ... }
  },
  "hard_negatives": {
    "total_hard_negatives": 32,
    "false_positives": 2,
    "true_negatives": 30,
    "fp_rate": 0.0625,
    "scenarios_tested": ["payroll_legitimate", "hard_negative_rent"]
  },
  "evaluated_at": "2026-09-29T00:25:36.120Z"
}
```

---

## 8. Red-Team Simulator

### `POST /simulate`
Generates live synthetic attack scenarios across 7 behavioral typologies and runs detection immediately to verify detection efficacy.
* **Method:** `POST`
* **Request Body (`SimulationRequest`):**
```json
{
  "scenario_type": "insider_collusion",
  "seed": 42,
  "intensity": 1.0
}
```
*Typologies supported:*
* `circular`
* `structuring`
* `insider_collusion`
* `privilege_abuse`
* `pass_through`
* `profile_mismatch`
* `hybrid`

* **Response (`SimulationResponse`):** Status `200 OK`
```json
{
  "scenario_id": "SIM-INSI-E40E0BE8",
  "scenario_type": "insider_collusion",
  "expected_behaviour": "Out-of-role teller elevation followed by structuring dissipation and rapid transfer",
  "generated_records_count": {
    "access_logs": 2,
    "account_changes": 2,
    "transactions": 4
  },
  "generated_records_summary": [ ... ],
  "detected_signals": [ ... ],
  "detected_alerts": [ ... ],
  "matched_expected": true,
  "summary": "Simulation generated 8 synthetic operational records. Detection engine successfully surfaced 3 matching signals and 1 alerts."
}
```
