# InsiderTrace

> **Evidence-First Financial Crime & Insider Risk Intelligence Platform** linking employee actions, customer accounts, transactional anomalies, and money-flow graphs.

---

## Architecture

InsiderTrace is architected as an **evidence-first, deterministic intelligence system**. It continuously ingests both internal operations activity (core banking access logs, account edits, limit adjustments, role delegations) and external financial transactions (UPI, NEFT, RTGS, Cash), correlating across domains to surface insider-facilitated financial crime.

```
                              ┌───────────────────────────────────┐
                              │     Heterogeneous Data Streams     │
                              │ (Access Logs, Changes, Transfers) │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │       Multi-Signal Detectors       │
                              │  (Financial, Insider, Sequencing)  │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │    Correlation & Linker Engine    │
                              │   (Shared Entities & Causality)   │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │  Deterministic Risk Tier Engine   │
                              │    + Counterfactual Explanations  │
                              └─────────────────┬─────────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
      ┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
      │  Case Management   │         │ Case Subgraph &    │         │ Tamper-Evident     │
      │  & Audit Trail     │         │ Unified Timeline   │         │ Evidence Dossier   │
      └────────────────────┘         └────────────────────┘         └────────────────────┘
```

---

## Features

1. **Deterministic Multi-Signal Detection:** 9 specialized detectors operating over transactions, account changes, and employee logs with strict evidence citations.
2. **Cross-Domain Correlation Linkage:** Bridges insider access anomalies with financial fund flow through entity overlap, causal sequencing, and timing analysis.
3. **Transparent Risk Tiering & Rule Traces:** Every alert is classified (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) using explainable, auditable rules rather than opaque ML scores.
4. **Counterfactual "What-If" Explanations:** Explains how changing conditions (e.g. authorized branch shift or lower transfer volume) would alter the risk tier.
5. **Interactive Subgraphs & Unified Timelines:** Fast NetworkX case subgraphs and merged chronological event streams for immediate investigator comprehension.
6. **Case Management with Strict Invariants:** State machine (`OPEN` → `IN_REVIEW` → `ESCALATED` → `CLOSED`) with mandatory closure reasoning and tamper-proof audit trails.
7. **Tamper-Evident SHA-256 Evidence Export:** One-click legal bundle export in canonical JSON or formatted ReportLab PDF, verifiable with cryptographic integrity checks.
8. **Employee Blast Radius Analysis:** Discovers touched accounts, customers, devices, and downstream transactions to quantify insider risk exposure.
9. **Red-Team Simulation Engine:** Injects on-demand attack scenarios across 7 typologies for continuous validation.
10. **Ground-Truth Isolated Evaluation:** Rigorous metrics, confusion matrices, hard negative testing, and ablation studies completely isolated from operator APIs.

---

## Detection Signals

### Financial Detectors
1. **`CIRCULAR_TRANSFER`**: Detects directed money-flow loops ($A \rightarrow B \rightarrow C \rightarrow A$) executed within a short time window.
2. **`STRUCTURING`**: Surfaces deliberate smurfing / threshold evasion ($n$ split transactions just under reporting thresholds within 72 hours).
3. **`RAPID_PASSTHROUGH`**: Detects mule accounts receiving funds and rapidly draining >85% of the balance within 4 hours.
4. **`PROFILE_MISMATCH`**: Identifies accounts whose monthly transactional volume or single transfer wildly exceeds their declared occupation and income profile.

### Insider Detectors
5. **`OUT_OF_ROLE_ACCESS`**: Flags employees executing operations forbidden by their RBAC role or outside their designated branch jurisdiction.
6. **`OFF_HOURS_ACCESS`**: Detects employee logins and modifications outside assigned shift windows without emergency exception tickets.
7. **`BULK_LOOKUP`**: Identifies reconnaissance behavior where an employee accesses anomalous volumes of customer accounts (>30 in 24 hours).
8. **`PRIVILEGE_ABUSE`**: Flags repeated managerial overrides, credit balance adjustments, or limit increases exceeding normal peer baselines.

### Sequencing & Correlation Detectors
9. **`ACTION_TRANSACTION_LINK`**: Identifies the high-risk temporal sequence: **Employee Action $\rightarrow$ Account Parameter Change $\rightarrow$ Rapid Outbound Transfer**.

---

## Setup

### Prerequisites
* Python 3.11+
* Docker & Docker Compose (optional for containerized deployment)

### Local Environment Installation
```bash
# Clone the repository
git clone https://github.com/sukrut07/ParadigmHMX.git
cd ParadigmHMX

# Install dependencies
pip install -r requirements.txt
```

---

## Environment Variables

Copy `.env.example` to `.env` or set the following environment variables:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./insidertrace.db` | SQLAlchemy database connection string (SQLite or PostgreSQL) |
| `SECRET_KEY` | `dev-secret-key-insidertrace-2026` | Secret key for hashing and cryptographic operations |
| `ENVIRONMENT` | `development` | Runtime environment (`development`, `test`, `production`) |
| `STRUCTURING_THRESHOLD` | `50000.0` | Reporting threshold for smurfing detection |
| `CYCLE_MAX_LENGTH` | `5` | Maximum path length for circular transfer cycle detection |
| `CYCLE_MIN_AMOUNT` | `15000.0` | Minimum transfer amount for cycle detection filtering |

---

## Database

InsiderTrace supports both SQLite and PostgreSQL. Migrations are managed via Alembic:

```bash
# Run migrations from repository root or backend/
alembic upgrade head
```

---

## Generate Data

Seed the deterministic synthetic banking dataset (500 customers, 600 accounts, 30 employees, 20,000 transactions, 10,000 access logs, and planted demo scenarios):

```bash
python scripts/generate_data.py --customers 500 --accounts 600 --transactions 20000 --events 10000 --seed 42
```

---

## Run Detection

Execute the multi-signal detection pipeline across all 9 detectors and correlate signals into evidence-first alerts:

```bash
python scripts/run_detection.py
```

---

## Run Evaluation

Run the benchmark evaluation engine against hidden ground-truth labels and compute ablation metrics:

```bash
python scripts/evaluate.py
```

---

## Run Tests

Execute the full pytest suite (27 unit, scenario, evidence-first invariant, and determinism tests):

```bash
pytest -ra -q
```

---

## Docker

Run the entire platform (PostgreSQL 16 + FastAPI Backend with automatic migrations and data seeding) via Docker Compose:

```bash
# Build and launch containers
docker compose build
docker compose up
```

Access the API at: `http://localhost:8000`

---

## API Documentation

When the backend is running, interactive OpenAPI documentation is available at:
* Swagger UI: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`
* OpenAPI JSON: `http://localhost:8000/openapi.json`
* Detailed Frontend Contract: [docs/API_CONTRACT.md](docs/API_CONTRACT.md)

---

## Demo Flow

To demonstrate the full investigative lifecycle:

1. **Inspect High-Risk Queue**: `GET /alerts?tier=CRITICAL` surfaces **Demo 1** (`EMP-017` teller limit increase followed by ₹280,000 dissipation into a circular laundering ring).
2. **Review Evidence-First Dossier**: `GET /alerts/{id}` shows all cited records (`LOG-DEMO-02`, `CHG-DEMO-02`, `TX-DEMO-01`), the deterministic rule trace, and the counterfactual explanation.
3. **Visualize Subgraph & Timeline**: `GET /alerts/{id}/graph` displays the focused case money flow; `GET /alerts/{id}/timeline` displays the chronological event stream.
4. **Initiate & Progress Case**: `POST /cases` creates `CASE-XXXX`; `PATCH /cases/{id}` moves status to `IN_REVIEW` and appends reviewer notes.
5. **Close with Invariants**: Attempting to close without `closure_reason` is rejected; closing with documented justification updates status to `CLOSED_CONFIRMED`.
6. **Export Tamper-Evident Dossier**: `GET /cases/{id}/export?format=json` generates the canonical bundle with SHA-256 fingerprint; `GET /cases/{id}/export?format=pdf` generates the legal PDF dossier.
7. **Verify Cryptographic Hash**: `POST /export/verify` validates the bundle integrity (`valid: true`). Modifying any field causes verification to fail (`valid: false`).
8. **Assess Blast Radius**: `GET /employees/EMP-017/blast-radius` surfaces all 252 accounts touched by the rogue employee.
9. **Demonstrate Hard Negative Resilience**: Show that **Demo 2** (30-employee monthly corporate payroll) is recognized as legitimate and does not trigger false escalations.

---

## Evaluation Methodology

The platform is evaluated against seeded ground-truth scenarios with strict isolation:
* **Detection Metrics**: Confusion matrix (TP, TN, FP, FN), Precision, Recall, F1 Score, and False Positive Rate (FPR).
* **Ablation Comparison**: Rigorous side-by-side comparison between **Baseline** (financial-only rules) and **InsiderTrace** (financial + employee context).
* **Hard Negative Testing**: Evaluates benign lookalikes (payroll batches, rent payments, authorized exceptions) to ensure low false positive rates.

---

## Limitations

> **Evaluation uses synthetic data and is not representative of production banking performance.**  
> Detection thresholds and rules are configured for hackathon demonstration scenarios. Production deployment requires calibration against historical core-banking baselines, institution-specific AML policies, and regulatory reporting mandates.