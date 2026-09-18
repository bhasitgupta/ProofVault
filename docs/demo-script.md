# SDMS SIH Grand Finale: Live Jury Demonstration Script

## Overview & Evaluation Objectives

This live demonstration script guides the presentation team through a compelling, end-to-end showcase of the **Secure Digital Document Management System (SDMS)**. It is structured to prove compliance with **Bharatiya Sakshya Adhiniyam (BSA), 2023 §63**, demonstrate zero-trust integrity verification, and execute a live red-team tamper attack.

**Total Time**: 10–12 minutes  
**Target Audience**: Smart India Hackathon (SIH) Technical & Judicial Evaluators

---

## Pre-Demo Checklist & Setup

Ensure services are running in two terminal windows:
```bash
# Terminal 1: Backend
make run-backend

# Terminal 2: Frontend
make run-frontend
```

Ensure fresh seed data and synthetic evidence corpus are generated:
```bash
python scripts/seed.py
python scripts/generate_corpus.py
```

Open browser at `http://localhost:5173`.

---

## Phase 1: Zero-Trust Authentication & Role Scoping (2 mins)

### 1.1 The Challenge
*"In current police and court workflows, static passwords and single-role tokens lead to unauthorized access and evidence leaks across jurisdictional boundaries."*

### 1.2 The Demonstration
1. Open the SDMS portal.
2. Log in as **Investigating Officer Vikram Singh**:
   - Username: `io_singh`
   - Password: `Password123!`
3. Complete the **TOTP MFA Challenge**:
   - Show that sensitive evidence access strictly mandates multi-factor authentication.
4. Point out the **Active Scope Indicator** at the top right:
   - IO Singh is assigned only to `CASE-2026-001` (FIR 42/2026 - Cyber Heist) and `CASE-2026-002`.
   - Emphasize **Rule C8**: Case scoping is queried **live from the database**, not baked into JWT claims.

---

## Phase 2: 14-Step Atomic Evidence Ingestion (2 mins)

### 1.1 The Challenge
*"Evidence must be safeguarded the instant it enters the system, preventing malware entry and ensuring mathematical non-repudiation."*

### 1.2 The Demonstration
1. Navigate to the **Upload Evidence** page.
2. Select Case `CASE-2026-001` and upload a new digital artifact:
   - Walk through the visual 14-step pipeline status indicator in real time:
     - Step 2: In-memory EICAR malware scan (passed).
     - Step 5: Deterministic token chunking with page provenance.
     - Step 6: Domain-separated Merkle tree computation (`0x00` leaf, `0x01` interior).
     - Step 8: Envelope encryption using AES-256-GCM with `doc_id` as Additional Authenticated Data (AAD).
     - Step 10: Immutable commitment to `dochash-channel`.
     - Step 12: Vector indexing in Qdrant gated on ledger commit.
3. Show the **Ledger Transaction Link** generated upon successful commit.

---

## Phase 3: Integrity-Verified RAG with Exact Citations (2.5 mins)

### 1.1 The Challenge
*"Standard LLMs hallucinate and can be duped by doctored search indexes. Courts require irrefutable provenance for every generated sentence."*

### 1.2 The Demonstration
1. Navigate to the **Case Workspace** -> **Ask Evidence (RAG)** tab.
2. Submit query:
   > *"What was the caliber and ballistic match found on the recovered firearm?"*
3. Observe the response:
   - The LLM synthesizes the answer citing specific CFSL forensic reports.
   - Click on the **Citation Chip `[Doc 1 - Chunk 3, Page 2]`**.
   - A modal displays the exact source snippet, accompanied by a green **Verified Merkle Proof** badge.
   - Explain to the jury: Before any chunk is injected into the LLM prompt, it passed the **Integrity Gate**:
     $$\text{Chunk Hash} \rightarrow \text{Merkle Audit Path} \rightarrow \text{Ledger Merkle Root Commit}$$

---

## Phase 4: Live Red-Team Tamper Attack & Detection (2.5 mins)

### 1.1 The Challenge
*"What happens if an insider—a rogue database administrator or malicious actor—alters evidence directly on disk or in the database?"*

### 1.2 The Demonstration (The "Showstopper")
1. Open a side-by-side terminal window and show document details for the FIR in `CASE-2026-001`.
2. Execute the CLI tamper attack tool:
   ```bash
   # Option A: Tamper with a text chunk directly in the database
   python scripts/tamper.py --doc-id <DOC_UUID> --chunk 0 --mode mutate

   # OR Option B: Tamper with the encrypted ciphertext blob on disk (bit-rot attack)
   python scripts/tamper.py --doc-id <DOC_UUID> --mode bitrot
   ```
3. Immediately refresh or re-run verification in the UI:
   - The UI flashes a red **TAMPER ALERT** banner.
   - **Tier 1 / Tier 3 Integrity Gate fails instantly**:
     `Expected hash: a8f9... != Computed hash: 3c12...`
   - Show the ledger timeline: An immutable `TAMPER_ALERT` audit event has been automatically written to `access-channel`.
   - Run the RAG query again: The system **withholds** the corrupted evidence, refusing to feed tainted text to the AI or court.

---

## Phase 5: BSA §63 / IEA §65B Certificate Generation (1.5 mins)

### 1.1 The Challenge
*"Indian courts reject electronic evidence unless accompanied by an authentic Section 63 certificate with unbroken custody."*

### 1.2 The Demonstration
1. Switch roles to **Judge Savita Sharma** (`judge_sharma`).
2. Navigate to `CASE-2026-001` -> **Document Details** -> **Export Legal Certificate**.
3. Download the generated **BSA §63 PDF Certificate**:
   - Show the formal statutory declaration under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023.
   - Point to the cryptographic fingerprints: Content Hash, Merkle Root, AES Blob Hash, and Ledger Tx ID.
   - Point your phone camera or QR scanner at the embedded QR code: It resolves to the cryptographic verification endpoint confirming evidentiary validity.

---

## Phase 6: Instant Revocation & Zero Cross-Case Leakage (1 min)

1. Log in as an officer assigned solely to `CASE-2026-002`.
2. Attempt to query or access `CASE-2026-001` evidence:
   - Vector pre-retrieval hard filter returns exactly 0 candidates.
   - Direct document API request returns `403 Forbidden` with an immutable access denial logged on-chain.
3. Conclude the demonstration with the summary of guarantees:
   - **Zero Hallucination with Proof**
   - **Zero Cross-Case Leakage**
   - **Immediate Tamper Detection**
   - **Full Indian Statutory Compliance**

