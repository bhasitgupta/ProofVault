# TRD.md — Proof Vault

## Technical Requirements & Reference Architecture

**Project:** Proof Vault Project — Secure Digital Document Management System for
Legal and Investigation Documents  
**Architecture Target:** Government Enterprise / Security-Sensitive  
**Primary Architecture:** API-first, zero-trust, modular service
architecture  
**Blockchain:** Polygon Amoy for SIH demo; Polygon-based
permissioned/sovereign deployment for production subject to government
approval

------------------------------------------------------------------------

## 1. Technical Objectives

The platform shall:

- preserve confidentiality of sensitive records;
- guarantee deterministic integrity verification;
- maintain complete provenance and chain of custody;
- support multi-organization authorization;
- integrate with existing government systems;
- operate on government-controlled infrastructure;
- support horizontal scaling;
- support disaster recovery;
- expose controlled APIs;
- separate source evidence from derived content;
- keep blockchain outside the confidential document-data plane.

------------------------------------------------------------------------

## 2. Reference Architecture

``` text
                         GOVERNMENT / EXTERNAL ECOSYSTEM
 ┌───────────────────────────────────────────────────────────────────────┐
 │ ICJS │ CCTNS │ e-Forensics │ e-Prosecution │ e-Sakshya │ eCourts     │
 │ SSO / PKI / eSign │ Approved Forensic Labs │ Authorized Agencies     │
 └──────────────────────────────────┬────────────────────────────────────┘
                                    │
                              mTLS / API Security
                                    │
                         ┌──────────▼──────────┐
                         │ API Gateway / WAF   │
                         │ Rate Limit / DDoS   │
                         │ Schema Validation   │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────▼──────────────┐
                     │ Identity + Policy Layer     │
                     │ SSO / MFA / RBAC / ABAC     │
                     │ Policy Decision Point       │
                     └──────────────┬──────────────┘
                                    │
            ┌───────────────────────▼────────────────────────┐
            │              APPLICATION SERVICES              │
            │ Case │ Document │ Custody │ Sharing │ Search  │
            │ Signature │ Redaction │ Audit │ Verification  │
            └──────┬───────────┬────────────┬───────────────┘
                   │           │            │
          ┌────────▼───┐ ┌─────▼──────┐ ┌──▼───────────────┐
          │ PostgreSQL │ │ Object     │ │ Search / Vector  │
          │ Metadata   │ │ Storage    │ │ OpenSearch +     │
          │ Policies   │ │ Encrypted  │ │ pgvector         │
          └────────────┘ └────────────┘ └───────────────────┘
                   │
          ┌────────▼──────────────────────────────────────┐
          │ AI / Document Intelligence                    │
          │ AV Scan → OCR → Classification → PII →       │
          │ Embedding → Search/Graph → Human Review       │
          └───────────────────────────────────────────────┘
                   │
          ┌────────▼──────────────────────────────────────┐
          │ TRUST / PROVENANCE ADAPTER                    │
          │ SHA-256 → Merkle Batch → Polygon Contract     │
          └──────────────────────┬────────────────────────┘
                                 │
                  ┌──────────────▼────────────────┐
                  │ Polygon Trust Network         │
                  │ EvidenceRegistry             │
                  │ ProvenanceRegistry            │
                  │ Verification Events           │
                  └────────────────────────────────┘

  SECURITY / OPERATIONS PLANE
  ┌─────────────────────────────────────────────────────────────┐
  │ KMS/HSM │ Secrets │ SIEM │ Monitoring │ Backup │ DR │ SOC  │
  └─────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

## 3. Architectural Principles

### 3.1 Data-plane separation

The architecture has three logically separate planes:

1.  **Evidence Data Plane** — confidential files and metadata.
2.  **Trust Plane** — cryptographic proofs, provenance anchors and
    verification.
3.  **Security/Control Plane** — IAM, policy, audit, key management and
    monitoring.

The blockchain is not the document database.

### 3.2 Source-of-truth model

| Data                 | System of record                |
|----------------------|---------------------------------|
| Original document    | Encrypted object store          |
| Document metadata    | PostgreSQL                      |
| Search index         | OpenSearch                      |
| Vector embeddings    | pgvector                        |
| Access policies      | Policy/IAM service + PostgreSQL |
| Audit events         | Append-only audit store         |
| Cryptographic anchor | Polygon trust layer             |
| Keys                 | HSM/KMS                         |
| Identity             | Government SSO/approved IdP     |

------------------------------------------------------------------------

## 4. Recommended Technology Stack

| Layer                | Technology                                                             |
|----------------------|------------------------------------------------------------------------|
| Frontend             | Next.js + TypeScript                                                   |
| UI                   | Tailwind CSS + shadcn/ui                                               |
| API                  | FastAPI + Python                                                       |
| API specification    | OpenAPI 3                                                              |
| Gateway              | NGINX/Kong or approved government API gateway                          |
| Identity             | Government SSO / Keycloak-compatible IAM                               |
| MFA                  | Enterprise MFA / government-approved authenticator                     |
| Authorization        | RBAC + ABAC policy engine                                              |
| Database             | PostgreSQL                                                             |
| Search               | OpenSearch                                                             |
| Vector               | pgvector                                                               |
| Object storage       | Government-approved S3-compatible object store / MinIO for prototype   |
| OCR                  | PaddleOCR / Tesseract                                                  |
| Document parsing     | Apache Tika / PDF libraries                                            |
| Malware scanning     | ClamAV or approved enterprise scanner                                  |
| AI                   | Hugging Face models + approved local/private LLM                       |
| Embeddings           | BGE / multilingual embedding model                                     |
| Graph                | PostgreSQL relationships initially; graph DB only if justified         |
| Blockchain           | Polygon Amoy / Polygon PoS / Polygon CDK-based private network         |
| Smart contracts      | Solidity + OpenZeppelin                                                |
| EVM client           | ethers.js                                                              |
| Contract development | Foundry or Hardhat                                                     |
| Crypto               | SHA-256; AES-256-GCM; TLS 1.3 where supported                          |
| Key management       | HSM/KMS                                                                |
| Signatures           | eSign/DSC integration-ready                                            |
| Containers           | Docker / Kubernetes                                                    |
| Observability        | Prometheus + Grafana + OpenTelemetry                                   |
| Logs/SIEM            | Government SOC/SIEM integration                                        |
| CI/CD                | GitHub Actions for prototype; government-approved CI/CD for production |
| Secrets              | Vault/HSM/KMS-backed secret management                                 |

------------------------------------------------------------------------

## 5. Deployment Model

### SIH demonstration

- Next.js frontend
- FastAPI services
- PostgreSQL
- MinIO
- OpenSearch/pgvector
- Keycloak
- Polygon Amoy
- Docker Compose/Kubernetes
- synthetic documents only.

### Government production

Preferred hosting hierarchy:

1.  Government-controlled data centre / approved national
    infrastructure;
2.  approved GI Cloud/MeghRaj or other authorized government cloud;
3.  approved sovereign/Indian cloud service under applicable government
    procurement and security controls.

Consumer-grade hosted Supabase/Firebase should not be treated as the
production baseline for confidential legal/evidence records unless
explicitly approved by the competent authority.

------------------------------------------------------------------------

## 6. Network Zones

### Zone A — Public/Edge

- WAF
- DDoS controls
- reverse proxy
- public API endpoints only where required.

### Zone B — Application

- frontend
- API gateway
- application services.

### Zone C — Restricted Data

- PostgreSQL
- object store
- search cluster
- vector store.

### Zone D — Security

- KMS/HSM
- secrets
- audit
- SIEM forwarding.

### Zone E — Blockchain

- blockchain RPC gateway
- signing service
- Polygon nodes/private network as applicable.

No direct client-to-database or client-to-object-store write path is
permitted.

------------------------------------------------------------------------

## 7. Identity Architecture

``` text
Government SSO
      |
      v
Identity Provider
      |
 MFA / Device / Session Controls
      |
      v
Access Token
      |
      v
Policy Enforcement Point
      |
      +--> RBAC
      +--> ABAC
      +--> Case Membership
      +--> Organization
      +--> Sensitivity
      +--> Purpose
      +--> Time
      +--> Device/Network
      |
      v
Permit / Deny + Audit
```

### RBAC examples

- SUPER_ADMIN
- SECURITY_ADMIN
- ORG_ADMIN
- INVESTIGATING_OFFICER
- SUPERVISOR
- EVIDENCE_CUSTODIAN
- FORENSIC_ANALYST
- PROSECUTOR
- COURT_USER
- LEGAL_OFFICER
- AUDITOR
- READ_ONLY_REVIEWER

RBAC alone is insufficient. A user with a legitimate role must still
satisfy case and sensitivity policies.

------------------------------------------------------------------------

## 8. ABAC Policy Model

Example:

``` json
{
  "subject": {
    "role": "FORENSIC_ANALYST",
    "organization": "FSL-X"
  },
  "resource": {
    "case_id": "CASE-001",
    "classification": "RESTRICTED"
  },
  "action": "DOWNLOAD",
  "context": {
    "purpose": "FORENSIC_ANALYSIS",
    "mfa": true,
    "device_trusted": true
  }
}
```

Policy decision:

``` text
role AND case_membership AND organization_scope
AND sensitivity_clearance AND purpose_allowed
AND authentication_assurance
= ALLOW
```

------------------------------------------------------------------------

## 9. Document Ingestion Pipeline

``` text
Upload/API Ingestion
      |
      v
Authentication + Authorization
      |
      v
MIME / Size / Filename Validation
      |
      v
Malware / Content Scan
      |
      v
Canonicalization rules
      |
      +--> Preserve original bytes
      |
      v
SHA-256
      |
      +--> Metadata record
      +--> Evidence Passport
      |
      v
AES-256-GCM / envelope encryption
      |
      v
Object Storage
      |
      +--> OCR
      +--> Classification
      +--> PII detection
      +--> Text extraction
      +--> Embedding
      |
      v
Search Index
      |
      v
Human-reviewed intelligence
```

------------------------------------------------------------------------

## 10. Immutable Versioning

A document is never updated in-place after evidence registration.

``` text
Document D
 ├── Version 1 → hash H1
 ├── Version 2 → hash H2
 └── Version 3 → hash H3
```

Each version has:

- unique version ID;
- immutable object reference;
- hash;
- creator;
- timestamp;
- reason;
- parent version;
- signature state;
- custody state;
- verification state.

A correction produces a new version rather than mutating the prior
version.

------------------------------------------------------------------------

## 11. Cryptographic Integrity

### Hash

For each stored evidence object:

``` text
H = SHA-256(canonical_original_bytes)
```

The hash is stored:

- in the protected metadata database;
- in the audit/provenance system;
- optionally in a Merkle batch;
- on the Polygon trust layer.

The file itself is not stored on-chain.

### Verification

``` text
Retrieved Bytes
      |
      v
SHA-256
      |
      v
Compare with Evidence Passport
      |
      +--> Match = INTEGRITY VERIFIED
      |
      +--> Mismatch = INTEGRITY VIOLATION
```

------------------------------------------------------------------------

## 12. Polygon Trust Architecture

### Contracts

#### EvidenceRegistry.sol

Stores/anchors:

- document/version identifier hash;
- content digest;
- registration timestamp;
- anchor/batch ID;
- status.

#### ProvenanceRegistry.sol

Stores/anchors:

- provenance event hash;
- event type;
- evidence/version reference;
- timestamp;
- previous-event reference.

Avoid placing:

- PDF;
- image;
- audio;
- video;
- victim/witness name;
- address;
- phone;
- Aadhaar;
- FIR contents;
- case narrative;
- access-token data

on a public chain.

### Production privacy

For a government production deployment, evaluate a Polygon CDK-based
permissioned/sovereign network with private RPC/data controls and
government-operated infrastructure. The production blockchain
architecture must pass government security, privacy, data-residency and
procurement review.

------------------------------------------------------------------------

## 13. Merkle Batching

For high-volume production:

``` text
Document H1
Document H2
Document H3
Document H4
      |
      v
Merkle Tree
      |
      v
Merkle Root
      |
      v
Polygon Anchor
```

This reduces blockchain transactions while allowing an individual
document hash to be proven against the anchored root.

------------------------------------------------------------------------

## 14. Key Management

### Key hierarchy

``` text
HSM / KMS Root
      |
      +--> Key Encryption Keys
              |
              +--> Case/Data Encryption Keys
                      |
                      +--> Object Encryption
```

Requirements:

- keys never hard-coded;
- private keys never committed to source control;
- rotation supported;
- revocation supported;
- separation of duties;
- HSM-backed signing for high-assurance production;
- audit of key use.

------------------------------------------------------------------------

## 15. Audit Architecture

Every security-relevant event contains:

- event ID;
- timestamp;
- actor ID;
- organization;
- action;
- resource;
- case;
- outcome;
- source IP/device context as permitted;
- policy decision;
- correlation ID;
- previous audit hash;
- current audit hash.

``` text
E1 --> E2 --> E3 --> E4 --> E5
 |      |      |      |      |
H1     H2     H3     H4     H5
```

Where:

``` text
Hn = SHA-256(event_n || Hn-1)
```

Periodic audit-root anchoring can be performed to Polygon.

------------------------------------------------------------------------

## 16. AI Architecture

``` text
Document
   |
   +--> OCR
   |
   +--> Text Extraction
   |
   +--> Metadata Extraction
   |
   +--> PII Detection
   |
   +--> Classification
   |
   +--> Chunking
   |
   +--> Embedding
   |
   +--> Vector Index
   |
   +--> Semantic Retrieval
   |
   +--> Relationship Extraction
   |
   +--> Human-reviewed answer
```

### AI guardrails

- no AI write access to original evidence;
- no automatic evidence deletion;
- no autonomous legal conclusions;
- source references shown with generated output;
- confidence/uncertainty surfaced;
- prompt/input logging without sensitive content leakage;
- local/private inference for confidential data;
- model version recorded;
- model output treated as derived material.

------------------------------------------------------------------------

## 17. Dynamic Redaction

The redaction service creates a derived object:

``` text
Original Evidence
       |
       v
PII Detection
       |
       v
Policy
       |
       v
Redacted View
```

The original remains unchanged.

Redaction metadata must record:

- source version;
- detector/model;
- policy;
- redaction categories;
- reviewer;
- timestamp;
- derived-object hash.

------------------------------------------------------------------------

## 18. Controlled Sharing

A share request includes:

- sender;
- recipient organization/user;
- document/version;
- purpose;
- access mode;
- start time;
- expiry;
- download permission;
- watermark policy;
- approval state.

Example:

``` text
IO
 |
 | share request
 v
Supervisor
 |
 | approve
 v
Policy Engine
 |
 | authorize
 v
Recipient
 |
 | access
 v
Audit + expiry
```

------------------------------------------------------------------------

## 19. Break-Glass Access

Break-glass is not a hidden administrator bypass.

Minimum workflow:

1.  user requests emergency access;
2.  reason is mandatory;
3.  scope is explicit;
4.  duration is short;
5.  approval/dual control is applied where policy requires;
6.  elevated access is flagged;
7.  real-time SOC/security alert generated;
8.  all actions are logged;
9.  access automatically expires;
10. post-event review is mandatory.

------------------------------------------------------------------------

## 20. Integration Architecture

Use adapters rather than direct coupling:

``` text
ICJS Adapter
CCTNS Adapter
e-Forensics Adapter
e-Prosecution Adapter
e-Sakshya Adapter
eSign/DSC Adapter
Government SSO Adapter
SIEM Adapter
       |
       v
Canonical Integration API
       |
       v
Proof Vault
```

Each adapter must support:

- authentication;
- authorization;
- schema validation;
- correlation IDs;
- idempotency;
- retry;
- dead-letter queue;
- audit;
- versioned contracts.

------------------------------------------------------------------------

## 21. API Design

Core endpoints:

``` text
POST   /v1/cases
GET    /v1/cases/{case_id}

POST   /v1/documents
GET    /v1/documents/{document_id}
GET    /v1/documents/{document_id}/versions

POST   /v1/documents/{document_id}/verify
POST   /v1/documents/{document_id}/versions

POST   /v1/custody/transfers
GET    /v1/documents/{document_id}/custody

POST   /v1/shares
POST   /v1/shares/{share_id}/approve
POST   /v1/shares/{share_id}/revoke

POST   /v1/break-glass
POST   /v1/signatures/verify

GET    /v1/search
GET    /v1/audit
GET    /v1/evidence-passports/{document_id}

POST   /v1/blockchain/anchors
GET    /v1/blockchain/verify/{document_id}
```

All APIs:

- versioned;
- authenticated;
- authorized;
- rate-limited;
- schema validated;
- auditable;
- idempotency-aware for write operations.

------------------------------------------------------------------------

## 22. Reliability

Recommended production targets:

- active-active or active-passive application tiers;
- database replication;
- object-store redundancy;
- multi-zone deployment;
- backup encryption;
- tested restoration;
- disaster recovery site;
- periodic DR drills.

RPO/RTO must be finalized with the competent authority and business
impact analysis.

------------------------------------------------------------------------

## 23. Security Engineering

Mandatory engineering gates:

- threat modeling;
- SAST;
- DAST;
- dependency scanning;
- SBOM;
- secret scanning;
- container scanning;
- IaC scanning;
- API security testing;
- cryptographic review;
- penetration testing;
- secure code review;
- audit-log verification;
- access-control testing.

Security must be part of design and development, not a post-build
activity.

------------------------------------------------------------------------

## 24. Threat Model

### Assets

- documents;
- evidence metadata;
- identities;
- keys;
- audit logs;
- case relationships;
- search indexes;
- signatures;
- blockchain credentials.

### Threats

- credential theft;
- privilege escalation;
- insider misuse;
- object-store exposure;
- API abuse;
- malware upload;
- ransomware;
- unauthorized export;
- audit tampering;
- key compromise;
- model leakage;
- supply-chain compromise;
- blockchain wallet compromise;
- replay/duplicate submissions.

### Primary controls

| Threat               | Control                                      |
|----------------------|----------------------------------------------|
| Credential theft     | MFA, device/session policy                   |
| Privilege escalation | RBAC+ABAC+SoD                                |
| Storage leak         | AES-256-GCM + KMS/HSM                        |
| Malware              | content scanning                             |
| Audit tampering      | append-only + hash chain + anchoring         |
| Key compromise       | HSM/KMS + rotation                           |
| AI leakage           | private inference + data minimization        |
| API abuse            | gateway, rate limits, schema validation      |
| Ransomware           | immutable backup + offline/isolated recovery |
| Supply-chain attack  | SBOM + signed artifacts + scanning           |

------------------------------------------------------------------------

## 25. Performance Targets

Initial engineering targets; production values require workload
benchmarking:

- 1,000 concurrent authenticated sessions for pilot baseline;
- 100 document-ingestion requests/minute sustained in MVP benchmark;
- p95 metadata search \<= 2 seconds;
- p95 indexed search \<= 3 seconds;
- document verification \<= 2 seconds excluding blockchain network
  latency;
- blockchain anchoring asynchronous;
- large-object upload through resumable/multipart transfer.

------------------------------------------------------------------------

## 26. Observability

Metrics:

- request rate;
- latency;
- error rate;
- auth failures;
- authorization denials;
- break-glass events;
- document ingestion rate;
- OCR queue depth;
- AI queue depth;
- search latency;
- object-store health;
- database health;
- blockchain RPC health;
- anchor failures;
- key-service failures.

All sensitive logs must be sanitized.

------------------------------------------------------------------------

## 27. Backup and Disaster Recovery

Backup classes:

1.  PostgreSQL encrypted backups.
2.  Object-store replicated copies.
3.  Search index snapshots.
4.  Configuration backups.
5.  Audit-log backups.
6.  Blockchain contract/config metadata.
7.  Key metadata and recovery procedures.

Never back up plaintext encryption keys with the data they protect.

------------------------------------------------------------------------

## 28. Technical Decision Record

### ADR-001: Blockchain

**Decision:** Polygon instead of Hyperledger Fabric.  
**Reason:** EVM compatibility, Solidity ecosystem, low-friction
prototype, public verification capability and potential path to a
sovereign/private Polygon-based architecture.

### ADR-002: Off-chain evidence

**Decision:** Evidence remains in encrypted government-controlled object
storage.  
**Reason:** confidentiality, scale, legal retention, operational
performance.

### ADR-003: PostgreSQL

**Decision:** PostgreSQL remains the authoritative transactional
metadata store.  
**Reason:** mature ACID semantics and strong relational modeling.

### ADR-004: AI

**Decision:** AI remains assistive and isolated from source-evidence
mutation.  
**Reason:** hallucination and confidentiality risks.

### ADR-005: Public Polygon

**Decision:** public Polygon is limited to demo/non-sensitive use unless
explicitly approved.  
**Reason:** public ledgers expose transaction metadata and are not an
appropriate default confidentiality boundary.

------------------------------------------------------------------------

## 29. Production Architecture Statement

The final production architecture shall be validated against:

- government hosting policy;
- CERT-In requirements;
- applicable data protection law/rules;
- government PKI/eSign requirements;
- approved identity systems;
- security audit requirements;
- procurement/vendor policy;
- data residency requirements;
- retention and legal-hold policy;
- ICJS/NCRB integration standards.

No prototype technology choice should be treated as pre-approved for
production merely because it works in the SIH demo.
