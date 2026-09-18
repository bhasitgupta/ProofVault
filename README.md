# SDMS — Secure Digital Document Management System

[![Zero-Trust Architecture](https://img.shields.io/badge/Architecture-Zero--Trust-blue.svg)](#)
[![Compliance](https://img.shields.io/badge/Compliance-BSA_%C2%A763_%7C_IEA_%C2%A765B-green.svg)](#)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-brightgreen.svg)](#)
[![Red Team](https://img.shields.io/badge/Red%20Team-6%2F6%20Verified-success.svg)](#)
[![License](https://img.shields.io/badge/License-Proprietary-orange.svg)](#)

> **Ministry of Home Affairs (MHA) Problem Statement SIH26190**  
> An immutable, cryptographically verifiable, zero-trust electronic evidence management system engineered for Indian law enforcement, forensic laboratories, and judiciary workflows. Features dual-channel Hyperledger Fabric ledgers, domain-separated Merkle trees, AES-256-GCM envelope encryption, verifiable grounded RAG with prompt injection neutralization, and automated Bharatiya Sakshya Adhiniyam (BSA) §63 / Indian Evidence Act (IEA) §65B court certificate generation.

---

## Table of Contents

- [System Overview](#system-overview)
- [Key Architectural Guarantees](#key-architectural-guarantees)
- [System Architecture](#system-architecture)
- [14-Step Atomic Ingestion Pipeline](#14-step-atomic-ingestion-pipeline)
- [4-Tier Cryptographic Integrity Verification](#4-tier-cryptographic-integrity-verification)
- [Access Control & Clearance Matrix (RBAC / ABAC)](#access-control--clearance-matrix-rbac--abac)
- [Pre-Seeded Demo Accounts & Credentials](#pre-seeded-demo-accounts--credentials)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quickstart & Installation](#quickstart--installation)
  - [Prerequisites](#prerequisites)
  - [1. Environment Setup](#1-environment-setup)
  - [2. Database Seeding & Mock Corpus](#2-database-seeding--mock-corpus)
  - [3. Running the Services](#3-running-the-services)
- [Testing & Red-Team Adversarial Suite](#testing--red-team-adversarial-suite)
- [Legal Compliance & Court Admissibility (BSA §63 / IEA §65B)](#legal-compliance--court-admissibility-bsa-63--iea-65b)
- [REST API Reference](#rest-api-reference)
- [Troubleshooting & Maintenance](#troubleshooting--maintenance)

---

## System Overview

Law enforcement agencies, courts, and investigative departments handle sensitive documents throughout a case lifecycle—including First Information Reports (FIRs), forensic reports, witness statements, bank transaction summaries, seizure memos, and charge sheets. 

Traditional digital repositories suffer from vulnerability to unauthorized insider access, lack of cryptographically provable chain-of-custody, potential evidence tampering or bit rot, and time-consuming manual document reviews.

**SDMS solves this by providing:**
1. **Cryptographic Immutability:** Write-once document registration, Merkle tree chunk roots, and tamper-evident audit trails.
2. **Zero-Trust Access Control:** Two-phase MFA (TOTP), live case-assignment verification on every request (never cached in JWT claims), and security clearance hierarchy enforcement.
3. **Verifiable Intelligence (RAG Engine):** Retrieval-Augmented Generation that mathematically pre-filters unauthorized chunks before vector search, validates Merkle proofs before presenting chunks to the LLM, and provides clickable evidence citations.
4. **Admissible Court Certification:** Generates tamper-verifiable, signed certificates complying with **BSA §63 (Part A & Part B)** and **IEA §65B** with SHA-256 hashes, custody logs, device profiles, and PDF export.

---

## Key Architectural Guarantees

| ID | Guarantee | Architectural Implementation |
| :--- | :--- | :--- |
| **C1** | **Envelope Encryption** | AES-256-GCM symmetric encryption with unique per-document Data Encryption Keys (DEKs) wrapped by Vault transit service. Bound by `doc_id` as Additional Authenticated Data (AAD) to prevent ciphertext transplant attacks. |
| **C2** | **Domain-Separated Merkle Trees** | Chunks hashed as `SHA-256(0x00 \|\| doc_id \|\| uint32be(i) \|\| chunk_text)` to mathematically prevent second-preimage and length-extension attacks. |
| **C3** | **Dual-Channel Permissioned Ledger** | Hyperledger Fabric network separating document state (`dochash-channel`) from continuous access/audit history (`access-channel`), backed by Node.js Gateway and SQLite DevLedger fallback. |
| **C4** | **Ledger-Gated Ingestion** | Evidence chunks are never indexed into the vector store until on-chain registration commits and returns a verified transaction ID. |
| **C5** | **Retrieval Pre-Filtering** | ABAC clearance ceilings and live case-scoping filters are enforced *prior* to vector similarity search (Qdrant payload filtering), preventing cross-case information leakage. |
| **C6** | **4-Tier Integrity Verification** | Verifies chunk hashes, Merkle inclusion proofs, ciphertext blob hashes, and plaintext content hashes before evidence is presented to users or LLMs. |
| **C7** | **Live Scope Enforcement** | JWT tokens contain only identity and role claims; active case assignments are queried live from the database on every transaction to ensure instantaneous revocation without token lag. |
| **C8** | **Two-Phase Zero-Trust MFA** | Two-step authentication: Phase 1 (PBKDF2 password challenge) yields an unverified short-lived token; Phase 2 (TOTP verification) issues full session credentials. |
| **C9** | **Strict XML Prompt-Injection Guard** | Evidence passed to the RAG LLM is isolated inside strict XML tags with automated regex neutralization of prompt-injection attempts. |
| **C10** | **Court-Admissible BSA §63 Certification** | Produces signed Part A and Part B electronic evidence certificates containing Merkle root verification receipts, equipment profiles, and custody logs. |

---

## System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 SDMS Client UI                                    |
|                       React 18 + Vite + Tailwind CSS                              |
|           (Case Workspace, Intelligence Q&A, Custody Timeline, Admin)             |
+-----------------------------------------+-----------------------------------------+
                                          | REST + Bearer JWT
+-----------------------------------------v-----------------------------------------+
|                               FastAPI Backend API                                 |
|                                                                                   |
|  +------------------+   +-------------------+   +-------------------------------+  |
|  | Auth & MFA Engine|   | Ingestion Engine  |   | Verifiable RAG Engine         |  |
|  | (TOTP / PBKDF2)  |   | (14-Step Atomic)  |   | (Merkle Gate + Pre-Filter)    |  |
|  +------------------+   +-------------------+   +-------------------------------+  |
|  +------------------+   +-------------------+   +-------------------------------+  |
|  | ABAC / Policy    |   | Integrity Verifier|   | Legal Certificate Generator   |  |
|  | (Clearance Gate) |   | (4-Tier Hierarchy)|   | (BSA §63 Part A & Part B PDF) |  |
|  +------------------+   +-------------------+   +-------------------------------+  |
+---------+-------------------------+-------------------------------+---------------+
          |                         |                               |
+---------v----------+    +---------v----------+         +----------v---------------+
|  Encrypted Storage |    |  Metadata & Scope  |         |  Dual-Channel Ledger     |
|  AES-256-GCM + AAD |    |  SQLite / Postgres |         |  dochash-channel (state) |
|  & Quarantine Zone |    |  (Cases, Users)    |         |  access-channel (audit)  |
+--------------------+    +--------------------+         +--------------------------+
          |                         |                               |
+---------v----------+    +---------v----------+         +----------v---------------+
| HashiCorp Vault    |    | Hybrid Vector Store|         | Hyperledger Fabric 2.5   |
| Transit Encryption |    | Qdrant + BM25      |         | Peer0.Police / Forensics |
+--------------------+    +--------------------+         +--------------------------+
```

---

## 14-Step Atomic Ingestion Pipeline

When evidence is uploaded, it passes through an atomic, fail-closed 14-step pipeline:

```
[Upload] ➔ [1. MIME & Extension Validation]
         ➔ [2. Malware & Signature Scan (Quarantine on detection)]
         ➔ [3. Text Extraction & OCR Normalization]
         ➔ [4. Raw Content SHA-256 Hashing]
         ➔ [5. Deterministic Sliding-Window Chunking with Page Provenance]
         ➔ [6. Domain-Separated Chunk Leaf Hashing]
         ➔ [7. Merkle Tree Construction & Root Calculation]
         ➔ [8. Generate Per-Document AES-256 DEK]
         ➔ [9. AES-256-GCM Encryption with doc_id as AAD]
         ➔ [10. Ciphertext Blob SHA-256 Hashing]
         ➔ [11. Secure Storage Write]
         ➔ [12. On-Chain Ledger Registration (dochash-channel)]
         ➔ [13. Vector Indexing in Qdrant (Ledger-Gated)]
         ➔ [14. Immutable Audit Event Append (access-channel)]
```

If any step fails, changes roll back, the file is quarantined if infected, and a tamper or audit alert is logged to the ledger.

---

## 4-Tier Cryptographic Integrity Verification

Integrity verification occurs before any document chunk is supplied to the LLM or displayed to an investigator:

```
                      [Retrieved Chunk / Document]
                                   │
                     ▼ Tier 1: Local Chunk Re-Hash
                       SHA-256(0x00 || doc_id || i || text) == chunk_hash ?
                                   │ [Pass]
                     ▼ Tier 2: Merkle Inclusion Proof
                       Proof path validates against on-chain Merkle root?
                                   │ [Pass]
                     ▼ Tier 3: Blob Hash Validation
                       SHA-256(ciphertext) == on-chain blob_hash?
                                   │ [Pass]
                     ▼ Tier 4: Plaintext Content Hash (on Citation)
                       Decrypt with Vault DEK ➔ SHA-256(plaintext) == content_hash?
                                   │
                         ┌─────────┴─────────┐
                         ▼                   ▼
                      [PASS]              [FAIL]
             Verified Evidence Output   TAMPER ALERT Raised + Output Blocked
```

---

## Access Control & Clearance Matrix (RBAC / ABAC)

Access to evidence is governed by a **two-layer policy evaluation engine**:
1. **Layer 1 (Live Case Assignment):** The user must be explicitly assigned to the target case.
2. **Layer 2 (Classification Ceiling):** The document's classification cannot exceed the user's role clearance ceiling.

### Security Clearance Hierarchy

$$\text{RESTRICTED (Level 1)} < \text{CONFIDENTIAL (Level 2)} < \text{SECRET (Level 3)}$$

| Role | Clearance Ceiling | RESTRICTED Docs | CONFIDENTIAL Docs | SECRET Docs |
| :--- | :---: | :---: | :---: | :---: |
| **LAWYER** | `RESTRICTED` | ✅ Allowed | 🚫 Blocked | 🚫 Blocked |
| **INVESTIGATOR** | `CONFIDENTIAL` | ✅ Allowed | ✅ Allowed | 🚫 Blocked |
| **LEGAL_OFFICER** | `CONFIDENTIAL` | ✅ Allowed | ✅ Allowed | 🚫 Blocked |
| **FORENSIC_ANALYST** | `SECRET` | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **SUPERVISOR** | `SECRET` | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **ADMIN** | `SECRET / FULL` | ✅ Allowed | ✅ Allowed | ✅ Allowed |

---

## Pre-Seeded Demo Accounts & Credentials

All default accounts use password: **`SecurePass@2026`**  
Demo TOTP / MFA Code: **`000000`** *(pre-filled)* or **`123456`**

| Role | Username | Full Name | MSP ID | Clearance | Case Access Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin_sys` | System Administrator | `PoliceMSP` | `SECRET` | All Cases (Global Admin) |
| **Supervisor** | `supervisor_kapoor` | SP K. Kapoor | `PoliceMSP` | `SECRET` | `CASE-102`, `CASE-205`, `CASE-311`, `CASE-418` |
| **Forensic Analyst** | `forensic_ananya` | Dr. Ananya Iyer | `ForensicsMSP` | `SECRET` | `CASE-102`, `CASE-205`, `CASE-527` |
| **Investigator** | `investigator_gupta` | Inspector Bhasit Gupta | `PoliceMSP` | `CONFIDENTIAL` | `CASE-102`, `CASE-205`, `CASE-001` to `CASE-005` |
| **Legal Officer** | `legal_verma` | Public Prosecutor P. Verma | `PoliceMSP` | `CONFIDENTIAL` | `CASE-102`, `CASE-311` |
| **Defense Lawyer** | `lawyer_advani` | Advocate S. Advani | `PoliceMSP` | `RESTRICTED` | `CASE-102` |

---

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy (Async SQLite/aiosqlite / PostgreSQL), Cryptography (AES-256-GCM, SHA-256), PyJWT, PyOTP, Structlog, ReportLab, Jinja2, PyMuPDF.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v6.
- **Blockchain / DLT:** Hyperledger Fabric 2.5 (Docker, dual-channel `dochash` and `access`), TypeScript Smart Contracts (`fabric-contract-api`), Node.js Ledger Gateway (`@hyperledger/fabric-gateway`), with an in-process SQLite `DevLedger` fallback for standalone zero-dependency evaluation.
- **Vector & Semantic Search:** Qdrant (in-memory / containerized vector store), TF-IDF / BM25 sparse indexer.
- **Policy Engine:** Open Policy Agent (OPA) Rego policies with native Python ABAC evaluation engine.

---

## Repository Structure

```
sih26190/
├── backend/                    # FastAPI backend service
│   ├── alembic/                # Database migrations
│   ├── app/
│   │   ├── api/v1/             # REST endpoints (auth, cases, documents, query, verify, certs, audit, admin)
│   │   ├── audit/              # Timeline recorders & tamper alerts
│   │   ├── core/               # Security, JWT, MFA, logging, exceptions
│   │   ├── crypto/             # AES-256-GCM envelope, SHA-256, Merkle tree, Vault client, TSA
│   │   ├── db/                 # SQLAlchemy async models & repositories
│   │   ├── index/              # Qdrant store, dense embeddings, sparse BM25
│   │   ├── ingest/             # 14-step ingestion pipeline, chunker, OCR, deduplication
│   │   ├── integrity/          # 4-tier verifier, Merkle receipts, background sweeper
│   │   ├── ledger/             # Dual-channel adapter, DevLedger & FabricClient
│   │   ├── legal/              # BSA §63 Part A & Part B PDF generator & HTML templates
│   │   ├── policy/             # ABAC policy evaluator & OPA client
│   │   ├── rag/                # Grounded RAG orchestrator, injection guard, citations
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   └── storage/            # Object store, malware scanner, quarantine
│   ├── certificates/           # Generated PDF certificates
│   ├── tests/                  # Pytest unit, integration, policy, and red-team suites
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/                   # React 18 + Vite dashboard
│   ├── src/
│   │   ├── api/                # API client adapters
│   │   ├── components/         # UI components (AnswerCard, Citations, Timeline, TamperAlert)
│   │   ├── hooks/              # Auth, query stream, and verification hooks
│   │   ├── pages/              # Workspace, Documents, Upload, Ask, Detail, AuditLog, Admin
│   │   └── lib/                # Types and utilities
│   ├── Dockerfile
│   └── package.json
├── chaincode/                  # Hyperledger Fabric smart contracts (TypeScript)
│   ├── dochash/                # Smart contract for dochash-channel (state & Merkle roots)
│   └── access/                 # Smart contract for access-channel (audit & timeline)
├── ledger-gateway/             # Node.js Express bridge to Hyperledger Fabric channels
├── fabric/                     # Fabric 2.5 network configuration, profiles, and scripts
├── policy/                     # OPA Rego policy definitions & test cases
├── data/
│   ├── corpus/                 # Synthetic evidence corpus (Cases 102, 205, 311, 418, 527)
│   ├── eval/                   # Golden queries and expected access denial benchmarks
│   └── seed/                   # Seed definitions for users, cases, and assignments
├── mock_case_data/             # Real-world mock investigation folders (CASE-001 to CASE-005)
├── scripts/                    # Automation, seed, tamper, verify, and red-team scripts
├── Makefile                    # Make targets for build, test, seed, and run
├── docker-compose.yml          # Container setup for app + gateway
└── docker-compose.fabric.yml   # Multi-organization Hyperledger Fabric network
```

---

## Quickstart & Installation

### Prerequisites

- **Python:** `>= 3.11` (Tested on `3.11` to `3.14`)
- **Node.js:** `>= 18.0.0`
- **npm:** `>= 9.0.0`
- **SQLite3:** Built-in
- **Docker & Docker Compose:** *(Optional, required only for full Hyperledger Fabric deployment)*

---

### 1. Environment Setup

Clone the repository and install all dependencies:

```bash
# Clone the repository
git clone https://github.com/bhasitgupta/SIH26190.git
cd sih26190

# Install backend & frontend dependencies
make install
```

Or install manually:

```bash
# Backend dependencies
cd backend
pip install --upgrade pip
pip install fastapi uvicorn cryptography pyjwt pyotp qrcode sqlalchemy aiosqlite structlog reportlab jinja2 pymupdf pydantic-settings python-multipart pytest pytest-asyncio
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

---

### 2. Database Seeding & Mock Corpus

Initialize the SQLite metadata database, seed default users, cases, role clearances, and generate the synthetic electronic evidence corpus:

```bash
# Seed users, cases, live assignments, and corpus
make seed
```

*(Optional)* To ingest the extended realistic police investigation dataset (`mock_case_data/CASE-001` to `CASE-005`):

```bash
python3 scripts/clean_and_inject_mock.py
```

---

### 3. Running the Services

#### Option A: Running via Makefile (Recommended)

Open two terminals:

```bash
# Terminal 1: FastAPI Backend (Port 8000)
make run-backend

# Terminal 2: React Vite Frontend (Port 5173)
make run-frontend
```

#### Option B: Running with Docker Compose

```bash
docker-compose up --build
```

#### Option C: Running Full Hyperledger Fabric 2.5 Consortium

```bash
docker-compose -f docker-compose.fabric.yml up -d
cd ledger-gateway && npm install && npm start
```

### Access Points

- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Documentation (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## Testing & Red-Team Adversarial Suite

The system includes automated test suites validating cryptographic integrity, policy enforcement, and defense against adversarial vectors.

### 1. Full Pytest Suite (17 Tests)

Runs unit, integration, and policy tests:

```bash
make test
# OR
cd backend && python3 -m pytest tests/ -v
```

**Test Coverage Highlights:**
- `test_envelope_encryption_roundtrip`: Verifies AES-256-GCM encryption & decryption.
- `test_aad_mismatch_raises_invalid_tag`: Proves ciphertext transplant detection via AAD.
- `test_merkle_tree_construction_and_verification`: Validates Merkle inclusion proofs.
- `test_chunk_pages_deterministic`: Validates sliding-window page provenance.
- `test_full_ingestion_integration`: End-to-end 14-step pipeline execution.
- `test_ledger_roundtrip`: Verifies ledger write-once commits on `dochash-channel`.
- `test_rag_query_flow_integration`: Grounded query with integrity verification.
- `test_policy_access_matrix`: Validates ABAC matrix against unauthorized access.

---

### 2. Red-Team Adversarial Suite (6 Attacks)

Simulates active cyber-attacks and insider threats against evidence:

```bash
make redteam
# OR
python3 scripts/redteam.py
```

| Attack Scenario | Simulated Action | Expected Result |
| :--- | :--- | :--- |
| **Blob Tampering** | Bit-flip in ciphertext storage (`.enc` blob) | `decrypt_blob` detects GCM authentication tag mismatch and fails closed. |
| **Chunk Tampering** | Modifies text in vector database record | Tier 2 Merkle inclusion proof fails against on-chain root; raises `TAMPER_ALERT`. |
| **Cross-Case Leak** | Unauthorized user queries unassigned case | ABAC pre-filter strips unauthorized chunks before vector search; 0 chunks leaked. |
| **Malware Upload** | Submits executable binary payload | MIME/binary inspection flags malware; moves file to quarantine; logs alert. |
| **Prompt Injection** | Injects adversarial override commands into query | XML delimitation and regex neutralization neutralize the injection payload. |
| **Live Revocation** | Revokes investigator case assignment mid-session | Subsequent query immediately rejected with `403 Forbidden` without waiting for token expiry. |

---

### 3. Attack Simulation CLI & Bulk Verifier

Simulate manual tampering or verify all stored evidence in the database:

```bash
# Tamper a ciphertext blob in storage
python3 scripts/tamper.py --mode blob --doc-id <DOC_ID>

# Tamper a chunk in database
python3 scripts/tamper.py --mode chunk --doc-id <DOC_ID> --chunk-index 0 --new-text "Tampered content"

# Run 4-tier verification across all documents
python3 scripts/verify_all.py
```

---

## Legal Compliance & Court Admissibility (BSA §63 / IEA §65B)

SDMS is built to satisfy the statutory mandates for the admissibility of electronic records under Indian law:
- **Section 63, Bharatiya Sakshya Adhiniyam (BSA), 2023**
- **Section 65B, Indian Evidence Act (IEA), 1872**

### Certificate Generation

Authorized officials (**Forensic Analyst**, **Supervisor**, **Legal Officer**) can generate and download court-ready PDF certificates:

1. **Part A (Custody & Device Identification):** Details source equipment, MAC/device identifiers, operating conditions, forensic hash history, and custody chain.
2. **Part B (Cryptographic Verification Receipt):** Details on-chain SHA-256 hash, Merkle root verification receipts, transaction timestamp, and digital signature of the certifying examiner.

```
Navigate to Document Details ➔ Click "Generate BSA §63 Certificate" ➔ Preview ➔ Export PDF
```

---

## REST API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication & MFA
| Method | Endpoint | Description | Clearance / Scope |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Phase 1 login; returns temporary JWT | Public |
| `POST` | `/auth/mfa/verify` | Phase 2 TOTP validation; returns session JWT | Temporary JWT |
| `GET` | `/auth/me` | Current authenticated user profile | Authenticated |

### Case Management
| Method | Endpoint | Description | Clearance / Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/cases` | List cases assigned to authenticated user | Live Assignment |
| `POST` | `/cases` | Create a new case with classification ceiling | `ADMIN`, `SUPERVISOR` |
| `GET` | `/cases/{case_id}` | Get case metadata and assigned officials | Assigned Users |
| `POST` | `/cases/{case_id}/assign` | Assign official to a case | `ADMIN`, `SUPERVISOR` |
| `POST` | `/cases/{case_id}/unassign` | Instantly revoke access to a case | `ADMIN`, `SUPERVISOR` |

### Evidence Management
| Method | Endpoint | Description | Clearance / Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/documents` | List accessible documents for assigned cases | ABAC Filtered |
| `POST` | `/documents/upload` | 14-step evidence ingestion to storage & ledger | Assigned Official |
| `GET` | `/documents/{doc_id}` | Retrieve document metadata & verification status | ABAC Evaluated |
| `GET` | `/documents/{doc_id}/download` | Decrypt and stream verified document | ABAC Evaluated |
| `POST` | `/documents/{doc_id}/shred` | Cryptographic key destruction & audit log | `ADMIN`, `SUPERVISOR` |

### Intelligence Q&A & Verification
| Method | Endpoint | Description | Clearance / Scope |
| :--- | :--- | :--- | :--- |
| `POST` | `/query` | Verifiable grounded RAG query with citations | Assigned Case Scope |
| `GET` | `/verify/{doc_id}` | Full 4-tier cryptographic verification check | Assigned Official |
| `POST` | `/verify/{doc_id}/chunk` | Verify individual Merkle inclusion proof | Assigned Official |

### Legal Certificates & Audit
| Method | Endpoint | Description | Clearance / Scope |
| :--- | :--- | :--- | :--- |
| `POST` | `/certificates/generate/{doc_id}` | Generate BSA §63 Part A & B certificate | Forensic / Supervisor / Legal |
| `GET` | `/certificates/download/{doc_id}` | Download court-admissible PDF certificate | Forensic / Supervisor / Legal |
| `GET` | `/audit/timeline/{case_id}` | Immutable chain-of-custody timeline | Assigned Official |
| `GET` | `/audit/incidents` | Real-time security and tamper alerts | `ADMIN`, `SUPERVISOR` |
| `GET` | `/audit/stats` | System-wide audit event metrics | `ADMIN`, `SUPERVISOR` |

### Administration
| Method | Endpoint | Description | Clearance / Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/users` | List registered officials | `ADMIN` |
| `POST` | `/admin/users` | Register a new official | `ADMIN` |
| `PUT` | `/admin/users/{user_id}/status` | Freeze or activate an official account | `ADMIN` |
| `GET` | `/admin/stats` | System statistics (cases, docs, alerts) | `ADMIN` |

---

## Troubleshooting & Maintenance

| Symptom | Probable Cause | Recommended Resolution |
| :--- | :--- | :--- |
| **HTTP 500 / Invalid Token after restart** | Stale JWT token stored in browser localStorage. | Hard refresh the browser (`Ctrl+F5`) or log out. The frontend will purge the invalid token and redirect to `/login`. |
| **Port 8000 or 5173 already bound** | Orphaned uvicorn or vite process from previous session. | Run `fuser -k 8000/tcp 5173/tcp` and re-run `make run-backend` and `make run-frontend`. |
| **"User not assigned to this case"** | Live assignment record missing for target case. | Log in as `admin_sys` or `supervisor_kapoor`, navigate to `/admin`, and assign the user to the case. |
| **"Classification ceiling exceeded"** | Document classification level is higher than the user's role clearance. | Refer to the [Access Control Matrix](#access-control--clearance-matrix-rbac--abac). Log in with a role possessing higher clearance (Forensic Analyst, Supervisor, or Admin). |
| **Corrupted demo environment** | Test modifications or tamper simulations altered the database. | Run `make clean` followed by `make seed` to restore clean demonstration state. |

---

## License & Attribution

Developed for the **Smart India Hackathon 2026** under the **Ministry of Home Affairs (MHA)** Problem Statement **SIH26190**.  
Compliant with the statutory requirements of the **Bharatiya Sakshya Adhiniyam, 2023 (§63)** and the **Indian Evidence Act, 1872 (§65B)**.
