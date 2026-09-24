# PRD.md — Proof Vault

## Secure Digital Document & Evidence Provenance Platform for Legal and Investigation Records

**Project:** Digital Evidence Platform 2026 — Proof Vault Project  
**Problem Statement:** Secure Digital Document Management System for
Legal and Investigation Documents  
**Sponsor / Department:** Ministry of Home Affairs / National Crime
Records Bureau (NCRB), Women Safety Division  
**Product Working Name:** Proof Vault  
**Document Status:** Draft — SIH 2026 / Government Enterprise
Architecture Concept  
**Security Posture:** Security-sensitive / confidential-data capable;
production classification and accreditation to be determined by the
competent government authority  
**Target Environment:** Government-controlled infrastructure, with
approved Indian government cloud/data-centre/on-premise deployment for
production  
**Primary Design Principle:** Integrate with and strengthen the existing
criminal-justice ecosystem; do not duplicate or replace ICJS, CCTNS,
e-Forensics, e-Prosecution, e-Sakshya, NAFIS or C-DAC DEMS.

------------------------------------------------------------------------

## 1. Executive Summary

Proof Vault Project asks for a secure, scalable and intelligent digital document
management system for legal and investigation documents. The statement
identifies fragmented records, difficult retrieval, unauthorized access,
tampering risk, weak version control, inefficient collaboration, delays,
and poor auditability/compliance as the core problem.

The proposed product is **Proof Vault**, an enterprise
document-and-provenance platform designed as a **trust layer around
India's existing criminal-justice digital ecosystem**.

Proof Vault does not attempt to become a replacement for ICJS or an
alternative national evidence-collection system. Instead, it provides a
controlled document lifecycle and evidence-provenance layer that can:

- centralize or federate access to sensitive legal/investigation
  documents;
- preserve the original document and every approved version;
- generate cryptographic fingerprints for integrity verification;
- maintain a complete chain-of-custody and audit history;
- enforce fine-grained role-, case-, organization-, sensitivity- and
  purpose-based access;
- support digital signatures and approval workflows;
- provide full-text, metadata and semantic retrieval;
- automatically detect and redact sensitive PII for permitted views;
- provide controlled inter-agency sharing;
- anchor cryptographic proofs to a Polygon-based trust network without
  placing confidential documents on-chain;
- expose verification APIs for authorized downstream systems;
- integrate with ICJS and related systems through governed
  APIs/adapters.

The central product concept is the **Evidence Passport**: a
machine-readable provenance record associated with a document and its
versions. It records what the document is, where it came from, its
integrity fingerprint, version history, custody transitions, signatures,
access decisions and verification status.

------------------------------------------------------------------------

## 2. Research Basis and Strategic Context

The SIH statement is corroborated by multiple published copies of the
2026 problem-statement dataset. The uploaded SIH sample deck supplied
for this project states:

- fragmented records;
- tampering risk;
- over-permission;
- slow retrieval;
- weak provenance;
- secure encrypted storage;
- Evidence Passport;
- AI case intelligence;
- zero-trust access;
- dynamic PII redaction;
- tamper-evident ledger;
- break-glass access.

The uploaded deck also originally proposed PostgreSQL, pgvector,
MinIO/S3-compatible storage, Keycloak, OCR, local LLMs and Hyperledger
Fabric. The blockchain choice is intentionally revised in this project
to **Polygon**, while preserving the off-chain evidence-storage model.

### Existing government ecosystem that Proof Vault must complement

1.  **ICJS** already integrates Police/CCTNS, Courts/e-Courts,
    Prisons/e-Prisons, Forensics/e-Forensics and
    Prosecution/e-Prosecution.
2.  **CCTNS** already provides a national police
    information/investigation platform.
3.  **e-Sakshya** already supports capture, storage and retrieval of
    primary digital evidence, including videography, photography and
    witness statements.
4.  **NAFIS** already provides a centralized fingerprint repository.
5.  **C-DAC DEMS** already provides digital evidence management, chain
    of custody, authorization, search and lifecycle functions.
6.  Government digital architecture references such as **InDEA** and
    **MeghRaj/GI Cloud** support federated integration, APIs and
    government cloud deployment.
7.  CERT-In has published dedicated government-entity
    information-security and secure-application lifecycle guidance.
8.  The Bharatiya Sakshya Adhiniyam, 2023 gives electronic/digital
    records legal effect subject to its evidentiary provisions.

Therefore, the product must be positioned as **interoperable
trust/provenance infrastructure**, not merely “another DMS”.

------------------------------------------------------------------------

## 3. Problem Statement

### 3.1 Business problem

Legal and investigation records cross organizational boundaries and
change state over time. A document may be:

- created by an investigating officer;
- reviewed by a supervisor;
- transferred to a forensic unit;
- supplemented with a report;
- presented to prosecution;
- supplied to a court;
- accessed for audit or appeal.

The system must therefore prove not only **where the document is**, but
also:

> **Which exact version existed, who handled it, under what authority,
> what happened to it, and whether the retrieved content is identical to
> the recorded evidence object?**

### 3.2 Primary pain points

| Problem                 | Product response                                                                             |
|-------------------------|----------------------------------------------------------------------------------------------|
| Fragmented records      | Case-centric document vault and integration adapters                                         |
| Unauthorized access     | Zero-trust IAM + RBAC/ABAC + MFA + policy engine                                             |
| Tampering               | SHA-256/SHA-3 configurable fingerprinting + immutable evidence versioning + ledger anchoring |
| Weak provenance         | Evidence Passport + chain-of-custody events                                                  |
| Poor version control    | Immutable versions with explicit supersession                                                |
| Slow retrieval          | Metadata + OCR + full-text + semantic search                                                 |
| Excessive data exposure | Need-to-know access and purpose/sensitivity policies                                         |
| PII exposure            | Dynamic redaction and controlled-view generation                                             |
| Insider misuse          | separation of duties + immutable audit + anomaly detection hooks                             |
| Inter-agency sharing    | governed sharing workflow, expiry, watermarking and revocation                               |
| Emergency access        | Break-glass workflow with reason, approval/dual control where required, expiry and alerting  |
| Legacy integration      | API gateway + adapters + canonical document model                                            |
| Audit difficulty        | append-only audit log + ledger anchoring + exportable audit package                          |

------------------------------------------------------------------------

## 4. Product Vision

**“Every sensitive legal or investigation document should have a
verifiable identity, controlled lifecycle and independently checkable
provenance.”**

Proof Vault should make document integrity and access accountability
**system properties**, not manual responsibilities.

------------------------------------------------------------------------

## 5. Product Goals

### G1 — Confidentiality

Ensure that sensitive legal/investigation documents are visible only to
authorized subjects under explicit policy.

### G2 — Integrity

Make unauthorized alteration detectable and preserve the original
evidence object and version lineage.

### G3 — Provenance

Maintain a complete, queryable and exportable history of custody,
processing, signatures and authorized transformations.

### G4 — Interoperability

Integrate with existing government criminal-justice systems instead of
creating another isolated silo.

### G5 — Retrieval

Allow investigators and authorized legal stakeholders to find relevant
documents rapidly using metadata, OCR, full-text and semantic search.

### G6 — Accountability

Record every security-relevant document action and make audit records
resistant to silent alteration.

### G7 — Evidentiary Support

Provide verifiable integrity and provenance records that can be included
in an evidentiary/audit package. The system must not itself make a legal
admissibility determination.

### G8 — Enterprise Scalability

Support multi-organization deployments, high document volume, high
availability, disaster recovery and controlled regional/data-domain
partitioning.

------------------------------------------------------------------------

## 6. Non-Goals

Proof Vault is not intended to:

- replace ICJS;
- replace CCTNS;
- replace e-Sakshya;
- replace e-Forensics;
- replace e-Prosecution;
- replace NAFIS;
- become a national biometric repository;
- become the authoritative court case-management system;
- perform autonomous legal decision-making;
- autonomously determine guilt, innocence or evidentiary admissibility;
- store confidential document contents on a public blockchain;
- allow AI to modify source evidence;
- use public consumer cloud storage as the production system for
  sensitive government records without formal approval;
- expose case identifiers, victim identities or document metadata
  publicly.

------------------------------------------------------------------------

## 7. Target Users

### Primary users

- Investigating Officer (IO)
- Station/Unit Officer
- Investigation Supervisor
- Evidence Custodian
- Forensic Analyst
- Prosecutor / Prosecution Officer
- Court Liaison / Authorized Court User
- Legal Officer
- Records Officer
- Security Officer
- System Administrator
- Compliance/Audit Officer

### External/integration actors

- ICJS/CCTNS adapters
- e-Forensics
- e-Prosecution
- e-Sakshya
- authorized court systems
- authorized forensic laboratories
- government identity/SSO systems
- approved digital-signature/eSign services
- approved SOC/SIEM

------------------------------------------------------------------------

## 8. Core Product Modules

### M1. Case Workspace

- case creation/reference;
- organizational ownership;
- classification/sensitivity;
- lifecycle status;
- linked persons/entities;
- document index;
- workflow status;
- retention schedule.

### M2. Secure Document Vault

- encrypted object storage;
- original-file preservation;
- immutable versioning;
- metadata;
- malware scanning;
- content-type validation;
- retention and legal hold;
- object-lock/WORM capability where supported.

### M3. Evidence Passport

A structured provenance object containing:

- evidence/document ID;
- case ID;
- document type;
- source system;
- source reference;
- version number;
- SHA-256 digest;
- optional secondary digest;
- creation/ingestion timestamp;
- uploader/actor reference;
- organization;
- custody events;
- signatures;
- classification;
- retention state;
- verification status;
- blockchain anchor reference;
- parent/superseded version.

### M4. Chain of Custody

Each transfer records:

- from actor/organization;
- to actor/organization;
- timestamp;
- purpose;
- authorization;
- transfer channel;
- integrity check;
- receiving acknowledgement;
- resulting hash;
- related workflow event.

### M5. Identity and Access

- enterprise SSO;
- MFA;
- RBAC;
- ABAC;
- case membership;
- organization boundary;
- sensitivity label;
- purpose-of-use;
- device/session conditions;
- time/location/network constraints where policy requires;
- privileged access management.

### M6. Controlled Sharing

- internal sharing;
- inter-agency sharing;
- court/prosecution sharing;
- time-bound access;
- watermarking;
- view/download restrictions;
- recipient acknowledgement;
- automatic expiry;
- revocation where technically possible;
- sharing audit.

### M7. Search and Intelligence

- metadata search;
- OCR;
- full-text search;
- semantic search;
- related-document discovery;
- document/entity relationship graph;
- duplicate/similarity detection.

### M8. Privacy and Redaction

- PII detection;
- configurable sensitive-field policies;
- dynamic redaction;
- redaction preview;
- human approval;
- redaction audit;
- original remains preserved separately.

### M9. Digital Signature

- document signing;
- approval signing;
- signature verification;
- certificate/reference storage;
- signing workflow;
- integration-ready eSign/DSC adapter.

### M10. Trust Ledger

- hash anchoring;
- provenance events;
- document/version registration;
- verification event;
- custody-transfer event;
- optional Merkle batching;
- Polygon integration.

### M11. Audit and Compliance

- immutable audit stream;
- security events;
- administrative events;
- data-access events;
- policy-decision events;
- ledger-anchor events;
- audit export package;
- SIEM integration.

### M12. Administration

- organizations;
- roles;
- policy definitions;
- retention rules;
- classification rules;
- integration credentials;
- key lifecycle;
- audit access;
- system health.

------------------------------------------------------------------------

## 9. Evidence Passport Lifecycle

``` text
SOURCE / INGESTION
       |
       v
Document Received
       |
       +--> Validate MIME / malware / metadata
       |
       v
Generate Document ID
       |
       v
Calculate Cryptographic Digest
       |
       v
Encrypt + Store Original
       |
       v
Create Evidence Passport
       |
       v
Digital Signature / Approval (if required)
       |
       v
Record Custody Event
       |
       v
Anchor Trust Proof
       |
       v
Authorized Use / Sharing / Analysis
       |
       +--> Every action creates an audit event
       |
       v
Version / Supersession / Retention / Legal Hold
       |
       v
Final Retention / Disposal according to approved policy
```

------------------------------------------------------------------------

## 10. Security Product Principles

1.  Zero trust by default.
2.  Least privilege.
3.  Need-to-know access.
4.  Separation of duties.
5.  No direct database access from clients.
6.  No raw document storage on blockchain.
7.  No PII on public blockchain.
8.  Encryption in transit and at rest.
9.  Key management separated from application data.
10. Immutable source evidence; derived/redacted copies are separate
    objects.
11. Every privileged action is auditable.
12. Break-glass access is exceptional, time-bound and highly visible.
13. AI is assistive, never authoritative over source evidence.
14. Security controls are built into the SDLC.

------------------------------------------------------------------------

## 11. Success Metrics

### Security

- 100% of protected document objects encrypted at rest.
- 100% of protected APIs authenticated and authorized.
- 100% of document lifecycle actions auditable.
- 0 plaintext sensitive documents in application logs.
- 0 confidential document contents committed to blockchain.

### Integrity

- 100% of evidence versions have a cryptographic digest.
- 100% of custody transitions produce signed/audited events.
- Tampered demo object detected with deterministic verification.

### Retrieval

- p95 metadata search target: \<= 2 seconds under agreed test load.
- p95 indexed full-text search target: \<= 3 seconds under agreed test
  load.
- Semantic retrieval target to be benchmarked against an approved
  synthetic dataset.

### Availability

- Production target: \>= 99.9% monthly service availability, excluding
  approved maintenance.
- RPO/RTO to be finalized by deployment tier.

### Governance

- Every break-glass access produces a security alert.
- Every privileged role change is logged.
- Audit exports are independently verifiable.

------------------------------------------------------------------------

## 12. MVP vs Enterprise Roadmap

### SIH MVP

- Case workspace
- Secure upload
- SHA-256 integrity
- Versioning
- Evidence Passport
- RBAC/ABAC demonstration
- audit trail
- OCR
- full-text/semantic search
- redaction
- controlled sharing
- Polygon Amoy testnet anchor
- verification screen
- synthetic evidence dataset

### Pilot

- government SSO adapter
- HSM/KMS
- enterprise object storage
- SIEM integration
- ICJS-compatible API adapter
- e-Sakshya/e-Forensics integration proof-of-concept
- disaster recovery
- security audit
- performance testing
- operational dashboards

### Production

- government-approved hosting
- high availability
- multi-zone/multi-site DR
- enterprise PKI
- HSM-backed keys
- permissioned Polygon-based trust network or equivalent approved ledger
- formal security certification/audit
- data retention/legal hold governance
- SOC integration
- operational runbooks
- change-management and release governance.

------------------------------------------------------------------------

## 13. Important Architecture Decision

### Why Polygon?

The project direction replaces Hyperledger Fabric with Polygon.

However, **public Polygon PoS is not the production confidentiality
boundary**.

Recommended deployment model:

- SIH demonstration: Polygon Amoy.
- Non-sensitive public verification prototype: Polygon PoS only where
  approved.
- Government production: a permissioned/sovereign Polygon-based
  architecture such as a Polygon CDK-based institutional chain, subject
  to government architecture, security and procurement approval.

The blockchain stores only cryptographic proofs and non-sensitive
references. The document remains in government-controlled storage.

------------------------------------------------------------------------

## 14. Risks

| Risk                   | Product mitigation                                                |
|------------------------|-------------------------------------------------------------------|
| Existing DEMS overlaps | Position as interoperable trust/provenance layer                  |
| Existing ICJS overlaps | API-first integration; no replacement claim                       |
| Public-chain privacy   | No document/PII on public chain                                   |
| AI hallucination       | Human review + source citations + no source modification          |
| Insider abuse          | ABAC + SoD + privileged audit + break-glass                       |
| Key compromise         | HSM/KMS + rotation + separation of duties                         |
| Legacy integration     | Adapter pattern + canonical model                                 |
| Poor connectivity      | Store-and-forward encrypted edge capability where approved        |
| Legal overclaim        | Evidence verification, not legal admissibility engine             |
| Vendor lock-in         | Open standards, containerization, REST/OpenAPI, EVM compatibility |
| Data leakage           | DLP, logging controls, encryption, private network                |
| Blockchain outage      | Core DMS continues; anchoring is asynchronous and retryable       |

------------------------------------------------------------------------

## 15. Acceptance Definition

The product is considered functionally complete for the SIH MVP when an
evaluator can:

1.  create a synthetic case;
2.  upload a synthetic legal/investigation document;
3.  see encryption/storage metadata;
4.  view its Evidence Passport;
5.  verify the SHA-256 digest;
6.  create a second immutable version;
7.  transfer custody to another role;
8.  observe the full audit trail;
9.  search the document using OCR/full text;
10. produce a redacted authorized view;
11. share the document with an authorized role;
12. attempt an unauthorized access and observe denial/audit;
13. invoke a controlled break-glass workflow;
14. anchor the digest on Polygon Amoy;
15. modify a copy and demonstrate integrity failure;
16. export a verification/audit package.

------------------------------------------------------------------------

## 16. Research References

- Ministry of Home Affairs — ICJS
- Ministry of Home Affairs — CCTNS
- Ministry of Home Affairs / PIB — e-Sakshya
- C-DAC — Digital Evidence Management System (DEMS)
- India Code — Bharatiya Sakshya Adhiniyam, 2023
- CERT-In — Guidelines on Information Security Practices for Government
  Entities
- CERT-In — Guidelines for Secure Application Design, Development,
  Implementation & Operations
- MeitY — InDEA 2.0
- MeitY — GI Cloud / MeghRaj
- NIST IR 8387 — Digital Evidence Preservation
- NIST Chain of Custody glossary
- Polygon — Polygon PoS / Amoy developer documentation
- Polygon — Polygon CDK / institutional privacy architecture

------------------------------------------------------------------------

## 17. Source Integrity Note

The supplied SIH sample deck contains the working Proof Vault concept
and original Hyperledger-based stack. It is a team working artifact, not
itself the government system specification.

The publicly mirrored Proof Vault Project statement contains an apparent
inconsistency: the main body describes a legal/investigation DMS, while
the final “Expected Solution” line in several mirrors refers to
monitoring and managing police assets through their lifecycle. This
conflict must be verified against the official SIH portal before
treating the stray asset-management sentence as a requirement. This PRD
is based on the main Proof Vault Project body and title because those sections
consistently describe the legal/investigation document-management
problem.
