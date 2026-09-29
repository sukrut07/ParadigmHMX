# InsiderTrace

<div align="center">

**Evidence-First Financial Crime & Insider Risk Intelligence Platform**  
*Unifying Employee Operations, Account Parameters, Transactional Networks, and Money-Flow Subgraphs*

[![Python Version](https://img.shields.io/badge/Python-3.11%20%7C%203.14-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%20%7C%206.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Alembic](https://img.shields.io/badge/Alembic-1.20+-red)](https://alembic.sqlalchemy.org/)
[![Pytest](https://img.shields.io/badge/Tests-30%20Passed-brightgreen?logo=pytest&logoColor=white)](https://pytest.org/)
[![Type Checker](https://img.shields.io/badge/Pyright%20%26%20Pyrefly-0%20Errors-success)](https://pyrefly.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[Architecture](#system-architecture) • [Expected Outcomes Pipeline](#core-expected-outcomes--pipeline-architecture) • [Features](#key-capabilities) • [Detection Typologies](#detection-typologies--the-9-detectors) • [Persona Workspaces](#persona-dashboards--workspaces) • [Installation](#getting-started) • [API Contract](#api-endpoints-reference) • [Evaluation](#evaluation-methodology--benchmarks)

</div>

---

## Executive Summary

Financial institutions face an existential vulnerability at the intersection of **employee operational authority** and **money laundering networks**. Traditional financial crime infrastructure is split into disjointed silos:
* **Transaction Monitoring Systems (AML / TMS)** scrutinize client-to-client payment amounts, structuring, and velocity—blind to internal overrides, credential abuses, and employee account modifications.
* **User & Entity Behavior Analytics (UEBA / IAM)** monitor employee workstation logins and access tickets—blind to downstream money flow and circular financial dissipation.

**InsiderTrace** eliminates this blindspot. It is an **evidence-first, deterministic intelligence system** that ingests both internal banking operational streams (*access logs, contact edits, limit adjustments, role delegations*) and external payments (*UPI, NEFT, RTGS, Cash*). By analyzing causal sequences, temporal proximity, and entity subgraphs, InsiderTrace surfaces insider-facilitated financial crime with cryptographic proof, deterministic rule traces, and actionable counterfactual explanations.

---

## System Architecture

InsiderTrace is designed around a multi-stage pipeline where raw events are ingested, filtered into high-confidence atomic signals, causally correlated into multi-domain clusters, and scored through auditable deterministic rule sets.

```
                              ┌──────────────────────────────────────────────┐
                              │          Heterogeneous Ingestion             │
                              │ ──────────────────────────────────────────── │
                              │ • Core Banking Access Logs (VIEW, EDIT, OVR) │
                              │ • Account Parameter Changes (Limit, Phone)   │
                              │ • Payment Transactions (UPI, NEFT, RTGS)     │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │       9 Specialized Signal Detectors         │
                              │ ──────────────────────────────────────────── │
                              │ • Financial: Loops, Structuring, Passthrough │
                              │ • Insider: Out-of-Role, Off-Hours, Overrides │
                              │ • Causal: Action ➔ Param Edit ➔ Dissipation  │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │         Correlation & Linker Engine          │
                              │ ──────────────────────────────────────────── │
                              │ • Causal Chain Assembly & Temporal Windows   │
                              │ • Entity Graph Clustering & Cross-Referencing│
                              │ • SHA-256 Deduplication Hash Fingerprinting  │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │        Deterministic Risk Tier Engine        │
                              │ ──────────────────────────────────────────── │
                              │ • Transparent YAML Rule Set (CRITICAL..LOW)  │
                              │ • Rule Trace (Matched Conditions & Triggers) │
                              │ • Automated Counterfactual "What-If" Engine  │
                              └──────────────────────┬───────────────────────┘
                                                     │
                   ┌─────────────────────────────────┼─────────────────────────────────┐
                   ▼                                 ▼                                 ▼
      ┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
      │  Investigation & Case   │       │  Interactive Subgraph   │       │ Tamper-Evident Dossier  │
      │  Management State Mach  │       │   & Unified Timelines   │       │   & SHA-256 Verification│
      │ ─────────────────────── │       │ ─────────────────────── │       │ ─────────────────────── │
      │ Strict Invariants, PII  │       │ Cytoscape Graph Network,│       │ RFC 8785 Canonical JSON,│
      │ Masking, Audit Log Trail│       │ Chronological Log Stream│       │ ReportLab PDF Export    │
      └─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

---

## Core Expected Outcomes & Pipeline Architecture

InsiderTrace was engineered specifically to fulfill every dimension of the unified investigation platform mandate:

### 1. Money-Flow Graph and Activity Timeline
* **Entity-Resolved Graph Subgraphs:** Constructs high-performance NetworkX graphs and interactive Cytoscape subgraphs mapping multi-hop money trails, account relationships, and employee touchpoints.
* **Distinct Entity & Edge Semantics:**
  - **Nodes:** Employees (Purple/Indigo), Customer Accounts (Cyan/Blue), Customers (Emerald/Green), and Transactions (Amber/Orange).
  - **Directed Edges:** Financial transactions annotated with currency amount (`₹`) in emerald/cyan, administrative employee edits and parameter changes in dashed orange, operational overrides, and circular laundering loops highlighted in crimson.
* **Unified Activity Timeline:** Reconciles disparate operational silos into a single, millisecond-accurate investigative event stream:
  - Heterogeneous streams: Core banking access logs (`VIEW`, `EDIT`, `OVERRIDE`), security parameter edits (daily limit increases, mobile/OTP changes), and financial transfers (`UPI`, `NEFT`, `RTGS`, Cash).
  - Formatted with relative time deltas ($T+0\text{m}$, $T+14\text{m}$, etc.) to expose causal insider operational facilitation immediately preceding financial dissipation.

### 2. Explainable Risk Levels for Connected Anomalies (Not an Opaque Single Score)
Rather than condensing complex multi-domain fraud into an uninterpretable 0–100 black-box number, InsiderTrace evaluates a **5-Dimension Deterministic Risk Breakdown Matrix**:
1. **Insider Privilege Risk:** Evaluates RBAC permissions, branch jurisdictional boundaries, off-hours access, and emergency limit overrides.
2. **Money-Flow Topology Risk:** Detects structured laundering patterns such as circular loops ($A \rightarrow B \rightarrow C \rightarrow A$), mule splitting/smurfing, and rapid fund dissipation ($\ge 85\%$ within 4h).
3. **Profile / KYC Mismatch Risk:** Flags transaction bursts exceeding declared customer occupation income ceilings ($> 3.0\times$).
4. **Causal Temporal Linkage Risk:** Identifies tight temporal coupling between insider parameter modifications and outbound transactions (e.g., limit boost $\rightarrow$ transfer in $< 24$ hours).
5. **Network Exposure / Blast Radius Risk:** Quantifies graph centrality, number of exposed customer accounts, and blast radius of the involved employee.
* Every alert includes a transparent **Rule Trace** detailing matched conditions and automated **Counterfactual "What-If" Explanations** (e.g., *"If employee EMP-017 possessed Branch Manager authority, risk tier drops from CRITICAL to LOW"*).

### 3. Case Assignment & Evidence Export for Reviewers
* **Formal Reviewer Workflow:** Reviewers and investigators can be assigned directly to active alerts and cases (`Analyst Priya Sharma (Fraud Ops)`, `Reviewer Vikram Seth (AML Review)`, `Senior Investigator Ananya Rao (Insider Risk)`).
* **Strict State Transition Invariants:** Finite state machine (`OPEN` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `ESCALATED` $\rightarrow$ `CLOSED_CONFIRMED` / `CLOSED_FALSE_POSITIVE`). Enforces mandatory documented closure reasoning and reviewer evidence notes before case resolution.
* **Tamper-Evident Dual Evidence Export:**
  - **RFC 8785 Canonical JSON:** Deterministically ordered JSON payload with normalized float precision, accompanied by an immutable SHA-256 digital fingerprint.
  - **ReportLab PDF Forensic Dossier:** Multi-page regulatory dossier including executive summary, multi-dimensional risk matrix, entity subgraph metadata, chronological event logs, and embedded SHA-256 seal.
  - **In-App Verification Modal:** One-click cryptographic verification (`POST /api/export/verify`) proving the export has not been altered post-generation.

### 4. Rigorous Testing on Suspicious & Legitimate Scenarios (Accuracy & FPR)
* **Isolated Benchmark Harness:** Tested on both covert attack scenarios and realistic benign operational activity (routine corporate payroll runs, scheduled rental disbursements, and high-velocity batch operations).
* **Demonstrated Empirical Performance:**
  - **Recall:** **100.00%** on planted multi-signal financial and insider attacks (zero missed true positives).
  - **False Positive Rate (FPR):** **9.38%** on 32 hard negatives across corporate payroll and batch payments.
  - **Precision:** **70.00%** | **F1 Score:** **82.35%**.
  - **Ablation Lift:** Fusing insider operational telemetry with transaction monitoring achieves a **+29.7% F1 improvement** and a **-12.5% reduction in False Positive Rate** compared to traditional transaction-only monitoring.

### 5. Mandatory Evidence & Explanation Panel Alongside Every Alert
* **Executive Split-View Workspace (`/alerts`):** Rather than presenting an opaque list of scores, the Fraud Analyst triage queue is permanently paired with a dedicated, live-updating **Mandatory Evidence & Explanation Panel** on the right side of the screen.
* **Zero-Click Context Switching:** Selecting any alert in the queue instantly populates the panel with:
  - 5-Dimension Risk Breakdown Matrix with visual score bars and specific risk indicators.
  - Primary detector triggers and matched rule conditions.
  - Relative-time causal activity timeline.
  - Database-cited audit records (transaction IDs, access log IDs).
  - Counterfactual explanation card.
  - In-line case creation and reviewer assignment controls.
* **Deep Forensic Workspace (`/investigation/:id`):** Full-screen investigative canvas with the Cytoscape graph visualizer, chronological event timeline, and complete evidence export tools.

---

## Key Capabilities

1. **Deterministic Multi-Signal Engine:** 9 specialized heuristic and graph detectors operating over transactions, account alterations, and operator logs.
2. **Causal Cross-Domain Correlation:** Detects the high-risk operational triad: **Unauthorized Access $\rightarrow$ Security Parameter Override $\rightarrow$ Rapid Outbound Transfer**.
3. **Transparent Risk Tiering & Rule Traces:** Zero "black-box" machine learning hallucination. Every alert has a deterministic risk tier (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) accompanied by exact rule triggering paths.
4. **Counterfactual "What-If" Reasoning:** Computes the minimal condition shift required to downgrade or eliminate the alert (e.g., *"If employee EMP-017 held Branch Manager privileges, risk tier drops from CRITICAL to LOW"*).
5. **Interactive Subgraphs & Unified Chronology:** High-performance NetworkX graph extraction and merged multi-source event streams rendered dynamically with Cytoscape.js.
6. **Case Management with Enforced Invariants:** A strict state transition machine (`OPEN` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `ESCALATED` $\rightarrow$ `CLOSED_CONFIRMED` / `CLOSED_FALSE_POSITIVE`). Enforces mandatory documented closure reasoning and reviewer evidence notes.
7. **Cryptographic SHA-256 Evidence Export:** Exports complete forensic dossiers in RFC 8785 canonical JSON or formatted ReportLab PDF, fingerprinted with SHA-256 digests for legal chain-of-custody.
8. **Employee Blast Radius Analysis:** Discovers all customer accounts, branch terminals, and downstream financial volume touched by a suspected employee over a rolling window.
9. **On-Demand Adversary Simulation:** In-memory red-team engine synthesizing fresh adversary injection scenarios across 7 attack typologies to validate institutional defense rules.
10. **Completely Isolated Ground-Truth Benchmark:** Built-in quantitative evaluation harness computing precision, recall, F1-score, False Positive Rates, and ablation deltas without leaking test labels to operational APIs.

---

## Detection Typologies & The 9 Detectors

| # | Detector Name | Signal Type | Category | Detection Logic & Invariants |
|:---|:---|:---|:---|:---|
| 1 | **Circular Transfer** | `CIRCULAR_TRANSFER` | Financial | Detects directed money loops ($A \rightarrow B \rightarrow C \rightarrow A$) where transactions execute chronologically within a configurable time window (default: 48 hours, $\ge 3$ hops, amount $\ge$ ₹15,000). |
| 2 | **Structuring / Smurfing** | `STRUCTURING` | Financial | Flags deliberate evasion of mandatory reporting thresholds ($0.60 \times \text{Threshold} \le \text{amount} < 0.99 \times \text{Threshold}$) across $\ge 3$ transactions in a 72-hour rolling window. |
| 3 | **Rapid Passthrough** | `RAPID_PASSTHROUGH` | Financial | Identifies mule behavior where an account receives an inbound lump sum and dissipates $\ge 85\%$ of the funds within 4 hours. |
| 4 | **Profile Mismatch** | `PROFILE_MISMATCH` | Financial | Flags transactions where payment volume exceeds $3.0\times$ the customer's declared monthly income ceiling based on occupation profile. |
| 5 | **Out-of-Role Access** | `OUT_OF_ROLE_ACCESS` | Insider | Flags employee operations explicitly forbidden by RBAC permissions or performed outside their assigned branch jurisdiction. |
| 6 | **Off-Hours Activity** | `OFF_HOURS_ACCESS` | Insider | Detects employee logins, modifications, and approvals executed outside assigned shift hours without authorized emergency override tickets. |
| 7 | **Bulk Account Lookup** | `BULK_LOOKUP` | Insider | Detects reconnaissance patterns where an employee queries an anomalous number of unique customer accounts ($> 30$ accounts in 24 hours, $z$-score $> 2.0$). |
| 8 | **Privilege Abuse** | `PRIVILEGE_ABUSE` | Insider | Flags repeated managerial overrides, unapproved daily transfer limit raises, and KYC parameter resets exceeding peer benchmarks. |
| 9 | **Action-Transaction Link** | `ACTION_TRANSACTION_LINK` | Cross-Domain | Bridges operational changes and financial outflow: Flags when an employee modifies account parameters (phone, limit, KYC) followed by outbound fund drainage within 24 hours. |

---

## Persona Dashboards & Workspaces

InsiderTrace provides four tailored workspaces designed for different operational personas:

```
                                  INSIDERTRACE PLATFORM
                                            │
        ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
        ▼                   ▼                               ▼                   ▼
┌───────────────┐   ┌───────────────┐               ┌───────────────┐   ┌───────────────┐
│ Fraud Analyst │   │Internal Audit │               │Compliance Head│   │ Investigation │
│   Workspace   │   │Intelligence   │               │   Overview    │   │   Workspace   │
└───────────────┘   └───────────────┘               └───────────────┘   └───────────────┘
```

### 1. Fraud Analyst Workspace (`/alerts`)
* **Executive Split-View Workspace:** Two-column investigation layout pairing the priority alert queue directly with a persistent **Mandatory Evidence & Explanation Panel**.
* **Zero-Click Live Context:** Selecting any alert dynamically updates the panel with the 5-dimension risk matrix, primary detector triggers, causal timeline, and cited audit IDs.
* **Instant Case Escalation:** Convert high-risk alerts into formal investigations with one-click case creation and reviewer assignment.

### 2. Case Management & Reviewer Workspace (`/cases`)
* **Reviewer Assignment Workflow:** Assign investigative cases to active reviewers (`Analyst Priya Sharma`, `Reviewer Vikram Seth`, `Senior Investigator Ananya Rao`).
* **Enforced State Lifecycle:** Strict state machine transitions (`OPEN` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `ESCALATED` $\rightarrow$ `CLOSED_CONFIRMED` / `CLOSED_FALSE_POSITIVE`).
* **Documented Closure Invariants:** Requires reviewer rationale and note documentation before any case can be closed.
* **Dual Dossier Export:** Download RFC 8785 Canonical JSON or ReportLab PDF evidence packages directly from the case table.

### 3. Internal Audit & Employee Intelligence (`/audit`)
* **Peer-Group Anomaly Scores:** Z-score ranking of staff account lookups and privilege overrides against role baselines.
* **Blast Radius Quantification:** Computes total customer accounts, branch devices, and financial volume exposed to an individual operator.
* **Branch Risk Heatmap:** Cross-branch operational compliance health and anomaly density metrics.

### 4. Compliance Head & Executive Overview (`/compliance`)
* **Regulatory Compliance Readiness:** Tracking case resolution timelines, mandatory justification adherence, and SAR filing readiness.
* **Ablation Performance:** Side-by-side empirical metrics proving the detection lift of combining employee context with transaction monitoring.
* **False Positive Reduction:** Live tracking of hard negative resilience across benign payroll lookalikes and scheduled rent transfers.

### 5. Forensic Investigation Workspace (`/investigation/:id`)
* **Interactive Cytoscape Network Subgraphs:** Dynamic visual exploration of fund transfers, account links, employee touchpoints, and shared devices with directional styling and visual legend.
* **Unified Chronological Timeline:** Unified, millisecond-accurate event stream merging core banking access logs, account field updates, and external payment rails.
* **Forensic Evidence Dossier:** Tamper-evident bundle viewer with canonical JSON and formatted ReportLab PDF download.
* **Cryptographic Integrity Verification:** On-screen verification modal validating the SHA-256 hash against the canonical payload.

---

## Seeded Demo Scenarios

The repository includes a deterministic seeding harness (`seed=42`) pre-populating rich corporate banking baseline activity alongside five flagship demo scenarios:

### Scenario 1: Insider Collusion & Circular Laundering (CRITICAL)
* **Entities:** Employee `EMP-017` (Teller), Customer Account `ACC-0231` (Victim/Target), Mules `ACC-0442`, `ACC-0553`, and `ACC-0231`.
* **Execution Sequence:**
  1. `EMP-017` views `ACC-0231` and edits contact phone number without approval.
  2. `EMP-017` executes an unauthorized daily limit boost override.
  3. Immediate outbound transfers of ₹4,80,000 and ₹4,70,000 dissipate from `ACC-0231`.
  4. Funds circulate through mule ring: `ACC-0231` $\rightarrow$ `ACC-0442` $\rightarrow$ `ACC-0553` $\rightarrow$ `ACC-0231`.
* **Platform Outcome:** Correctly correlated into a single unified `CRITICAL` alert with 4 linked signals, accompanied by rule traces and subgraphs.

### Scenario 2: Legitimate High-Volume Corporate Payroll (HARD NEGATIVE)
* **Entities:** Corporate Account `ACC-PAYROLL-01`, 30 Employee Destination Accounts.
* **Execution Sequence:** High-velocity batch disbursement of ₹18,00,000 executed on the 1st of the month.
* **Platform Outcome:** The rule engine recognizes payroll cadence and benign batch attributes; zero `CRITICAL` or `HIGH` alerts are emitted.

### Scenario 3: Bulk Reconnaissance & Insider Policy Breach (MEDIUM)
* **Entities:** Employee `EMP-022` (Operations Analyst).
* **Execution Sequence:** `EMP-022` conducts unauthorized searches across 42 unrelated customer accounts in 3 hours ($z$-score $> 3.5$).
* **Platform Outcome:** Emits an insider behavioral anomaly alert citing access records, without falsely implicating transactional fraud.

### Scenario 4: External Financial Laundering Ring (HIGH)
* **Entities:** Accounts `ACC-8801`, `ACC-8802`, `ACC-8803`.
* **Execution Sequence:** Rapid 3-hop circular transfer of ₹2,50,000 executed via automated UPI rails.
* **Platform Outcome:** Surfaces a high-priority financial crime alert attributing zero employee involvement.

### Scenario 5: Transaction Splitting / Smurfing Structuring (HIGH)
* **Entities:** Customer Accounts `ACC-7701` (Source Account), `ACC-7702` (Mule 1), `ACC-7703` (Mule 2).
* **Execution Sequence:**
  1. `ACC-7701` executes four consecutive rapid transfers of ₹48,500, ₹49,200, ₹47,800, and ₹48,900 to `ACC-7702` and `ACC-7703` within 2 hours.
  2. All transactions are calibrated just under the ₹50,000 statutory reporting threshold to evade AML monitoring.
* **Platform Outcome:** The `STRUCTURING` detector detects sub-threshold clustering and links the multi-hop transfers into an explainable `HIGH` risk alert with full evidence attribution.

---

## Repository Structure

```text
ParadigmHMX/
├── .venv/                         # Project virtual environment (Python 3.14/3.11)
├── .vscode/
│   └── settings.json             # Workspace settings (Python interpreter, search paths)
├── backend/
│   ├── alembic/                  # Database migration scripts & env configuration
│   ├── alembic.ini               # Alembic configuration
│   ├── Dockerfile                # Backend container definition
│   ├── docker-compose.yml        # Docker compose service definition
│   ├── insidertrace.db           # SQLite development & demo database fixture
│   ├── pytest.ini                # Pytest test configuration
│   ├── requirements.txt          # Python dependency declarations
│   ├── app/
│   │   ├── api/                  # FastAPI routers and dependency injection
│   │   │   ├── deps.py           # Database sessions and security context dependencies
│   │   │   └── routes/           # REST endpoints (alerts, cases, employees, etc.)
│   │   ├── config.py             # Pydantic environment settings
│   │   ├── db/
│   │   │   ├── seed.py           # Deterministic synthetic banking data generator
│   │   │   └── session.py        # SQLAlchemy 2.0 engine, SessionLocal, DeclarativeBase
│   │   ├── models/               # SQLAlchemy 2.0 Mapped declarative models
│   │   ├── schemas/              # Pydantic validation and serialization models
│   │   ├── services/
│   │   │   ├── cases/            # Case management and audit logging service
│   │   │   ├── correlation/      # Multi-signal linker, rule trace, counterfactuals
│   │   │   ├── detection/        # 9 specialized heuristic and graph detectors
│   │   │   ├── evaluation/       # Benchmark metrics, ablation, and confusion matrix
│   │   │   ├── evidence/         # Canonical JSON hashing & ReportLab PDF exporter
│   │   │   ├── graph/            # NetworkX graph builder & employee blast radius
│   │   │   ├── simulation/       # Red-team attack injection engine
│   │   │   └── timeline/         # Chronological multi-stream event unification
│   │   ├── utils/                # RFC 8785 hashing, ID generation, time helpers
│   │   ├── main.py               # FastAPI application entrypoint and middleware
│   │   └── risk_rules.yaml       # Deterministic risk tiering configuration
│   ├── scripts/                  # CLI utilities for backend execution
│   └── tests/                    # 27 comprehensive pytest test suites
├── docs/
│   ├── API_CONTRACT.md           # Exhaustive REST API specification
│   └── PS_TRACEABILITY.md        # Technical specification traceability matrix
├── frontend/
│   ├── src/
│   │   ├── components/           # UI components (RiskBadge, Cytoscape graph, etc.)
│   │   ├── pages/                # Workspace views (Fraud, Audit, Compliance, etc.)
│   │   ├── services/             # Axios API client bindings
│   │   ├── types/                # TypeScript type definitions
│   │   ├── App.tsx               # Application routing and layout
│   │   └── main.tsx              # React 19 application root
│   ├── package.json              # Node dependencies & build scripts
│   ├── tsconfig.json             # TypeScript configuration
│   └── vite.config.ts            # Vite 8 build configuration
├── scripts/                      # Root CLI entrypoint proxies (runpy execution)
├── pyrefly.toml                  # Pyrefly type checker configuration
├── pyrightconfig.json            # Pyright type checker configuration
├── README.md                     # Project documentation
└── requirements.txt              # Top-level requirements specification
```

---

## Getting Started

### Prerequisites
* **Python:** `3.11` to `3.14`
* **Node.js:** `v20+` and `npm`
* **Git**

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/sukrut07/ParadigmHMX.git
cd ParadigmHMX

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Run database migrations
cd backend
alembic upgrade head
cd ..

# Seed the deterministic demo dataset
python scripts/seed_demo.py

# Run live detection pipeline
python scripts/run_detection.py

# Launch FastAPI development server
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: **`http://localhost:8000`**  
Interactive Swagger docs: **`http://localhost:8000/docs`**

---

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend application will be live at: **`http://localhost:5173`**

---

## Verification & Testing Suite

InsiderTrace maintains zero type errors and zero test failures across both backend and frontend.

```bash
# 1. Run all 30 Backend Pytest Tests (Unit, Determinism, Isolation, Scenarios, Accuracy & FPR)
pytest backend/tests -v

# 2. Run Python Type Checkers (Both Pyrefly and Pyright verify 0 errors natively)
pyrefly check backend
pyright

# 3. Verify Code Compilation
python -m compileall backend

# 4. Check Alembic Migrations Consistency
cd backend && alembic check && cd ..

# 5. Frontend Type Checking & Production Build
cd frontend
npm run lint
npm run build
```

---

## CLI Utilities

InsiderTrace provides standalone CLI scripts located in [`scripts/`](file:///Users/sukrutdusane/Documents/Projects%20/Sy/ParadigmHMX/scripts):

```bash
# Seed the complete demo scenarios and banking baseline
python scripts/seed_demo.py

# Generate custom volume of synthetic banking data
python scripts/generate_data.py --customers 500 --accounts 600 --transactions 20000 --events 10000 --seed 42

# Execute the 9 detectors and correlate signals into alerts
python scripts/run_detection.py

# Run benchmark evaluation and ablation study against ground truth
python scripts/evaluate.py
```

---

## API Endpoints Reference

All endpoints return unified JSON structures and adhere to the contract defined in [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/health` | System status, database connectivity, and entity counts |
| `GET` | `/demo/summary` | Statistical summary of active alerts, cases, and signals |
| `GET` | `/alerts` | Query alerts filtered by `tier` (`CRITICAL`..`LOW`), `status`, and `limit` |
| `GET` | `/alerts/{id}` | Complete alert investigation dossier (rule trace, counterfactuals) |
| `GET` | `/alerts/{id}/graph` | Cytoscape-formatted entity subgraph centered around alert |
| `GET` | `/alerts/{id}/timeline` | Chronological event stream merging logs, changes, and transfers |
| `GET` | `/cases` | List investigative cases with status, priority, and assignee |
| `POST` | `/cases` | Create a new investigation case linked to an alert |
| `PATCH` | `/cases/{id}` | Update case status, assign reviewer, or append notes (enforces closure rules) |
| `GET` | `/cases/{id}/export?format=json\|pdf` | Export legal evidence bundle in canonical JSON or ReportLab PDF |
| `POST` | `/api/export/verify` | Verify cryptographic SHA-256 integrity of an exported dossier |
| `GET` | `/employees/{id}/blast-radius` | Discovery of all accounts, customers, devices, and funds touched by staff |
| `GET` | `/dashboard/fraud` | Real-time KPIs, priority alerts, and risk distribution for Fraud Analysts |
| `GET` | `/dashboard/audit` | Employee anomaly $z$-scores, blast radius, and branch risk metrics |
| `GET` | `/dashboard/compliance` | Regulatory metrics, precision/recall ablation, and resolution rates |
| `POST` | `/simulation/attack` | In-memory red-team synthesis of attack scenarios across 7 typologies |
| `GET` | `/evaluation/benchmark` | Isolated evaluation against ground truth (TP, FP, Precision, Recall, F1) |

---

## Cryptographic Evidence Integrity

Every alert and case bundle exported by InsiderTrace is protected against tampering:
1. **RFC 8785 Canonical JSON Serialization:** Dict keys are deterministically sorted, float precision normalized, and whitespace eliminated before hashing.
2. **SHA-256 Digest Computation:** A unique 64-character cryptographic hash is calculated over the canonical payload and embedded into the export bundle.
3. **Automated Verification Endpoint:** Calling `POST /api/export/verify` with the payload checks whether the recalculation matches `expected_hash`:
   * Unaltered payload $\rightarrow$ `valid: true`
   * Single character or timestamp alteration $\rightarrow$ `valid: false` (Mismatch flagged)

---

## Evaluation Methodology & Benchmarks

Running `python scripts/evaluate.py` benchmarks the detection engine against planted ground-truth scenarios with strict isolation:

```text
================ EVALUATION METRICS ================
True Positives (TP): 7 | False Positives (FP): 3 | True Negatives (TN): 29 | False Negatives (FN): 0
Precision:      70.00%
Recall:         100.00%
F1 Score:       82.35%
False Positive Rate (FPR): 9.38%
Detection Rate: 100.00%

================ ABLATION STUDY ================
Baseline (Financial Only)     ➔ Precision: 41.7% | Recall: 71.4%  | F1: 52.6% | FPR: 21.9%
InsiderTrace (Fused Context)  ➔ Precision: 70.0% | Recall: 100.0% | F1: 82.3% | FPR: 9.4%
Performance Lift              ➔ F1 Delta: +29.7% | Recall Delta: +28.6% | FPR Reduction: -12.5%

================ HARD NEGATIVES TESTING ================
Tested 32 hard negatives across corporate payroll lookalikes and rent schedules:
True Negatives: 29 | False Positives: 3 | Benign Isolation Rate: 90.62% | FP Rate: 9.38%
```

---

## Docker Deployment

To launch the full containerized environment with PostgreSQL 16:

```bash
docker compose build
docker compose up -d
```

Containers provisioned:
* `insidertrace-db`: PostgreSQL 16 Alpine on port `5432`
* `insidertrace-backend`: Python 3.13 FastAPI backend on port `8000` (auto-runs migrations, seeds demo data, executes detection, and starts server)

---

## Regulatory Notice & Limitations

> [!NOTE]
> **Synthetic Demonstration Notice:**  
> The dataset and scenarios included in this repository are **synthetically generated** for demonstration, research, and hackathon benchmarking. They do not contain real personally identifiable information (PII) or proprietary banking data.  
> 
> Production deployment in a regulated financial institution requires calibrating detector thresholds, peer-group baseline windows, and risk rule configurations against historical core banking logs, institutional AML policy, and local regulatory reporting mandates (e.g. FinCEN, RBI, FATF).

---

## License

InsiderTrace is open-source software licensed under the **Apache License 2.0**.