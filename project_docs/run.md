# SDMS — Comprehensive System Run & Operations Guide

> **Ministry of Home Affairs (MHA) Problem Statement SIH26190**  
> Secure Digital Document Management System (SDMS) — Zero-Trust Electronic Evidence Management System.

---

## Table of Contents
1. [Prerequisites & System Requirements](#1-prerequisites--system-requirements)
2. [Quickstart — Running the Project](#2-quickstart--running-the-project)
3. [Environment Configuration](#3-environment-configuration)
4. [Database Seeding & Test Data](#4-database-seeding--test-data)
5. [User Authentication & MFA Procedures](#5-user-authentication--mfa-procedures)
6. [Role-Based Access Control (RBAC/ABAC) & Clearance Matrix](#6-role-based-access-control-rbacabac--clearance-matrix)
7. [Case Management Procedures](#7-case-management-procedures)
8. [Managing Officials & Users](#8-managing-officials--users)
9. [Evidence Ingestion & Document Verification](#9-evidence-ingestion--document-verification)
10. [Intelligence Q&A (RAG Engine)](#10-intelligence-qa-rag-engine)
11. [Audit Logs, Chain of Custody & BSA §63 Certificates](#11-audit-logs-chain-of-custody--bsa-63-certificates)
12. [Running Automated Tests & Red-Team Suite](#12-running-automated-tests--red-team-suite)
13. [Troubleshooting & Maintenance](#13-troubleshooting--maintenance)

---

## 1. Prerequisites & System Requirements

Ensure the following tools are installed on your Linux / Unix machine:

| Component | Minimum Version | Verified Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Python** | `>= 3.11` | `3.14.6` | Backend FastAPI service & cryptographic modules |
| **Node.js** | `>= 18.0.0` | `24.18.0` | Frontend React application build runtime |
| **npm** | `>= 9.0.0` | `11.16.0` | Frontend package manager |
| **SQLite3** | `3.x` | Built-in | Metadata database and Dev-ledger store |

### Install Dependencies

#### Backend Dependencies
```bash
cd backend
pip install --upgrade pip
pip install fastapi uvicorn cryptography pyjwt pyotp qrcode sqlalchemy aiosqlite structlog reportlab jinja2 pymupdf pydantic-settings python-multipart pytest pytest-asyncio
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

---

## 2. Quickstart — Running the Project

### Option A: Running with Make (Recommended)

From the project root directory (`sih26190/`):

```bash
# Terminal 1: Start FastAPI Backend (Port 8000)
make run-backend

# Terminal 2: Start Vite Frontend (Port 5173)
make run-frontend
```

### Option B: Running Manually

```bash
# Terminal 1: Backend
cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Active Endpoints

| Service | Address | Health Check / Description |
| :--- | :--- | :--- |
| **Web Dashboard** | `http://localhost:5173` | React Single Page Application |
| **FastAPI Backend** | `http://localhost:8000` | REST API Server |
| **Backend Health Check** | `http://localhost:8000/api/v1/health` | Returns `{"status":"ok","service":"SDMS API v1"}` |
| **Frontend Proxy** | `http://localhost:5173/api/v1/...` | Proxied automatically to backend port 8000 |

---

## 3. Environment Configuration

Default configuration settings reside in [`backend/app/config.py`](file:///home/dharshan/Documents/sih26190/backend/app/config.py). You can override them via an `.env` file in the root or `backend/` directory:

```ini
# Database
DATABASE_URL=sqlite+aiosqlite:///sdms_metadata.db

# JWT Configuration
JWT_SECRET_KEY=SDMS_SECRET_KEY_FOR_JWT_DEV_DEMO_2026_MHA
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Ledger Backend: dev (SQLite audit ledger) or fabric (Hyperledger Fabric)
LEDGER_BACKEND=dev

# Vault transit encryption (dev mode enabled by default)
VAULT_DEV_MODE=true

# Storage directories
STORAGE_DIR=storage_data
QUARANTINE_DIR=storage_data/quarantine

# Feature Flags
MFA_REQUIRED=true
DEMO_MODE=true
```

---

## 4. Database Seeding & Test Data

If setting up a fresh environment or resetting after tests:

```bash
# Seed default users, demo cases, and live assignments
python3 scripts/seed.py

# Generate synthetic evidentiary corpus documents
python3 scripts/generate_corpus.py
```

Or run the Makefile target:
```bash
make seed
```

---

## 5. User Authentication & MFA Procedures

SDMS implements a strict **Phase 2 Zero-Trust Authentication** mechanism:

1. **Phase 1 (Credentials):** User provides username and password. Backend issues a temporary partial JWT with `mfa_verified=false` (expires in 10 minutes).
2. **Phase 2 (TOTP Challenge):** User provides a 6-digit Time-Based One-Time Password (TOTP). Backend validates the code and issues a full JWT with `mfa_verified=true` and live case scopes.

### Pre-Seeded Official Accounts

All default accounts share the password: **`SecurePass@2026`**

| Role | Username | Full Name | Organization (MSP) | Default Clearance |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin_sys` | System Administrator | PoliceMSP | Full Access (`SECRET`) |
| **Supervisor** | `supervisor_kapoor` | SP K. Kapoor | PoliceMSP | `SECRET` |
| **Forensic Analyst** | `forensic_ananya` | Dr. Ananya Iyer | ForensicsMSP | `SECRET` |
| **Investigator** | `investigator_sharma` | Inspector R. Sharma | PoliceMSP | `CONFIDENTIAL` |
| **Legal Officer** | `legal_verma` | Public Prosecutor P. Verma | PoliceMSP | `CONFIDENTIAL` |
| **Defense Lawyer** | `lawyer_advani` | Advocate S. Advani | PoliceMSP | `RESTRICTED` |

### MFA Codes for Demonstration

When prompted for the 6-digit TOTP code on the `/mfa` screen:
- Enter **`000000`** *(default pre-filled in UI)* or **`123456`**.
- The backend allows these universal development codes for demo evaluation while fully supporting real Google Authenticator / Microsoft Authenticator TOTP secrets.

---

## 6. Role-Based Access Control (RBAC/ABAC) & Clearance Matrix

Access to documents is evaluated using an **unbypassable two-layer check**:

1. **Layer 1 — Live Case Assignment (Rule C8):** The user must be assigned to the specific case. Case access scopes are queried directly from the database on every transaction and are never baked into static JWT claims.
2. **Layer 2 — Classification Clearance Ceiling:** The document's classification cannot exceed the role's maximum clearance ceiling.

### Security Clearance Hierarchy

$$\text{RESTRICTED (Level 1)} < \text{CONFIDENTIAL (Level 2)} < \text{SECRET (Level 3)}$$

| Role | Max Clearance | RESTRICTED Docs | CONFIDENTIAL Docs | SECRET Docs |
| :--- | :--- | :---: | :---: | :---: |
| `LAWYER` | **RESTRICTED** | ✅ Allowed | 🚫 Blocked | 🚫 Blocked |
| `INVESTIGATOR` | **CONFIDENTIAL** | ✅ Allowed | ✅ Allowed | 🚫 Blocked |
| `LEGAL_OFFICER` | **CONFIDENTIAL** | ✅ Allowed | ✅ Allowed | 🚫 Blocked |
| `FORENSIC_ANALYST` | **SECRET** | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `SUPERVISOR` | **SECRET** | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| `ADMIN` | **SECRET / FULL** | ✅ Allowed | ✅ Allowed | ✅ Allowed |

---

## 7. Case Management Procedures

Only **`ADMIN`** and **`SUPERVISOR`** roles can create cases and manage assignments.

### Procedure 7.1: Create a Case via Web UI

1. Sign in as `admin_sys` or `supervisor_kapoor`.
2. Navigate to the **Admin** page (`http://localhost:5173/admin`).
3. Under the **Case Management** section, click **"+ Create Case"**.
4. Fill in:
   - **Case ID:** Unique alphanumeric identifier (e.g., `CASE-601`).
   - **Title:** Case headline (e.g., `Cyber Forensics Probe — Ransomware Incident`).
   - **Description:** Summary of evidence scope.
   - **Classification Ceiling:** Select `RESTRICTED`, `CONFIDENTIAL`, or `SECRET`.
     - *Notice the live **Role Access Preview** table update in real-time to show which roles will be allowed to view evidence in this case.*
   - **Owning MSP:** Managing police/forensic department (e.g., `PoliceMSP`).
5. Click **"Create Case"**. The case will be committed immediately.

### Procedure 7.2: Assign Users to a Case via Web UI

1. On the **Admin** page, find the case in the Cases table.
2. Click the **"Manage"** button next to the case to open the inline assignment drawer.
3. Select an official from the dropdown.
   - *If the user's role has a clearance lower than the case ceiling, an amber warning badge (`⚠ below ceiling`) will alert you.*
4. Click **"Assign"**. Access takes effect immediately on their next request.

### Procedure 7.3: Revoke Access

1. In the case's assignment drawer, view the list of currently assigned officials.
2. Click the red **User Minus icon (🔴)** next to any user.
3. Access is revoked in real-time. Subsequent attempts to view or query that case will return `403 Forbidden`.

---

## 8. Managing Officials & Users

### Procedure 8.1: Register a New Official via Web UI

1. On the **Admin** page, scroll to **"Registered Official Users"**.
2. Click **"+ Add New Official"**.
3. Provide user details:
   - **User ID:** (e.g., `USR-201`)
   - **Username:** Login handle (e.g., `officer_patel`)
   - **Full Name:** Official title (e.g., `Inspector A. Patel`)
   - **Role:** Select `INVESTIGATOR`, `FORENSIC_ANALYST`, `LEGAL_OFFICER`, `SUPERVISOR`, `LAWYER`, or `ADMIN`.
   - **MSP ID:** `PoliceMSP` or `ForensicsMSP`
   - **Temporary Password:** Minimum 8 characters (e.g., `PoliceSecure@2026`).
4. Click **"Register Official"**.
5. The user can now log in immediately and use MFA demo code `000000`.

### Procedure 8.2: Deactivating / Reactivating Users

- Click the **Power icon (⏻)** in the Action column of any user in the table to instantly freeze or unfreeze their account.

---

## 9. Evidence Ingestion & Document Verification

### Step-by-Step Upload Flow

1. Log in as an authorized user (`investigator_sharma` or `forensic_ananya`).
2. Navigate to **"Ingest Evidence"** (`http://localhost:5173/upload`).
3. Select an assigned **Target Case**.
4. Choose **Document Type** (e.g., `FIR`, `FORENSIC_REPORT`, `SEIZURE_MEMO`, `WITNESS_STATEMENT`).
5. Choose **Classification** (`RESTRICTED`, `CONFIDENTIAL`, or `SECRET`).
6. Upload a file (PDF or TXT, up to 50MB).
7. Click **"Commit Evidence to Ledger"**.

### What Happens Behind the Scenes (14-Step Pipeline)
- **Malware & MIME Verification:** Binary inspection and antivirus checks.
- **Envelope Encryption:** AES-256-GCM symmetric encryption with unique per-document DEK wrapped via Vault.
- **Domain-Separated Merkle Tree:** Leaves hashed using `SHA-256(0x00 || doc_id || uint32(i) || chunk)`.
- **Dual-Channel Ledger Registration:** Document hash and Merkle root recorded immutably on `dochash-channel`.

---

## 10. Intelligence Q&A (RAG Engine)

1. Navigate to **"Intelligence Q&A"** (`http://localhost:5173/ask`).
2. Scope your question to **All Authorized Cases** or a specific assigned case.
3. Submit your query (e.g., `"What weapon was seized from the accused in Case 102?"`).
4. The system:
   - Executes **ABAC retrieval pre-filtering** in Qdrant (chunks from unauthorized cases or classifications above user clearance are mathematically excluded before search).
   - Validates **Merkle proofs** for each retrieved chunk against on-chain ledger hashes.
   - Enforces strict **XML prompt-injection guards**.
   - Generates answers strictly grounded in verified evidence, displaying clickable citation chips.

---

## 11. Audit Logs, Chain of Custody & BSA §63 Certificates

### Chain of Custody Timeline
- From the **Case Workspace** (`http://localhost:5173`), click **"Ledger"** on any case card.
- View the cryptographically chained timeline of all access, upload, query, and verification events recorded on `access-channel`.

### Generating BSA §63 / IEA §65B Certificate
- From any document detail page (`/documents/:docId`), authorized users (Supervisor, Forensic Analyst, Legal Officer) can generate a court-admissible certificate:
  - Generates tamper-verifiable SHA-256 hashes, device custody logs, Merkle root verification receipts, and electronic signatures.
  - Can be exported as PDF for court submission.

---

## 12. Running Automated Tests & Red-Team Suite

### Full Pytest Integration Suite
```bash
make test
# OR
cd backend && python3 -m pytest tests/ -v
```
Verifies 17 integration and cryptographic unit tests:
- Envelope encryption roundtrip and AAD tamper detection
- Deterministic chunking & Merkle tree proofs
- End-to-end ingestion pipeline & ledger registration
- Vector pre-filtering & cross-case leak prevention

### Red-Team Adversarial Test Suite
```bash
make redteam
# OR
python3 scripts/redteam.py
```
Simulates real adversarial attacks to prove zero-trust guarantees:
1. **Blob Tampering:** Modifies ciphertext bytes in object storage; verifies decryption fails.
2. **Chunk Tampering:** Alters evidence text in vector database; verifies Merkle gate catches mismatch before LLM.
3. **Cross-Case Leak:** Attempts to query evidence across case boundaries; verifies 0 unauthorized chunks leaked.
4. **Malware Injection:** Attempts uploading executable payloads; verifies quarantine rejection.
5. **Prompt Injection:** Neutralizes adversarial escape attempts.
6. **Live Revocation:** Tests instant access termination without token lag.

---

## 13. Troubleshooting & Maintenance

### Common Issues & Resolutions

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **HTTP 500 on login / requests** | Expired JWT token in browser `localStorage`. | Refresh the page. The frontend automatically clears expired tokens and redirects to `/login`. |
| **Port 8000 or 5173 in use** | Stale processes running from prior sessions. | Run `fuser -k 8000/tcp 5173/tcp` and restart services with `make run-backend` and `make run-frontend`. |
| **"Not assigned to this case"** | User credentials do not have an active assignment record. | Log in as `admin_sys` or `supervisor_kapoor`, go to `/admin`, and assign the user to the case. |
| **"Classification ceiling exceeded"** | The user's role clearance is lower than the document's classification. | Refer to the [Clearance Matrix](#6-role-based-access-control-rbacabac--clearance-matrix). Assign a higher-clearance user (Forensic Analyst/Supervisor) or lower the document classification. |
| **Database Reset** | Corrupted development state. | Run `make clean` followed by `make seed` to restore clean demonstration data. |

---

*SDMS © 2026 Ministry of Home Affairs • Indian Evidence Act §65B / Bharatiya Sakshya Adhiniyam §63 Compliant*
