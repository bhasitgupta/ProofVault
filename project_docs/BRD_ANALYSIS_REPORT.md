# NYAYA-VAULT: Comprehensive BRD Specification & Architectural Analysis Report

**Document Reference:** SIH26190 — Secure Legal & Investigation Document Management System  
**Authority Context:** Ministry of Home Affairs (MHA) / NCRB Guidelines  
**Source Specification Folder:** `BRD(3)/`  
**Analyzed Source Artifacts:**
1. `BRD(3)/BRD(3).md` — Business Requirements Document
2. `BRD(3)/PRD(2).md` — Product Requirements Document
3. `BRD(3)/SRS(2).md` — Software Requirements Specification
4. `BRD(3)/TRD(2).md` — Technical Requirements & Reference Architecture
5. `BRD(3)/Test(6).md` — Test Strategy, Acceptance Suite & Verification Plan

---

## 1. Executive Summary & Problem Scope (BRD & PRD Analysis)

### 1.1 Core Business Problem
Legal and investigation documents undergo sequential transfers across law enforcement, forensic laboratories, public prosecution, and the judiciary. Conventional document management systems fail because they treat records as static "file storage" rather than an active **chain of evidentiary decisions**.
The platform must cryptographically resolve:
- **Receipt & Origin:** What document was received, from whom, under what authority.
- **Evidentiary Integrity:** Whether the retrieved object has been modified by even a single bit (BSA §63 / IEA §65B admissibility).
- **Chain of Custody:** Who accessed, transferred, redacted, or analyzed the evidence.
- **Data-Plane Isolation:** The blockchain must strictly remain a trust anchor, **never** a document or PII storage store.

### 1.2 Interoperability Boundary (What NYAYA-VAULT Complements vs Competes With)
As established in `BRD.md §2` and `PRD.md §2`:
- **ICJS:** Integrates Police, Courts, Prisons, Forensics, and Prosecution.
- **CCTNS:** Core police investigation workflows.
- **e-Forensics:** Forensic case registration and reporting.
- **e-Prosecution:** Prosecution docket management.
- **e-Sakshya:** Primary digital evidence capture (crime scene audio/video).
- **C-DAC DEMS:** Digital evidence custody management.
- **NYAYA-VAULT Positioning:** Interoperable, high-assurance digital provenance and trust anchor layer providing cryptographic non-repudiation, envelope encryption, and verifiable on-chain anchoring across all pillars.

---

## 2. Blockchain & Smart Contract Architecture (TRD §12 & SRS §14)

### 2.1 Explicit Blockchain Architecture Mandate
From `TRD.md §10, §12` and `PRD.md §2`:
- **Consensus Platform:** Polygon Amoy (Testnet Chain ID: `80002`) for SIH demonstration; sovereign/permissioned Polygon CDK topology for production.
- **Hyperledger Fabric:** Explicitly revised and removed in favor of EVM-compatible Polygon anchoring.
- **Privacy & Zero-Knowledge Rule (`TRD §12, SRS §14, PRD §3`):**
  - **PROHIBITED ON CHAIN:** Raw PDF/image/video bytes, victim/witness names, phone numbers, addresses, Aadhaar, FIR narratives, access tokens, credentials.
  - **PERMITTED ON CHAIN ONLY:** 32-byte cryptographic hashes (`bytes32`), Merkle roots, sequential event digests, state flags, timestamps.

### 2.2 Authoritative Smart Contracts (Strictly Governed by TRD §12)
`TRD.md §12.1` explicitly specifies **EXACTLY TWO (2)** smart contracts for the platform:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        POLYGON AMOY TRUST LAYER                        │
├──────────────────────────────────┬─────────────────────────────────────┤
│      1. EvidenceRegistry.sol     │       2. ProvenanceRegistry.sol     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ - docIdHash (bytes32)            │ - eventId / eventHash (bytes32)     │
│ - contentHash (bytes32)          │ - docIdHash reference (bytes32)     │
│ - merkleRoot (bytes32)           │ - eventType / action (string)       │
│ - registeredAt (uint256)         │ - timestamp (uint256)               │
│ - batchId (uint256)              │ - prevEventHash (bytes32 chaining)  │
│ - status (Registered/Hold/Shred) │ - actorId & actorRole (institutional│
│ - Merkle chunk proof verify      │ - hash-chain integrity verification │
│ - On-chain multi-admin governance│ - On-chain multi-admin governance   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

#### Contract 1: `EvidenceRegistry.sol` Specification (TRD §12.1 & §13)
- **Primary Responsibility:** Anchors document existence, content digest, Merkle root, and statutory lifecycle status.
- **Data Schema (`TRD §12.1`, `SRS §6.6`):**
  - `docIdHash`: `bytes32` (Domain-separated SHA-256 digest of document ID / version ID).
  - `contentHash`: `bytes32` (SHA-256 digest of decrypted canonical document plaintext).
  - `merkleRoot`: `bytes32` (Root of chunked Merkle tree for fractional evidence verification).
  - `registeredAt`: `uint256` (Block timestamp when anchor was minted).
  - `batchId`: `uint256` (Rollup batch sequence ID).
  - `status`: `enum Status { REGISTERED, ACTIVE, SUPERSEDED, LEGAL_HOLD, SHREDDED }`.
  - `registrar`: `address` (Authenticated officer / service wallet that executed the anchor).
- **Core Functions:**
  - `registerEvidence(docIdHash, contentHash, merkleRoot, batchId, status)`
  - `mintEvidence(...)` (Explicit on-chain minting authority)
  - `verifyContentHash(docIdHash, candidateHash) -> bool`
  - `verifyMerkleRoot(docIdHash, candidateRoot) -> bool`
  - `verifyChunkProof(leaf, proof[], root) -> bool` (TRD §13 Merkle Batch verification)
  - `updateStatus(docIdHash, newStatus)` (Implements Statutory Legal Hold & Court Shred orders directly)
- **On-Chain Governance:**
  - `addAdmin(newAdmin)`, `removeAdmin(admin)`, `setRegistrar(registrar, authorized)` with `adminCount > 1` invariant.

#### Contract 2: `ProvenanceRegistry.sol` Specification (TRD §12.1 & SRS §6.5)
- **Primary Responsibility:** Sequential, cryptographically chained custody transfer and audit logging.
- **Data Schema (`TRD §12.1`, `SRS §6.5`):**
  - `eventId`: `bytes32` (Cryptographic hash of the audit event).
  - `docIdHash`: `bytes32` (Evidence object reference).
  - `eventType`: `string` (`UPLOAD`, `ACCESS`, `TRANSFER`, `FORENSIC_EXTRACT`, `LEGAL_SEAL`, `DISPOSITION`).
  - `actorId`: `string` (Hashed officer identifier or institutional pseudonymous ID).
  - `actorRole`: `string` (`INVESTIGATOR`, `FORENSIC_ANALYST`, `PROSECUTOR`, `JUDICIAL_OFFICER`, `ADMIN`).
  - `timestamp`: `uint256` (Block timestamp).
  - `prevEventHash`: `bytes32` (Cryptographic hash of previous custody event for unbroken audit chaining).
- **Core Functions:**
  - `recordCustodyEvent(EventInput calldata input)`
  - `getEvent(eventId) -> CustodyEvent`
  - `getDocumentHistory(docIdHash) -> bytes32[]`
  - `verifyChainIntegrity(docIdHash, expectedLatestHash) -> bool`
- **On-Chain Governance:**
  - `addAdmin(newAdmin)`, `removeAdmin(admin)`, `setWriter(writer, authorized)` with multi-admin voting.

---

## 3. Cryptographic Data Flow & Plane Separation (TRD §3 & §11)

```
  APPLICATION PLANE                STORAGE / DATA PLANE           CONSENSUS PLANE
 ┌──────────────────┐             ┌─────────────────────┐       ┌─────────────────┐
 │ Law Enforcement  │             │ AES-256-GCM Storage │       │  Polygon Amoy   │
 │ Forensic Officer ├──(HTTPS)───►│ Key Management (DEK)│       │  (Chain 80002)  │
 │ Judicial Portal  │             │ SQLite / PostgreSQL │       │                 │
 └────────┬─────────┘             └──────────┬──────────┘       └────────┬────────┘
          │                                  │                           │
          ▼                                  ▼                           │
 ┌──────────────────────────────────────────────────────┐                │
 │ FASTAPI TRUST BACKEND                                │                │
 │ 1. Ingest file → Generate SHA-256 contentHash         │                │
 │ 2. Chunk document → Build Merkle Tree → merkleRoot   │                │
 │ 3. Encrypt payload with per-doc DEK (Envelope Cipher)│                │
 │ 4. Dispatch async transaction to Polygon Amoy ───────┼────────────────┘
 │    - EvidenceRegistry.registerEvidence(...)          │
 │    - ProvenanceRegistry.recordCustodyEvent(...)      │
 └──────────────────────────────────────────────────────┘
```

---

## 4. Test Matrix & Acceptance Criteria (Test §6 & SRS §16)

Every component must satisfy the formal test suite defined in `Test(6).md`:

| Test ID | Requirement | Spec Reference | Validation Method |
|---------|-------------|----------------|-------------------|
| **TC-CHAIN-001** | Anchor Creation | `Test.md §6` | Register doc → store Polygon EVM tx hash |
| **TC-CHAIN-002** | Anchor Verification | `Test.md §6` | Local SHA-256 matches on-chain `contentHash` |
| **TC-CHAIN-003** | Anti-Tamper Detection | `Test.md §6` | Tampered byte causes cryptographic verification failure |
| **TC-CHAIN-004** | Offline Resiliency | `Test.md §6` | Local DevLedger caches state when RPC is unreachable |
| **TC-CHAIN-005** | Zero Sensitive Data on Chain | `Test.md §6` | EVM tx payloads contain zero PII or plaintext bytes |
| **TC-CHAIN-006** | Idempotency Enforcement | `Test.md §6` | Duplicate registrations do not mutate historical state |
| **SR-010** | Legal Hold Preservation | `SRS.md §5` | Evidence marked `LEGAL_HOLD` rejects disposition |
| **FR-019** | BSA §63 Certificate | `SRS.md §4` | Generates deterministic cryptographic certificate |

---

## 5. Implementation Roadmap & Compliance Alignment

1. **Smart Contracts Consolidation:**
   - Retain **strictly** `EvidenceRegistry.sol` and `ProvenanceRegistry.sol` in `contracts/`.
   - Purge extraneous non-BRD contracts (`LegalHoldRegistry`, `AuditAnchorRegistry`, `AccessControlRegistry`) by consolidating statutory hold flags and batch Merkle proofs directly into `EvidenceRegistry.sol` as defined in `TRD §12.1`.
2. **Backend Adapter Alignment:**
   - Update `PolygonLedgerAdapter` to bind directly to `EvidenceRegistry` and `ProvenanceRegistry`.
3. **Deployment Scripts:**
   - Update `deploy_amoy.js` and `verify_contracts.js` to compile and deploy the two BRD-specified contracts.
