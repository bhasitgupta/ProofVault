# SRS.md — NYAYA-VAULT

## Software Requirements Specification

**System:** NYAYA-VAULT  
**SIH:** SIH26190  
**Version:** 1.0 Draft  
**Target:** Government Enterprise / Security-Sensitive Deployment

------------------------------------------------------------------------

# 1. Introduction

## 1.1 Purpose

This SRS defines functional, security, interface, data, performance and
operational requirements for NYAYA-VAULT, a secure digital document and
provenance platform for legal and investigation documents.

## 1.2 Scope

The system shall manage the lifecycle of sensitive documents associated
with cases and shall provide:

- ingestion;
- secure storage;
- metadata;
- versioning;
- access control;
- chain of custody;
- search;
- redaction;
- signatures;
- controlled sharing;
- audit;
- cryptographic verification;
- blockchain anchoring;
- external integration.

## 1.3 Intended Audience

- product owners;
- MHA/NCRB stakeholders;
- solution architects;
- security architects;
- developers;
- QA engineers;
- DevSecOps;
- auditors;
- integration teams;
- SIH evaluators.

------------------------------------------------------------------------

# 2. Definitions

**Evidence Object:** Immutable stored representation of an uploaded
legal/investigation record.

**Evidence Passport:** Structured provenance and identity record
associated with an evidence object/version.

**Custody Event:** Recorded transfer or handling event.

**Derived Object:** Redacted, OCR, converted, annotated or AI-generated
representation derived from an original.

**Integrity Verification:** Cryptographic comparison between the
retrieved object and its registered digest.

**Break-Glass:** Controlled emergency access outside normal policy.

**Trust Anchor:** External cryptographic record used to strengthen
independent verification.

------------------------------------------------------------------------

# 3. System Actors

| Actor               | Capabilities                               |
|---------------------|--------------------------------------------|
| Investigator        | create/manage assigned case documents      |
| Supervisor          | approve/review                             |
| Custodian           | custody transfer                           |
| Forensic Analyst    | access assigned forensic material          |
| Prosecutor          | access authorized prosecution records      |
| Court User          | access explicitly authorized court records |
| Auditor             | audit access                               |
| Security Officer    | security events and privileged oversight   |
| System Admin        | infrastructure/application administration  |
| Integration Service | machine-to-machine exchange                |

------------------------------------------------------------------------

# 4. Functional Requirements

## FR-001 Authentication

The system shall authenticate users through an approved identity
provider.

Acceptance:

- invalid credentials are denied;
- MFA policy can be enforced;
- session timeout is enforced;
- authentication events are logged.

## FR-002 Authorization

The system shall evaluate RBAC and ABAC policies before protected
operations.

Authorization attributes may include:

- user;
- role;
- organization;
- case membership;
- classification;
- purpose;
- action;
- time;
- device;
- network;
- authentication assurance.

## FR-003 Case Management

Users with appropriate permission shall create, view, update permitted
case metadata.

Case metadata shall include:

- case ID;
- external case references;
- organization;
- status;
- classification;
- created time;
- owner;
- retention policy.

## FR-004 Document Upload

The system shall allow authorized users to upload permitted document
types.

Before storage:

- authentication;
- authorization;
- size validation;
- type validation;
- malware scanning;
- hash calculation;
- metadata creation.

## FR-005 Original Preservation

The system shall preserve the original uploaded bytes as an immutable
evidence object.

## FR-006 Hashing

The system shall calculate a cryptographic digest for every evidence
version.

Default:

``` text
SHA-256
```

## FR-007 Versioning

The system shall create immutable versions rather than overwrite
existing evidence.

## FR-008 Evidence Passport

The system shall generate a unique Evidence Passport for each registered
evidence object.

Minimum fields:

``` text
evidence_id
case_id
version_id
document_type
source_system
source_reference
content_hash
created_at
registered_by
organization
classification
custody_state
signature_state
verification_state
anchor_reference
```

## FR-009 Custody

The system shall support custody transfer.

Required fields:

``` text
from_actor
to_actor
from_organization
to_organization
purpose
timestamp
authorization
integrity_before
acknowledgement
```

## FR-010 Audit

The system shall record all security-sensitive actions.

At minimum:

- login;
- logout;
- failed login;
- upload;
- download;
- view;
- version creation;
- delete request;
- retention action;
- share;
- revoke;
- verify;
- sign;
- policy change;
- role change;
- break-glass;
- administrator action;
- blockchain anchor.

## FR-011 Search

The system shall support:

- case ID;
- document ID;
- document type;
- date;
- organization;
- classification;
- actor;
- full text;
- OCR text;
- semantic similarity.

## FR-012 OCR

The system shall support OCR for supported image/PDF inputs.

OCR output must be marked as derived content.

## FR-013 Semantic Search

The system shall generate embeddings for approved document content and
support semantic retrieval.

## FR-014 AI Assistance

AI shall provide assistive outputs only.

Every answer must reference source documents/sections where possible.

The AI service shall not modify original evidence.

## FR-015 Redaction

The system shall create a redacted derivative based on policy.

The source object remains unchanged.

## FR-016 Sharing

The system shall support controlled sharing with:

- recipient;
- purpose;
- expiry;
- permissions;
- approval;
- audit.

## FR-017 Break-Glass

The system shall support emergency access with:

- reason;
- scope;
- duration;
- approval;
- alert;
- audit;
- automatic expiry.

## FR-018 Digital Signatures

The system shall support signing and verification through an approved
eSign/DSC integration.

## FR-019 Integrity Verification

The system shall calculate a fresh digest and compare it with the
registered digest.

Results:

- VERIFIED;
- MISMATCH;
- VERSION_NOT_FOUND;
- ANCHOR_UNAVAILABLE;
- SIGNATURE_INVALID where applicable.

## FR-020 Blockchain Anchor

The system shall asynchronously submit approved integrity/provenance
proofs to the Polygon trust layer.

The application must not fail a normal document operation solely because
blockchain anchoring is temporarily unavailable.

## FR-021 Blockchain Verification

The system shall retrieve the registered anchor and compare the expected
proof with the local evidence passport.

## FR-022 Audit Export

The system shall export a machine-readable and human-readable audit
package.

## FR-023 Retention

The system shall support:

- retention schedule;
- legal hold;
- expiry review;
- approved disposition;
- audit.

## FR-024 Integration

The system shall expose secure APIs for approved external systems.

------------------------------------------------------------------------

# 5. Security Requirements

## SR-001 Encryption in Transit

All protected network communications shall use modern secure transport.

## SR-002 Encryption at Rest

Sensitive document content shall be encrypted using authenticated
encryption such as AES-256-GCM or an approved equivalent.

## SR-003 Key Isolation

Encryption keys shall be managed outside application source code and
preferably through HSM/KMS in production.

## SR-004 Least Privilege

Every service account shall have only required permissions.

## SR-005 No Client Database Access

Clients shall never connect directly to PostgreSQL or protected object
storage for privileged operations.

## SR-006 Secure Logging

Logs shall not contain:

- document contents;
- access tokens;
- passwords;
- private keys;
- unnecessary PII.

## SR-007 Immutable Audit

Audit records shall be append-only and protected against unauthorized
alteration.

## SR-008 Privileged Access

Administrative actions shall require strong authentication and enhanced
auditing.

## SR-009 Session Security

Sessions shall support:

- timeout;
- revocation;
- secure cookie/token handling;
- CSRF protection where applicable.

## SR-010 Upload Security

The system shall defend against:

- malicious file uploads;
- path traversal;
- MIME confusion;
- zip bombs;
- oversized requests;
- parser exploitation.

## SR-011 API Security

APIs shall enforce:

- authentication;
- authorization;
- rate limits;
- input validation;
- output encoding;
- request-size limits;
- replay/idempotency controls where needed.

## SR-012 Supply Chain

Dependencies and container images shall be scanned and tracked through
SBOMs.

## SR-013 AI Security

AI processing shall use approved models and infrastructure. Confidential
data shall not be sent to an external model provider without explicit
authorization.

## SR-014 Blockchain Privacy

No confidential document content or direct PII shall be stored on a
public blockchain.

------------------------------------------------------------------------

# 6. Data Requirements

## 6.1 Case

``` text
case_id
external_reference
organization_id
classification
status
owner
created_at
updated_at
retention_policy_id
legal_hold
```

## 6.2 Document

``` text
document_id
case_id
document_type
classification
source_system
source_reference
current_version_id
created_at
created_by
status
retention_policy
```

## 6.3 Document Version

``` text
version_id
document_id
version_number
object_uri
content_hash
size
mime_type
created_at
created_by
parent_version
signature_state
verification_state
```

## 6.4 Custody Event

``` text
custody_event_id
document_version_id
from_actor
to_actor
purpose
timestamp
authorization_id
integrity_hash
acknowledgement
```

## 6.5 Audit Event

``` text
event_id
timestamp
actor
organization
action
resource
case_id
result
correlation_id
previous_event_hash
event_hash
```

## 6.6 Blockchain Anchor

``` text
anchor_id
document_version_id
content_hash
merkle_root
chain_id
contract_address
transaction_hash
block_reference
anchored_at
status
```

------------------------------------------------------------------------

# 7. API Requirements

## Authentication

``` text
POST /auth/session
POST /auth/refresh
POST /auth/logout
```

## Cases

``` text
POST /v1/cases
GET /v1/cases/{id}
PATCH /v1/cases/{id}
```

## Documents

``` text
POST /v1/documents
GET /v1/documents/{id}
GET /v1/documents/{id}/versions
POST /v1/documents/{id}/versions
POST /v1/documents/{id}/verify
```

## Custody

``` text
POST /v1/custody/transfers
GET /v1/documents/{id}/custody
```

## Sharing

``` text
POST /v1/shares
POST /v1/shares/{id}/approve
POST /v1/shares/{id}/revoke
```

## Search

``` text
GET /v1/search?q=
POST /v1/search/semantic
```

## Audit

``` text
GET /v1/audit
POST /v1/audit/export
```

## Blockchain

``` text
POST /v1/anchors
GET /v1/anchors/{id}
POST /v1/verify/blockchain
```

------------------------------------------------------------------------

# 8. Non-Functional Requirements

## NFR-001 Availability

Production target \>= 99.9%, subject to approved SLA.

## NFR-002 Scalability

Application services shall scale horizontally.

## NFR-003 Performance

Initial target:

- p95 API response \<= 500 ms for simple metadata operations;
- p95 metadata search \<= 2 s;
- p95 indexed search \<= 3 s;
- large file transfers excluded from API latency SLO.

## NFR-004 Reliability

Transient failures must be retried safely.

## NFR-005 Idempotency

Ingestion and integration operations must support idempotency keys.

## NFR-006 Maintainability

Services shall be modular and independently testable.

## NFR-007 Portability

Deployment shall be containerized and portable across approved
environments.

## NFR-008 Accessibility

Administrative and user interfaces should follow applicable government
accessibility requirements.

## NFR-009 Localization

Architecture shall support Indian-language metadata and OCR where
approved models are available.

## NFR-010 Auditability

Security-relevant operations shall be traceable end-to-end.

------------------------------------------------------------------------

# 9. State Machines

## Document

``` text
RECEIVED
  |
VALIDATED
  |
REGISTERED
  |
ACTIVE
  |
SUPERSEDED
  |
ARCHIVED
  |
DISPOSED
```

A DISPOSED object cannot be restored by an ordinary user.

## Share

``` text
REQUESTED
  |
APPROVED
  |
ACTIVE
  |
EXPIRED / REVOKED
```

## Verification

``` text
PENDING
  |
VERIFIED
  |
MISMATCH
  |
REVIEW_REQUIRED
```

------------------------------------------------------------------------

# 10. Error Handling

Standard error structure:

``` json
{
  "error_code": "AUTHZ_DENIED",
  "message": "Access denied",
  "correlation_id": "uuid",
  "timestamp": "ISO-8601"
}
```

Sensitive reasons should not be disclosed to unauthorized users.

------------------------------------------------------------------------

# 11. Audit Requirements

For every protected request:

``` text
Request
  |
Identity
  |
Policy decision
  |
Business action
  |
Audit event
  |
Correlation ID
```

Audit must cover both successful and denied operations.

------------------------------------------------------------------------

# 12. Backup / DR Requirements

- encrypted backups;
- tested restoration;
- documented RPO/RTO;
- isolated backup credentials;
- immutable/locked backup where available;
- periodic DR exercises.

------------------------------------------------------------------------

# 13. AI Requirements

AI model metadata shall include:

- model ID;
- model version;
- embedding version;
- inference timestamp;
- source document IDs;
- source version IDs.

AI output must be distinguishable from source evidence.

------------------------------------------------------------------------

# 14. Blockchain Requirements

The blockchain layer shall:

- use EVM-compatible smart contracts;
- support Polygon Amoy for test;
- support a future Polygon production topology;
- store hashes/proofs, not documents;
- support asynchronous anchoring;
- provide transaction references;
- support verification;
- protect blockchain signing keys through secure key management.

------------------------------------------------------------------------

# 15. Integration Requirements

External integrations must use:

- versioned API contracts;
- mutual authentication where required;
- schema validation;
- audit;
- correlation IDs;
- retry;
- idempotency;
- timeout;
- circuit breaking;
- dead-letter handling for asynchronous events.

------------------------------------------------------------------------

# 16. Security Acceptance Criteria

The system shall fail acceptance if:

- unauthorized user can retrieve a protected document;
- a protected document can be overwritten without version creation;
- source evidence can be modified without detection;
- sensitive data appears in logs;
- private blockchain keys are exposed;
- break-glass actions are not auditable;
- audit records can be silently modified;
- confidential document contents are written to public blockchain.

------------------------------------------------------------------------

# 17. Traceability

| Business Need    | SRS                            |
|------------------|--------------------------------|
| Confidentiality  | SR-001 to SR-014               |
| Integrity        | FR-006, FR-007, FR-019, FR-020 |
| Provenance       | FR-008, FR-009, FR-010         |
| Search           | FR-011 to FR-014               |
| Collaboration    | FR-016                         |
| Compliance       | FR-010, FR-023, FR-024         |
| Interoperability | FR-024                         |
| Enterprise scale | NFR-001 to NFR-010             |

------------------------------------------------------------------------

# 18. Assumptions

- Production identity provider will be government-approved.
- Production storage will be government-approved.
- Final retention schedules will be supplied by competent authority.
- Legal admissibility remains a matter for applicable law and competent
  authorities.
- Integration specifications for ICJS/e-Sakshya/e-Forensics will be
  obtained through authorized channels.
- SIH demo uses synthetic data.

------------------------------------------------------------------------

# 19. Open Decisions

1.  Final classification taxonomy.
2.  Exact identity/SSO integration.
3.  Government hosting environment.
4.  Exact object-storage platform.
5.  HSM/KMS provider.
6.  Exact Polygon production topology.
7.  Formal retention schedules.
8.  Legal-hold authority workflow.
9.  Court/evidence export format.
10. Government API contracts.
