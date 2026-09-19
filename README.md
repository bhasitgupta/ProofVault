<div align="center">

# ⚖️ NYAYA-VAULT (SIH26190)
### Sovereign Electronic Evidence Provenance & Cryptographic Chain-of-Custody Platform
#### *Engineered for Indian Law Enforcement, Forensic Laboratories, and Judicial Workflows*

<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Polygon%20Amoy%20(80002)-8247E5?style=for-the-badge&logo=polygon&logoColor=white" alt="Polygon Amoy" />
  <img src="https://img.shields.io/badge/Legal%20Compliance-BSA%20%C2%A763%20%7C%20IEA%20%C2%A765B-059669?style=for-the-badge&logo=shield&logoColor=white" alt="BSA 63 Compliance" />
  <img src="https://img.shields.io/badge/Cryptography-AES--256--GCM%20%2B%20Merkle-1E293B?style=for-the-badge&logo=vault&logoColor=white" alt="Cryptography" />
  <img src="https://img.shields.io/badge/Test%20Suite-37%2F37%20Passed%20(100%25)-10B981?style=for-the-badge&logo=pytest&logoColor=white" alt="Pytest" />
  <img src="https://img.shields.io/badge/Deployment-Vercel%20Serverless%20Ready-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

[🏛️ Overview](#-system-overview) •
[🔐 Web3 & Polygon](#-web3-infrastructure--polygon-amoy-evm) •
[⛓️ Ingestion Pipeline](#-14-step-atomic-evidence-ingestion-pipeline) •
[📜 Court Certification](#-statutory-court-certification-bsa-63--iea-65b) •
[🤖 Judicial AI (RAG)](#-verifiable-judicial-ai-rag-engine) •
[🚀 Quickstart](#-quickstart--local-development) •
[🧪 Verification](#-test-verification-suite)

---

</div>

## 📌 System Overview

During criminal investigations, sensitive digital artifacts—First Information Reports (FIRs), mobile forensic phone extractions, CCTV records, seized cryptocurrency ledgers, chemical assays, and ballistic comparisons—must withstand stringent judicial scrutiny. Traditional repositories suffer from insider tampering, unverified custody transitions, lack of mathematical non-repudiation, and manual §65B certification overhead.

**NYAYA-VAULT** is a zero-trust electronic evidence provenance architecture built to eliminate evidence tampering and automate judicial admissibility under the **Bharatiya Sakshya Adhiniyam, 2023 (BSA §63)** and the **Indian Evidence Act (IEA §65B)**.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              NYAYA-VAULT ARCHITECTURE                        │
├──────────────────────────────────────────────────────────────────────────────┤
│  Frontend: React 18 + Vite + Three.js 3D Scales of Justice + Tailwind CSS    │
│  Auth: Web3 Hardware & Software Wallets (MetaMask, Phantom, Coinbase Wallet) │
├──────────────────────────────────────────────────────────────────────────────┤
│                                      │                                       │
│                       REST API / WebSocket (FastAPI ASGI)                     │
│                                      ▼                                       │
│  ┌─────────────────────────┐  ┌───────────────────────┐  ┌────────────────┐  │
│  │   Zero-Trust Ingestion  │  │  Verifiable Grounded  │  │ Court Cert Gen │  │
│  │     (14-Step Pipeline)  │  │      RAG Engine       │  │ (BSA 63/IEA 65B│  │
│  └────────────┬────────────┘  └───────────┬───────────┘  └────────┬───────┘  │
│               │                           │                       │          │
│               ▼                           ▼                       ▼          │
│  ┌─────────────────────────┐  ┌───────────────────────┐  ┌────────────────┐  │
│  │  AES-256-GCM Envelope   │  │   Domain-Separated    │  │  Polygon Amoy  │  │
│  │    Cipher + AAD doc_id  │  │   Merkle Tree Verify  │  │  EVM Contracts │  │
│  └─────────────────────────┘  └───────────────────────┘  └────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Pillars & Architectural Guarantees

| ID | Guarantee | Technical Implementation |
| :--- | :--- | :--- |
| **G1** | **EVM Blockchain Anchoring** | Evidence roots and provenance logs anchored onto **Polygon Amoy EVM (Chain ID 80002)** using smart contracts `EvidenceRegistry` and `ProvenanceRegistry`. |
| **G2** | **Envelope Encryption** | Unique per-document Data Encryption Key (DEK) via AES-256-GCM with `doc_id` bound as Additional Authenticated Data (AAD), preventing ciphertext relocation attacks. |
| **G3** | **Domain-Separated Merkle Trees** | Chunks hashed as `SHA-256(0x00 \|\| doc_id \|\| uint32be(i) \|\| chunk_text)` to mathematically prevent second-preimage and length-extension attacks. |
| **G4** | **BSA §63 / IEA §65B Certification** | Instant court-admissible dual-mode statutory certification generating signed Part A & Part B PDF certificates with SHA-256 sealing, hash proofs, and custody signatures. |
| **G5** | **Zero-Trust Role-Based Scope** | Institutional clearances (`RESTRICTED` ⊂ `CONFIDENTIAL` ⊂ `SECRET`). Live case scoping evaluated on each request without token lag. |
| **G6** | **Web3 Institutional Sign-On** | Native wallet connection supporting **MetaMask**, **Phantom**, and **Coinbase Wallet** with automated cryptographic session establishment. |
| **G7** | **Tamper-Guarded Judicial AI** | Grounded RAG with strict XML injection shields, vector pre-filtering, and Merkle verification of each chunk before LLM inference. |

---

## 🌐 Web3 Infrastructure & Polygon Amoy EVM

NYAYA-VAULT anchors digital evidence to the **Polygon Amoy Testnet** (EVM Chain ID `80002`), ensuring non-repudiable state commitments accessible by courts, defense counsels, and state forensic examiners.

### Verified Smart Contracts

| Contract Name | Network | Contract Address |
| :--- | :--- | :--- |
| **EvidenceRegistry** | Polygon Amoy (80002) | `0xE5A9000fe858f49f4e0520b44dBCC138ba2ef05b` |
| **ProvenanceRegistry** | Polygon Amoy (80002) | `0x3eD98E9e810e232342429A69f4789b9C829c0Bd7` |

### Web3 Wallet Integration
- **Direct Wallet Auth**: Connect with MetaMask, Phantom, or Coinbase Wallet with automatic institutional profile binding.
- **On-Chain Merkle Proofs**: Verify document inclusion and chunk integrity directly against smart contract events.
- **Fail-Safe RPC Design**: Built-in deterministic simulation fallback ensures zero downtime during public testnet latency.

---

## ⚡ 14-Step Atomic Evidence Ingestion Pipeline

Every evidence file uploaded to NYAYA-VAULT passes through an unskippable 14-step cryptographic pipeline:

```
[1. Upload Guard Validation] ➔ [2. Malware & Magic-Byte Scan] ➔ [3. SHA-256 Plaintext Hash]
                                                                          │
[6. Chunking & Merkle Construction]  [5. RFC 3161 TSA Token]  [4. Officer Digital Signature]
      │
      ▼
[7. AES-256-GCM Envelope Encryption] ➔ [8. Ciphertext Blob Hash] ➔ [9. Object Store Persistence]
                                                                              │
[12. Vector Indexing / Embedded RAG]  [11. Polygon EVM Commit Gate]  [10. DB Metadata Row]
      │
      ▼
[13. UPLOAD_OK Provenance Audit Event] ➔ [14. Sealed Evidence Dossier Active]
```

---

## 📜 Statutory Court Certification (BSA §63 / IEA §65B)

Under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023, electronic records are admissible only when accompanied by a statutory certificate proving integrity and continuous lawful custody.

NYAYA-VAULT automatically produces courtroom-ready, cryptographically sealed certificates:
- **Part A (Custodian Statement)**: Operating environment status, officer credentials, and integrity affirmations.
- **Part B (Technical Affidavit)**: Cryptographic SHA-256 content hashes, EVM block receipts, Merkle root proofs, and envelope parameters.
- **Tamper Verification Seal**: Instant QR verification linking directly to smart contract transaction receipts.

---

## 🤖 Verifiable Judicial AI (RAG Engine)

Judicial analysis requires high factual fidelity and strict confidentiality:
1. **ABAC Pre-Filtering**: Evaluates clearance level *before* vector lookup—preventing cross-case data leakage.
2. **Merkle Integrity Gate**: Every retrieved chunk is verified against the document's Merkle tree before the LLM sees it. If altered, an immediate `TAMPER_ALERT` incident is recorded.
3. **XML Prompt-Injection Guard**: Sandboxes user prompts and evidence texts to prevent model hijacking.
4. **Verified Citations**: All generated answers contain clickable citations with chunk indices, page numbers, and on-chain verification stamps.

---

## 👥 Institutional Roles & Pre-Seeded Profiles

| Role | Username | Full Name | Clearance Level | Default Assigned Jurisdiction |
| :--- | :--- | :--- | :--- | :--- |
| **Investigator** | `investigator_gupta` | Inspector Bhasit Gupta | `CONFIDENTIAL` | Hawala, Cyber, Ransomware, Narcotics |
| **Forensic Analyst** | `forensic_ananya` | Dr. Ananya Iyer | `SECRET` | Ballistics, Malware Dump, Digital Media |
| **Legal Officer** | `legal_verma` | Prosecutor P. Verma | `CONFIDENTIAL` | Anti-Corruption, Charge Sheets, FIRs |
| **Supervisor** | `supervisor_kapoor` | SP K. Kapoor | `SECRET` | Universal Oversight & Incident Resolution |
| **Defense Lawyer** | `lawyer_advani` | Adv. S. Advani | `RESTRICTED` | Disclosed Case Dockets & Evidence |
| **Administrator** | `admin_sys` | System Admin | `SECRET` | Full System Administration |

*Demo Password across all standard seeded users:* `SecurePass@2026`  
*Default TOTP Secret:* `JBSWY3DPEHPK3PXP`

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ (or `uv`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/bhasitgupta/SIH26190.git
cd SIH-26190

# Install Frontend dependencies
cd frontend && npm install && cd ..

# Setup Python Virtualenv & install dependencies
cd backend
python -m venv .venv
.\.venv\Scripts\activate      # Windows (or source .venv/bin/activate on Linux/macOS)
pip install -r requirements.txt
cd ..
```

### 2. Run the Development Servers
```bash
# Terminal 1: Run Backend Server
cd backend
python main.py
# Backend live at: http://localhost:8000 (Swagger docs: http://localhost:8000/docs)

# Terminal 2: Run Frontend Application
cd frontend
npm run dev
# Frontend live at: http://localhost:5173
```

---

## 🧪 Test Verification Suite

NYAYA-VAULT features a comprehensive automated test suite covering unit encryption, domain-separated Merkle trees, access control, legal compliance, red-team adversarial attacks, and Polygon EVM adapters.

```bash
cd backend
python -m pytest tests/ -v
```

### Test Suite Summary:
```text
============================= test session starts =============================
collected 37 items

tests/integration/test_ingest_flow.py::test_full_ingestion_integration        PASSED [ 2%]
tests/integration/test_ledger_roundtrip.py::test_ledger_roundtrip            PASSED [ 5%]
tests/integration/test_query_flow.py::test_rag_query_flow_integration        PASSED [ 8%]
tests/policy/test_access_matrix.py::test_policy_access_matrix                 PASSED [10%]
tests/redteam/test_blob_tamper.py::test_redteam_blob_tamper_detected          PASSED [13%]
tests/redteam/test_chunk_tamper.py::test_redteam_chunk_tamper_detected        PASSED [16%]
tests/redteam/test_cross_case_leak.py::test_redteam_cross_case_leak_prevention PASSED [18%]
tests/redteam/test_malware_upload.py::test_redteam_malware_upload_rejected    PASSED [21%]
tests/redteam/test_prompt_injection.py::test_redteam_prompt_injection         PASSED [24%]
tests/redteam/test_revocation.py::test_redteam_immediate_revocation_enforced  PASSED [27%]
tests/test_bsa_section_63.py::TestBSAEngine::test_cert_generation             PASSED [35%]
tests/test_custody_chain.py::TestCustodyChain::test_unbroken_chain           PASSED [45%]
tests/test_envelope_cipher.py::TestEnvelopeCipher::test_encrypt_decrypt       PASSED [54%]
tests/test_polygon_adapter.py::TestPolygonAdapter::test_adapter_init          PASSED [75%]
tests/unit/test_merkle.py::test_merkle_tree_construction_and_verification     PASSED [100%]

============================= 37 passed in 1.88s ==============================
```

---

## ☁️ Vercel Serverless Deployment

NYAYA-VAULT is pre-configured for seamless monorepo deployment on **Vercel**:
- **Automatic path handling**: Detects cloud serverless runtimes and routes temporary SQLite and encrypted blobs to `/tmp`.
- **Auto-seeding**: Database and case dockets auto-seed on cold boot with zero external provisioning required.
- **Frontend SPA routing**: Client-side routing seamlessly rewrites `/api/*` requests to the Python FastAPI backend.

---

<div align="center">
  <sub>Engineered by Bhasit Gupta • Smart India Hackathon (SIH26190) • Built for Digital Sovereignty & Rule of Law</sub>
</div>
