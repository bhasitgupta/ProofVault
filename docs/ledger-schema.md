# Dual-Channel Ledger Architecture & Schema Specification

## 1. Architectural Overview

The Secure Digital Document Management System (SDMS) utilizes a dual-channel permissioned ledger design to decouple immutable evidence provenance records from high-throughput access audit logs.

```
+-----------------------------------------------------------------------------------+
|                               SDMS Application Core                               |
+-------------------------+-------------------------------+-------------------------+
                          |                               |
              (Evidence Registration)                 (Audit Events)
                          |                               |
                          v                               v
+------------------------------------+   +------------------------------------+
|          dochash-channel           |   |           access-channel           |
|                                    |   |                                    |
|  - Write-once document hashes      |   |  - Append-only query & view logs   |
|  - Merkle root commitments         |   |  - Tamper alert audit events       |
|  - Cryptographic shredding flags   |   |  - Role & case scope assertions    |
+------------------------------------+   +------------------------------------+
```

---

## 2. Channel 1: `dochash-channel`

The `dochash-channel` stores cryptographic commitments for every piece of digital evidence ingested into SDMS. It provides immutable non-repudiation for Bharatiya Sakshya Adhiniyam (BSA) §63 compliance.

### 2.1 State Key Convention
Each state entry is keyed by the unique document identifier:
```text
Key: DOC_<doc_id>
```

### 2.2 `DocHashRecord` Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DocHashRecord",
  "type": "object",
  "required": [
    "docId",
    "caseId",
    "merkleRoot",
    "contentHash",
    "blobHash",
    "chunkCount",
    "timestamp",
    "registeredBy",
    "isShredded"
  ],
  "properties": {
    "docId": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier of the ingested document"
    },
    "caseId": {
      "type": "string",
      "description": "Case file identifier (e.g., FIR/CR-101/2026)"
    },
    "merkleRoot": {
      "type": "string",
      "pattern": "^[0-9a-f]{64}$",
      "description": "SHA-256 Merkle root computed with domain separation"
    },
    "contentHash": {
      "type": "string",
      "pattern": "^[0-9a-f]{64}$",
      "description": "SHA-256 hash of raw extracted normalized text"
    },
    "blobHash": {
      "type": "string",
      "pattern": "^[0-9a-f]{64}$",
      "description": "SHA-256 hash of AES-256-GCM encrypted binary artifact"
    },
    "chunkCount": {
      "type": "integer",
      "minimum": 1,
      "description": "Number of deterministic text chunks"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "UTC ISO-8601 registration timestamp"
    },
    "registeredBy": {
      "type": "string",
      "description": "User ID of the registering Investigating Officer or Custodian"
    },
    "isShredded": {
      "type": "boolean",
      "default": false,
      "description": "Flag indicating if document DEK has been cryptographically shredded"
    },
    "shreddedAt": {
      "type": ["string", "null"],
      "format": "date-time",
      "description": "UTC ISO-8601 timestamp when cryptographic shredding occurred"
    },
    "metadataHash": {
      "type": "string",
      "pattern": "^[0-9a-f]{64}$",
      "description": "SHA-256 hash of normalized document metadata envelope"
    }
  },
  "additionalProperties": false
}
```

### 2.3 Smart Contract Transactions (`DocHashContract`)
- `RegisterDoc(docId, caseId, merkleRoot, contentHash, blobHash, chunkCount, registeredBy)`:
  - Asserts key `DOC_<docId>` does not already exist (write-once invariant).
  - Emits `DocRegisteredEvent`.
- `GetDoc(docId)`:
  - Returns the JSON representation of `DocHashRecord`.
- `VerifyMerkleProof(docId, chunkIndex, chunkHash, proofJson)`:
  - Reads `merkleRoot` from ledger and executes on-chain Merkle audit path evaluation.
  - Returns `{"valid": true|false}`.
- `MarkShredded(docId, reason)`:
  - Sets `isShredded = true` and records `shreddedAt`. Reversible deletion is strictly prohibited.

---

## 3. Channel 2: `access-channel`

The `access-channel` maintains an unalterable forensic audit trail of every access attempt, retrieval, query, policy evaluation, and tamper detection event.

### 3.1 State Key Convention
Audit records are sequenced with monotonically increasing composite keys:
```text
Key: AUDIT_<case_id>_<timestamp>_<event_id>
```

### 3.2 `AccessAuditRecord` Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AccessAuditRecord",
  "type": "object",
  "required": [
    "eventId",
    "timestamp",
    "userId",
    "role",
    "caseId",
    "action",
    "outcome",
    "ipHash"
  ],
  "properties": {
    "eventId": {
      "type": "string",
      "format": "uuid",
      "description": "Unique event identifier"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "UTC ISO-8601 audit event timestamp"
    },
    "userId": {
      "type": "string",
      "description": "User identifier who initiated the action"
    },
    "role": {
      "type": "string",
      "enum": ["investigating_officer", "forensic_analyst", "prosecutor", "judge", "super_admin"]
    },
    "caseId": {
      "type": "string",
      "description": "Case context under which the request occurred"
    },
    "docId": {
      "type": ["string", "null"],
      "description": "Document ID accessed (if applicable)"
    },
    "action": {
      "type": "string",
      "enum": ["READ", "QUERY", "EXPORT", "VERIFY", "INGEST", "SHRED", "TAMPER_ALERT"]
    },
    "outcome": {
      "type": "string",
      "enum": ["SUCCESS", "DENIED", "FAILED", "TAMPER_DETECTED"]
    },
    "merkleProofVerified": {
      "type": "boolean",
      "description": "True if chunks were cryptographically validated via Tier 2 proof"
    },
    "ipHash": {
      "type": "string",
      "pattern": "^[0-9a-f]{64}$",
      "description": "Pseudonymized SHA-256 hash of client IP address and user agent"
    },
    "details": {
      "type": "object",
      "description": "Contextual metadata (e.g., query string hash, retrieved chunk IDs)"
    }
  },
  "additionalProperties": true
}
```

### 3.3 Smart Contract Transactions (`AccessContract`)
- `RecordAccess(eventId, userId, role, caseId, docId, action, outcome, ipHash, detailsJson)`:
  - Appends audit log to the ledger state and updates couchdb composite indexes.
- `QueryAccessByCase(caseId)`:
  - Performs rich query on index `idx_case_id` returning chronological access history.
- `QueryAccessByDoc(docId)`:
  - Performs rich query on index `idx_doc_id`.
- `EmitTamperAlert(docId, chunkIndex, tierFailed, expectedHash, actualHash)`:
  - Emits high-priority on-chain event `TAMPER_ALERT` and locks document retrieval status.

---

## 4. Storage & Query Optimization

In production Fabric deployments:
- CouchDB state database is utilized for rich querying.
- Indexes:
  - `idx_case_id`: `{ "index": { "fields": ["caseId", "timestamp"] }, "type": "json" }`
  - `idx_doc_id`: `{ "index": { "fields": ["docId", "timestamp"] }, "type": "json" }`
  - `idx_action`: `{ "index": { "fields": ["action", "outcome"] }, "type": "json" }`

In local development (`LEDGER_BACKEND=dev`), the ledger gateway uses SQLite `ledger_transactions` and `ledger_blocks` with identical JSON payloads and SHA-256 block hash chaining.

