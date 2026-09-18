# SDMS System Architecture

## Overview
The Secure Digital Management System (SDMS) implements a zero-trust electronic evidence architecture designed for Indian law enforcement and judiciary workflows.

```
+-----------------------------------------------------------------------------------+
|                                 SDMS Client UI                                    |
|                       React 18 + Vite + Tailwind CSS                              |
+-----------------------------------------+-----------------------------------------+
                                          | REST + Bearer JWT
+-----------------------------------------v-----------------------------------------+
|                               FastAPI Application                                 |
|                                                                                   |
|  +------------------+   +-------------------+   +-------------------------------+  |
|  | Auth & MFA Engine|   | Ingestion Engine  |   | Verified RAG Engine           |  |
|  | (TOTP / PBKDF2)  |   | (14-Step Atomic)  |   | (Integrity Gate + Pre-Filter) |  |
|  +------------------+   +-------------------+   +-------------------------------+  |
+---------+-------------------------+-------------------------------+---------------+
          |                         |                               |
+---------v----------+    +---------v----------+         +----------v---------------+
|  Encrypted Storage |    |  Metadata & Scope  |         |  Dual-Channel Ledger     |
|  AES-256-GCM + AAD |    |  SQLite / Postgres |         |  dochash & access        |
+--------------------+    +--------------------+         +--------------------------+
```

## Key Components

1. **Ingestion Pipeline (14-Step Atomic)**:
   - Size & format guard
   - Signature & PE malware detection
   - Content hashing & normalization
   - Deterministic chunking with page provenance
   - Domain-separated Merkle tree computation
   - Envelope encryption via AES-256-GCM (with doc_id as AAD)
   - On-chain registration on `dochash-channel`
   - Vector indexing in Qdrant (gated on ledger commit)

2. **Integrity Gate**:
   - 4-Tier verification hierarchy:
     - Tier 1: Chunk hash verification
     - Tier 2: Merkle inclusion proof
     - Tier 3: Blob hash verification against ledger
     - Tier 4: Content hash verification
   - Automatic `TAMPER_ALERT` on-chain event emission and output withholding on failure.
