# Problem Statement (PS) Traceability Matrix

This matrix maps every core requirement from the Hackathon Problem Statement to its exact backend implementation, exposed API endpoint, and automated test suite.

| PS Requirement | Backend Implementation | Endpoint | Automated Test |
| :--- | :--- | :--- | :--- |
| **Money-Flow Graph Engine** | NetworkX-based directed sub-graph generator with hop bounding and entity clustering (`GraphBuilder`) | `GET /alerts/{id}/graph`<br>`GET /graph` | `tests/test_api_endpoints.py::test_get_alert_graph`<br>`tests/test_scenarios.py::test_case_graph_focused` |
| **Unified Activity Timeline** | Chronological multi-source event unification across access logs, account changes, transactions, approvals, overrides (`TimelineBuilder`) | `GET /alerts/{id}/timeline`<br>`GET /timeline` | `tests/test_api_endpoints.py::test_get_alert_timeline`<br>`tests/test_scenarios.py::test_case_timeline_merged` |
| **Employee-to-Financial Linkage** | Correlation engine associating insider access violations with transactional anomalies via entity overlap and causal sequencing (`CorrelationLinker`) | `GET /alerts/{id}`<br>`GET /alerts` | `tests/test_critical_evidence.py::test_emp_017_insider_linkage`<br>`tests/test_detectors.py::test_action_transaction_detector` |
| **Explainable Risk Tiers** | Deterministic tier engine with externalized YAML rules (`TierEngine`, `risk_rules.yaml`, `build_rule_trace`) | `GET /alerts/{id}` | `tests/test_critical_evidence.py::test_deterministic_tier_assignment`<br>`tests/test_determinism.py::test_determinism_identical_runs` |
| **Counterfactual Engine** | Systematic hypothesis mutation (neutralizing insider access or limits) and deterministic re-tiering (`CounterfactualEngine`) | `GET /alerts/{id}` | `tests/test_critical_evidence.py::test_counterfactual_explanation` |
| **Strict Evidence-First Guarantee** | Central invariant validator asserting all evidence references real DB records with zero fictional IDs (`validate_signal`, `validate_alert`) | `GET /alerts/{id}` | `tests/test_evidence_validator.py::test_all_evidence_ids_exist_in_db`<br>`tests/test_critical_evidence.py::test_every_alert_has_evidence` |
| **Case Management Lifecycle** | State machine (`OPEN` → `IN_REVIEW` → `ESCALATED` → `CLOSED`), mandatory closure reasoning, reviewer notes, and audit trail (`CaseService`) | `POST /cases`<br>`PATCH /cases/{id}`<br>`POST /cases/{id}/notes` | `tests/test_api_endpoints.py::test_case_management_lifecycle`<br>`tests/test_api_endpoints.py::test_case_closure_requires_reason` |
| **Tamper-Evident Evidence Export** | Canonical JSON serializer and ReportLab PDF dossier generator with SHA-256 digital fingerprint (`EvidenceExporter`) | `GET /cases/{id}/export` | `tests/test_api_endpoints.py::test_export_evidence_bundle`<br>`tests/test_hash_verification.py::test_export_canonical_hash` |
| **Cryptographic SHA-256 Verification** | Digital hash verification engine detecting 1-bit payload tamper (`verify_payload_hash`) | `POST /export/verify`<br>`POST /evidence/verify` | `tests/test_hash_verification.py::test_tamper_detection_fails_verification`<br>`tests/test_api_endpoints.py::test_verify_tampered_bundle` |
| **Employee Blast Radius Analysis** | Cross-organizational analysis of accounts touched, customers, devices used, subsequent transactions, and risk clusters (`BlastRadiusAnalyzer`) | `GET /employees/{id}/blast-radius` | `tests/test_api_endpoints.py::test_employee_blast_radius`<br>`tests/test_scenarios.py::test_blast_radius_contains_compromised_account` |
| **Benchmark Model Evaluation** | Rigorous confusion matrix (TP, TN, FP, FN), precision, recall, F1 score, FPR against hidden ground truth (`EvaluationEngine`) | `GET /metrics/evaluation` | `tests/test_api_endpoints.py::test_evaluation_metrics`<br>`scripts/evaluate.py` |
| **Baseline vs. Linked Ablation** | Side-by-side empirical comparison proving value of insider context over financial-only detection (`EvaluationEngine.ablation`) | `GET /metrics/evaluation` | `tests/test_api_endpoints.py::test_evaluation_ablation`<br>`scripts/evaluate.py` |
| **Hard Negative Lookalike Testing** | Systematic verification of routine lookalikes (corporate payroll, rent, utilities, authorized exceptions) avoiding false escalations | `GET /metrics/evaluation` | `tests/test_scenarios.py::test_payroll_hard_negative_not_escalated`<br>`scripts/evaluate.py` |
| **Red-Team Attack Simulator** | On-demand parameterized scenario injection across 7 fraud typologies (`RedTeamSimulator`) | `POST /simulate` | `tests/test_api_endpoints.py::test_simulation_endpoint`<br>`tests/test_scenarios.py::test_simulate_variants` |
| **Ground Truth Isolation** | Strict security isolation ensuring evaluation labels and scenario metadata are never leaked via operator APIs | `GET /alerts`<br>`GET /alerts/{id}`<br>`GET /employees/{id}/blast-radius` | `tests/test_ground_truth_isolation.py::test_normal_endpoints_never_expose_ground_truth` |
| **Idempotence & Determinism** | Seeded random number generation and deterministic hash deduplication producing bit-identical alerts across runs | `scripts/generate_data.py`<br>`scripts/run_detection.py` | `tests/test_determinism.py::test_determinism_identical_runs` |

---

## Verification Commands
To execute the complete verification pass corresponding to this matrix:

```bash
# 1. Run all pytest unit & integration tests
pytest -ra -q

# 2. Re-run synthetic generator from clean database with seed=42
python scripts/generate_data.py --customers 500 --accounts 600 --transactions 20000 --events 10000 --seed 42

# 3. Execute multi-detector detection pipeline
python scripts/run_detection.py

# 4. Run ground-truth evaluation & ablation study
python scripts/evaluate.py
```
