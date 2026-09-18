# BRD.md — NYAYA-VAULT

## Business Requirements Document

**Business Owner Context:** Ministry of Home Affairs / NCRB  
**Problem Statement:** SIH26190  
**Purpose:** Business and operational requirements for a secure
legal/investigation document-management and provenance platform

------------------------------------------------------------------------

## 1. Business Context

SIH26190 describes a growing need for secure management of legal and
investigation documents across law-enforcement, legal, court and
investigative stakeholders.

The business issue is not simply “file storage”. The record moves
through a chain of institutional decisions. The organization must
therefore know:

- what document was received;
- from whom;
- when;
- under which case;
- under what authority;
- which version is authoritative;
- who accessed it;
- who transferred it;
- whether it was altered;
- whether a derived/redacted copy was created;
- whether the integrity of the retrieved object can be independently
  verified.

------------------------------------------------------------------------

## 2. Strategic Alignment

NYAYA-VAULT is designed around the direction already visible in India's
criminal-justice digitization:

- ICJS integrates major criminal-justice pillars;
- CCTNS supports police investigation and information workflows;
- e-Forensics supports forensic case registration/tracking;
- e-Prosecution supports prosecution workflows;
- e-Sakshya supports primary digital evidence capture and preservation;
- NAFIS supports fingerprint identification;
- C-DAC DEMS already addresses digital evidence management and chain of
  custody.

Therefore:

> NYAYA-VAULT should not compete with these systems on their primary
> functions. It should provide an interoperable document trust,
> provenance, access-control and verification layer that can connect to
> them.

------------------------------------------------------------------------

## 3. Business Objectives

### BO-01

Reduce fragmented handling of sensitive legal and investigation
documents.

### BO-02

Reduce unauthorized access and excessive data exposure.

### BO-03

Detect unauthorized document modification.

### BO-04

Create a reliable chain-of-custody record.

### BO-05

Reduce document retrieval time.

### BO-06

Improve controlled collaboration across authorized organizations.

### BO-07

Improve auditability and compliance evidence.

### BO-08

Preserve original evidence while enabling derived analysis and
redaction.

### BO-09

Support digital workflows introduced by India's new criminal-law
environment.

### BO-10

Provide an architecture that can integrate with existing national/state
systems.

------------------------------------------------------------------------

## 4. Stakeholders

| Stakeholder            | Interest                                                       |
|------------------------|----------------------------------------------------------------|
| MHA                    | governance, policy, national criminal-justice outcomes         |
| NCRB                   | national implementation/integration                            |
| State/UT Police        | investigation and document handling                            |
| Investigating Officers | rapid, controlled evidence access                              |
| Supervisors            | review, approval, oversight                                    |
| Forensic Labs          | evidence analysis and reporting                                |
| Prosecution            | controlled access to investigation records                     |
| Courts                 | reliable authorized document access                            |
| Legal Departments      | document lifecycle and compliance                              |
| Security/SOC           | security monitoring and incident response                      |
| Auditors               | independent auditability                                       |
| System Administrators  | operation and maintenance                                      |
| Records Officers       | retention and archival                                         |
| Citizens/Victims       | indirect benefit through faster and more accountable processes |

------------------------------------------------------------------------

## 5. Current-State Problems

### Fragmentation

Documents can be spread across paper files, file servers, applications
and organizational systems.

### Access ambiguity

A legitimate role does not necessarily imply legitimate access to every
case.

### Integrity ambiguity

A filename, database timestamp or folder history does not by itself
provide an independent cryptographic identity.

### Version ambiguity

Multiple copies can make it unclear which version was reviewed or
transferred.

### Audit burden

Reconstructing all document actions manually is slow.

### Collaboration friction

Inter-agency transfers can introduce duplicate copies and unclear
ownership.

### Sensitive-data exposure

Witness, victim, accused and investigative information may contain
highly sensitive personal data.

### Legacy integration

Existing systems cannot be replaced merely to introduce a new document
platform.

------------------------------------------------------------------------

## 6. Future-State Business Model

``` text
Existing Criminal Justice Systems
            |
            v
    Integration / Trust Boundary
            |
            v
       NYAYA-VAULT
            |
     +------+------+
     |             |
Document Trust   Access Trust
     |             |
     v             v
Provenance       Policy
Integrity        Authorization
Custody          Audit
     |
     v
Independent Verification
```

------------------------------------------------------------------------

## 7. Business Capabilities

### BC-01 Document Lifecycle

Create, ingest, classify, store, version, share, archive and dispose
according to policy.

### BC-02 Evidence Provenance

Track source, custody, versions, signatures and integrity.

### BC-03 Confidentiality

Limit access using organizational, case and sensitivity rules.

### BC-04 Search

Find documents through metadata, OCR, full-text and semantic search.

### BC-05 Controlled Collaboration

Allow authorized users to exchange records with explicit purpose and
duration.

### BC-06 Audit

Reconstruct who did what and when.

### BC-07 Verification

Allow an authorized party to verify that a retrieved file matches its
registered integrity fingerprint.

### BC-08 Privacy

Generate policy-compliant redacted copies without changing the source
record.

### BC-09 Integration

Exchange information with existing systems through governed interfaces.

------------------------------------------------------------------------

## 8. Business Requirements

| ID     | Requirement                                                    | Priority               |
|--------|----------------------------------------------------------------|------------------------|
| BR-001 | Centralize or federate access to legal/investigation documents | Must                   |
| BR-002 | Protect confidential documents from unauthorized access        | Must                   |
| BR-003 | Preserve original evidence object                              | Must                   |
| BR-004 | Maintain immutable document versions                           | Must                   |
| BR-005 | Maintain complete audit trail                                  | Must                   |
| BR-006 | Support cryptographic integrity verification                   | Must                   |
| BR-007 | Maintain chain of custody                                      | Must                   |
| BR-008 | Support case-based search                                      | Must                   |
| BR-009 | Support metadata/full-text search                              | Must                   |
| BR-010 | Support authorized collaboration                               | Must                   |
| BR-011 | Support role-based and attribute-based access                  | Must                   |
| BR-012 | Support MFA                                                    | Must                   |
| BR-013 | Support emergency/break-glass access                           | Should                 |
| BR-014 | Support dynamic redaction                                      | Should                 |
| BR-015 | Support digital signatures                                     | Should                 |
| BR-016 | Support blockchain anchoring                                   | Should / Theme-aligned |
| BR-017 | Support external system integration                            | Must                   |
| BR-018 | Support retention/legal hold                                   | Must                   |
| BR-019 | Support audit export                                           | Must                   |
| BR-020 | Support high availability and DR                               | Must for production    |

------------------------------------------------------------------------

## 9. Business Rules

### Rule BRULE-01

An original evidence object must never be silently overwritten.

### Rule BRULE-02

Every evidence version receives a unique immutable identifier.

### Rule BRULE-03

A custody transfer requires a recorded source, destination, purpose and
timestamp.

### Rule BRULE-04

Access must be denied unless identity, role and policy conditions are
satisfied.

### Rule BRULE-05

Break-glass access is exceptional and must be auditable.

### Rule BRULE-06

AI-generated information is derived information, not source evidence.

### Rule BRULE-07

Redaction produces a derived copy; the original remains protected.

### Rule BRULE-08

Blockchain records must not contain confidential document content.

### Rule BRULE-09

Retention and deletion must follow approved records-management and
legal-hold policy.

### Rule BRULE-10

System administrators must not automatically receive unrestricted access
to case content.

------------------------------------------------------------------------

## 10. Business Process — Document Intake

``` text
Document Source
   |
   v
Authorized Intake
   |
   v
Validation / Scan
   |
   v
Document ID + Hash
   |
   v
Encrypted Storage
   |
   v
Evidence Passport
   |
   v
Approval / Signature if required
   |
   v
Custody Registration
   |
   v
Authorized Case Use
```

------------------------------------------------------------------------

## 11. Business Process — Custody Transfer

``` text
Custodian A
   |
   | transfer request
   v
Authorization
   |
   v
Integrity Check
   |
   v
Custodian B
   |
   | acknowledgement
   v
Custody Record
   |
   v
Audit + Trust Anchor
```

------------------------------------------------------------------------

## 12. Business Process — Controlled Sharing

The system shall distinguish:

- view;
- download;
- copy/export;
- print;
- share;
- annotate;
- approve;
- sign;
- administer.

A recipient may have view access without download access.

------------------------------------------------------------------------

## 13. Business Process — Break Glass

Break-glass should be used only where ordinary policy prevents access
and a legitimate emergency exists.

The business record must contain:

- requester;
- case;
- reason;
- requested scope;
- approver;
- start;
- expiry;
- actions performed;
- review outcome.

------------------------------------------------------------------------

## 14. Business Process — Verification

An authorized verifier provides a document.

The system:

1.  calculates digest;
2.  retrieves registered digest;
3.  compares values;
4.  checks version identity;
5.  checks signature state;
6.  checks provenance;
7.  displays verification result.

The result is an integrity/provenance verification result, not a
judicial ruling.

------------------------------------------------------------------------

## 15. Data Classification

Proposed classification model:

| Level             | Example                                                                                      |
|-------------------|----------------------------------------------------------------------------------------------|
| PUBLIC            | approved public material                                                                     |
| INTERNAL          | routine administrative data                                                                  |
| RESTRICTED        | operational case records                                                                     |
| CONFIDENTIAL      | sensitive investigation/legal records                                                        |
| HIGHLY RESTRICTED | victim/witness sensitive data, protected intelligence or other specially controlled material |

Final classification taxonomy must be defined by the competent
government authority.

------------------------------------------------------------------------

## 16. Records Management

The platform must support:

- retention schedules;
- legal hold;
- preservation override;
- retention expiry review;
- authorized disposition;
- disposal approval;
- disposal audit;
- archival state;
- evidence preservation exceptions.

Deletion of evidence must never be a simple user action.

------------------------------------------------------------------------

## 17. Business Reporting

Required reports:

- case document inventory;
- access history;
- custody history;
- integrity verification;
- failed verification;
- break-glass activity;
- sharing history;
- signature status;
- retention status;
- legal holds;
- policy denials;
- administrative changes;
- security incidents;
- system availability.

------------------------------------------------------------------------

## 18. Business KPIs

### Operational

- document retrieval time;
- percentage of documents digitally indexed;
- average transfer processing time;
- search success rate.

### Security

- unauthorized access attempts;
- privileged-action coverage;
- break-glass frequency;
- failed integrity checks;
- key-management events.

### Governance

- audit completeness;
- policy compliance;
- retention compliance;
- unresolved access-review findings.

------------------------------------------------------------------------

## 19. Business Continuity

The service must support:

- backup;
- restoration;
- disaster recovery;
- continuity of access to critical case records;
- controlled degraded mode;
- incident response;
- evidence preservation during outages.

Blockchain anchoring may be asynchronous. The inability to reach the
blockchain must not destroy or block the core document-management
workflow.

------------------------------------------------------------------------

## 20. Procurement and Vendor-Neutrality Principle

The business specification shall describe capabilities and controls
rather than forcing a proprietary vendor.

Open interfaces and standards should be preferred:

- REST/OpenAPI;
- OAuth/OIDC where applicable;
- SAML where required by government SSO;
- standard cryptographic primitives;
- EVM-compatible smart contracts;
- containerized deployment;
- exportable audit data.

------------------------------------------------------------------------

## 21. Important Business Constraint

The solution is for a government criminal-justice environment. A
hackathon prototype must therefore use:

- synthetic records;
- controlled test data;
- approved public forensic datasets where legally suitable.

Real FIRs, witness statements, victim data, case files or operational
evidence must not be uploaded into an unapproved development
environment.

------------------------------------------------------------------------

## 22. Business Acceptance

The solution satisfies the business case when a representative
investigator can:

- find a case document;
- determine its current version;
- see its source and custody history;
- verify its integrity;
- share it with an authorized stakeholder;
- generate an approved redacted view;
- identify unauthorized access attempts;
- demonstrate an emergency-access trail;
- produce an audit/verification package;
- show integration points with existing government systems.

------------------------------------------------------------------------

## 23. Strategic Differentiation

The product is differentiated by **integration and trust architecture**,
not by claiming that document management or blockchain evidence systems
are themselves new.

The proposition is:

> “NYAYA-VAULT provides a verifiable document-trust and provenance layer
> for the existing criminal-justice ecosystem.”

This avoids claiming that ICJS, DEMS or e-Sakshya do not exist.

------------------------------------------------------------------------

## 24. Business Risks

| Risk                                                          | Impact      | Response                                      |
|---------------------------------------------------------------|-------------|-----------------------------------------------|
| Existing government systems already perform related functions | High        | Integrate, do not replace                     |
| Duplicate data stores                                         | High        | Federation/API strategy                       |
| Sensitive data exposure                                       | Critical    | Zero-trust + encryption + data minimization   |
| Insider misuse                                                | Critical    | ABAC + SoD + audit                            |
| Poor adoption                                                 | High        | Role-specific workflows + training            |
| Legal uncertainty                                             | High        | Verification support, not legal determination |
| AI trust                                                      | Medium/High | human-in-loop                                 |
| Legacy integration                                            | High        | adapter architecture                          |
| Operational complexity                                        | High        | modular deployment and runbooks               |

------------------------------------------------------------------------

## 25. Final Business Position

NYAYA-VAULT should be presented as **government infrastructure**, not a
consumer DMS.

The value proposition is:

**Integrity + Provenance + Confidentiality + Interoperability +
Accountability.**
