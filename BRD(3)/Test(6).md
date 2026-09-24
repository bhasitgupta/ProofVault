# Test.md — Proof Vault

## Test Strategy, Test Plan & Acceptance Suite

**System:** Proof Vault  
**SIH:** Proof Vault Project  
**Target:** Government Enterprise / Security-Sensitive  
**Test Data:** Synthetic and authorized non-sensitive datasets only

------------------------------------------------------------------------

# 1. Test Objectives

The test program shall demonstrate:

- confidentiality;
- integrity;
- provenance;
- authorization;
- auditability;
- resilience;
- interoperability;
- performance;
- AI safety;
- blockchain verification;
- disaster recovery readiness.

------------------------------------------------------------------------

# 2. Test Levels

1.  Unit testing
2.  Component testing
3.  API testing
4.  Integration testing
5.  End-to-end testing
6.  Security testing
7.  Performance testing
8.  Resilience testing
9.  AI evaluation
10. Blockchain verification testing
11. Disaster-recovery testing
12. User acceptance testing

------------------------------------------------------------------------

# 3. Test Environment

### MVP

``` text
Docker/Kubernetes
PostgreSQL
Object Store
OpenSearch/pgvector
Keycloak
FastAPI
Next.js
Polygon Amoy
Synthetic Documents
```

### Production-like

- government-approved network segmentation;
- HSM/KMS;
- SIEM;
- WAF;
- HA database;
- redundant object storage;
- private blockchain environment.

------------------------------------------------------------------------

# 4. Test Data Policy

Never use:

- real FIRs;
- real victim/witness records;
- real case files;
- real operational evidence;
- real credentials;
- real private keys.

Use:

- synthetic FIRs;
- synthetic witness statements;
- synthetic charge sheets;
- synthetic forensic reports;
- synthetic court documents;
- controlled dummy PII;
- NIST/reference datasets where legally appropriate.

------------------------------------------------------------------------

# 5. Functional Test Cases

## TC-FUNC-001 Login Success

**Precondition:** Valid test user exists.

**Steps:**

1.  Open login.
2.  Enter valid credentials.
3.  Complete MFA.
4.  Submit.

**Expected:** Session created and login event recorded.

------------------------------------------------------------------------

## TC-FUNC-002 Login Failure

**Steps:**

1.  Enter invalid credentials.
2.  Submit.

**Expected:**

- access denied;
- failure logged;
- no sensitive authentication information disclosed.

------------------------------------------------------------------------

## TC-FUNC-003 Case Creation

**Steps:**

1.  Authorized investigator creates case.
2.  Enter required metadata.
3.  Save.

**Expected:**

- case ID generated;
- audit event recorded.

------------------------------------------------------------------------

## TC-FUNC-004 Document Upload

**Steps:**

1.  Open authorized case.
2.  Upload PDF.
3.  Submit.

**Expected:**

- file scanned;
- hash generated;
- original stored;
- version 1 created;
- Evidence Passport created;
- audit event created.

------------------------------------------------------------------------

## TC-FUNC-005 Unsupported File

**Steps:**

1.  Upload blocked file type.

**Expected:** Rejected before evidence registration.

------------------------------------------------------------------------

## TC-FUNC-006 Malware File

**Steps:**

1.  Submit a safe test malware-signature file such as the EICAR test
    file in an isolated test environment.

**Expected:**

- upload rejected/quarantined;
- security event logged;
- original malicious object not exposed to users.

------------------------------------------------------------------------

## TC-FUNC-007 Version Creation

**Steps:**

1.  Upload version 2.
2.  Provide reason.

**Expected:**

- version 1 remains unchanged;
- version 2 has a new hash;
- parent relationship exists;
- audit event recorded.

------------------------------------------------------------------------

## TC-FUNC-008 Integrity Verification — Pass

**Steps:**

1.  Retrieve stored document.
2.  Calculate hash.
3.  Compare.

**Expected:** VERIFIED.

------------------------------------------------------------------------

## TC-FUNC-009 Integrity Verification — Fail

**Steps:**

1.  Modify a test copy by one byte.
2.  Calculate hash.
3.  Compare against registered hash.

**Expected:** MISMATCH / INTEGRITY VIOLATION.

------------------------------------------------------------------------

## TC-FUNC-010 Custody Transfer

**Steps:**

1.  Investigator initiates transfer.
2.  Custodian receives.
3.  Custodian acknowledges.

**Expected:**

- custody event recorded;
- actors recorded;
- timestamp recorded;
- integrity status recorded.

------------------------------------------------------------------------

## TC-FUNC-011 Unauthorized Access

**Steps:**

1.  User without case membership requests document.

**Expected:**

- 403/controlled denial;
- access not revealed;
- security event recorded.

------------------------------------------------------------------------

## TC-FUNC-012 ABAC Denial

**Scenario:** User has correct role but wrong
organization/case/sensitivity.

**Expected:** Denied.

------------------------------------------------------------------------

## TC-FUNC-013 Time-Bound Share

**Steps:**

1.  Create share with expiry.
2.  Recipient accesses before expiry.
3.  Wait/advance test clock.
4.  Access after expiry.

**Expected:**

- first access allowed;
- later access denied;
- expiry logged.

------------------------------------------------------------------------

## TC-FUNC-014 Share Revocation

**Expected:** Revoked recipient cannot access future requests.

------------------------------------------------------------------------

## TC-FUNC-015 Break-Glass

**Steps:**

1.  Request emergency access.
2.  Enter mandatory reason.
3.  Approve according to policy.
4.  Access record.
5.  Wait for expiry.

**Expected:**

- access granted only for scope/duration;
- alert created;
- every action logged;
- access expires automatically.

------------------------------------------------------------------------

## TC-FUNC-016 Redaction

**Steps:**

1.  Submit synthetic document containing names, phone numbers and
    addresses.
2.  Run PII detector.
3.  Create redacted view.

**Expected:**

- configured PII masked;
- original unchanged;
- derived object receives a new ID/hash;
- redaction event recorded.

------------------------------------------------------------------------

## TC-FUNC-017 Search

**Steps:**

1.  Upload indexed documents.
2.  Search by case ID.
3.  Search full text.
4.  Search semantic concept.

**Expected:** Only authorized documents are returned.

------------------------------------------------------------------------

## TC-FUNC-018 Search Authorization

A user must not discover a document through search if they are not
authorized to access it.

------------------------------------------------------------------------

## TC-FUNC-019 Digital Signature

**Expected:**

- authorized signer can sign;
- signature metadata recorded;
- verification succeeds;
- invalidated/modified content fails verification.

------------------------------------------------------------------------

## TC-FUNC-020 Audit Export

**Expected:**

- selected document/case events exported;
- export itself is audited;
- export contains integrity-verification metadata.

------------------------------------------------------------------------

# 6. Blockchain Test Cases

## TC-CHAIN-001 Anchor Creation

**Steps:**

1.  Register document.
2.  Generate hash.
3.  Submit anchor.

**Expected:** Polygon transaction reference stored.

------------------------------------------------------------------------

## TC-CHAIN-002 Anchor Verification

**Expected:** Local document hash matches anchored proof.

------------------------------------------------------------------------

## TC-CHAIN-003 Tampered Document

**Expected:** Local hash mismatch even if original anchor remains
unchanged.

------------------------------------------------------------------------

## TC-CHAIN-004 Blockchain Outage

**Steps:**

1.  Disable RPC.
2.  Register document.

**Expected:**

- document workflow succeeds;
- anchor status = PENDING/RETRY;
- retry queue created;
- no data loss.

------------------------------------------------------------------------

## TC-CHAIN-005 No Sensitive On-Chain Data

Inspect transaction payload.

**Expected:** No document bytes, victim/witness PII or case narrative
present.

------------------------------------------------------------------------

## TC-CHAIN-006 Duplicate Submission

Repeat the same anchor request.

**Expected:** Idempotent behavior; no inconsistent duplicate evidence
state.

------------------------------------------------------------------------

# 7. Security Tests

## TC-SEC-001 Broken Access Control

Attempt horizontal privilege escalation.

**Expected:** Denied.

## TC-SEC-002 Vertical Privilege Escalation

Normal user attempts admin endpoint.

**Expected:** Denied.

## TC-SEC-003 IDOR

Change document ID in API request.

**Expected:** Access denied unless policy permits.

## TC-SEC-004 SQL Injection

Test all user-controlled query parameters.

**Expected:** No injection.

## TC-SEC-005 XSS

Submit script payload in metadata.

**Expected:** Safely encoded/rejected.

## TC-SEC-006 Path Traversal

Submit filenames such as:

``` text
../../secret
```

**Expected:** Rejected/safely normalized.

## TC-SEC-007 Token Replay

Reuse expired/revoked token.

**Expected:** Denied.

## TC-SEC-008 CSRF

Test state-changing browser endpoints.

**Expected:** CSRF protections operate as designed.

## TC-SEC-009 File Parser Attack

Test malformed PDF/image/archive files.

**Expected:** Application remains stable; malicious input isolated.

## TC-SEC-010 Secret Exposure

Scan repository, images and logs.

**Expected:** No passwords, tokens, private keys or production secrets.

------------------------------------------------------------------------

# 8. Cryptography Tests

## TC-CRYPTO-001 Hash Determinism

Same bytes produce same hash.

## TC-CRYPTO-002 Hash Sensitivity

One-byte modification changes hash.

## TC-CRYPTO-003 Encryption Confidentiality

Encrypted object cannot be read without authorized key.

## TC-CRYPTO-004 Key Rotation

New objects use new key material according to policy.

## TC-CRYPTO-005 Signature Verification

Valid signature verifies; modified content fails.

------------------------------------------------------------------------

# 9. AI Tests

## TC-AI-001 OCR Accuracy

Benchmark OCR against labeled synthetic documents.

Metrics:

- character error rate;
- word error rate;
- field extraction accuracy.

## TC-AI-002 PII Detection

Measure:

- precision;
- recall;
- false positives;
- false negatives.

## TC-AI-003 Search Relevance

Use labeled queries and calculate:

- Precision@K;
- Recall@K;
- MRR where appropriate.

## TC-AI-004 Hallucination Guard

Ask the system a question unsupported by source documents.

**Expected:** It states insufficient evidence rather than fabricating an
answer.

## TC-AI-005 Source Attribution

Generated response must identify supporting document/version references.

## TC-AI-006 Prompt Injection

Place malicious instructions inside a document.

**Expected:** Document content cannot override system authorization
policies.

## TC-AI-007 No Source Mutation

AI processing must never alter original evidence.

------------------------------------------------------------------------

# 10. Performance Tests

## PT-001 API Load

Target baseline:

- 100 requests/sec for selected stateless endpoints in the test
  environment.

Measure:

- p50;
- p95;
- p99;
- error rate.

## PT-002 Search Load

Measure search latency at representative index size.

## PT-003 Upload Load

Measure:

- throughput;
- CPU;
- memory;
- storage;
- queue latency.

## PT-004 OCR Queue

Measure processing time for:

- 1-page PDF;
- 10-page PDF;
- 100-page PDF.

## PT-005 Blockchain Queue

Measure asynchronous anchor throughput and retry behavior.

------------------------------------------------------------------------

# 11. Resilience Tests

## RT-001 Database Failure

Expected: controlled failure/recovery with no silent evidence
corruption.

## RT-002 Object Storage Failure

Expected: document service returns controlled error; metadata remains
consistent.

## RT-003 Search Failure

Expected: core document access remains available; search reports
degraded state.

## RT-004 Blockchain Failure

Expected: core evidence operations continue.

## RT-005 Identity Provider Failure

Expected: behavior follows approved availability/fail-closed policy.

------------------------------------------------------------------------

# 12. Disaster Recovery Tests

Verify:

- backup integrity;
- restoration;
- database recovery;
- object recovery;
- audit recovery;
- key recovery procedure;
- application redeployment;
- DNS/network recovery;
- blockchain configuration recovery.

Record actual RPO/RTO.

------------------------------------------------------------------------

# 13. Audit Tests

Verify every action produces expected audit records.

Minimum audit coverage:

- authentication;
- authorization denial;
- upload;
- download;
- view;
- version;
- share;
- revoke;
- verify;
- sign;
- break-glass;
- policy change;
- role change;
- admin action;
- blockchain anchor.

Test that an audit event cannot be silently modified.

------------------------------------------------------------------------

# 14. Privacy Tests

Verify:

- PII is not present in application logs;
- PII is not present in public blockchain payloads;
- unauthorized search does not leak document existence;
- redacted copies cannot expose masked content;
- exports respect policy;
- AI requests do not leave approved processing boundaries.

------------------------------------------------------------------------

# 15. Compliance-Oriented Tests

The implementation shall be reviewed against:

- applicable government security requirements;
- CERT-In information-security guidance;
- CERT-In secure application-development guidance;
- applicable data-protection requirements;
- applicable evidentiary/legal requirements;
- government hosting/data-residency requirements.

A successful functional test does not constitute government security
accreditation or legal certification.

------------------------------------------------------------------------

# 16. UAT Scenarios

## UAT-001 Investigator

Create case → upload FIR → search → verify → share with forensic unit.

## UAT-002 Forensic Analyst

Receive evidence → verify integrity → add report → transfer to
prosecution.

## UAT-003 Prosecutor

Receive authorized case documents → search → verify → export approved
bundle.

## UAT-004 Auditor

Select case → reconstruct document lifecycle → inspect access history →
verify anchor.

## UAT-005 Security Officer

Review failed access → break-glass event → privilege change → SIEM
alert.

------------------------------------------------------------------------

# 17. Evidence Verification Demo

The SIH final demonstration should show:

``` text
1. Upload original
        ↓
2. Hash generated
        ↓
3. Evidence Passport
        ↓
4. Polygon anchor
        ↓
5. Custody transfer
        ↓
6. Authorized access
        ↓
7. Tamper a copy
        ↓
8. Verify
        ↓
9. INTEGRITY VIOLATION
```

This is more persuasive than simply showing a blockchain transaction.

------------------------------------------------------------------------

# 18. Acceptance Gates

### Gate 1 — Functional

All Must requirements pass.

### Gate 2 — Security

No critical/high exploitable vulnerability remains open without approved
risk acceptance.

### Gate 3 — Integrity

Tampering is detected deterministically.

### Gate 4 — Authorization

Unauthorized access paths are denied.

### Gate 5 — Audit

Every security-sensitive action is reconstructable.

### Gate 6 — Privacy

No confidential document content is placed on a public blockchain.

### Gate 7 — AI Safety

AI cannot mutate source evidence or bypass authorization.

### Gate 8 — Recovery

Backup and restoration are demonstrated.

------------------------------------------------------------------------

# 19. Defect Severity

| Severity    | Definition                                  |
|-------------|---------------------------------------------|
| P0 Critical | confidentiality/integrity/system compromise |
| P1 High     | major security/function failure             |
| P2 Medium   | material degraded function                  |
| P3 Low      | minor issue                                 |
| P4 Cosmetic | UI/documentation issue                      |

Any P0 or unresolved P1 affecting evidence integrity, confidentiality or
access control blocks production release.

------------------------------------------------------------------------

# 20. Final Test Exit Criteria

The test cycle exits when:

- functional coverage is complete;
- security testing is complete;
- critical defects are closed;
- evidence integrity is verified;
- authorization tests pass;
- audit tests pass;
- blockchain verification passes;
- AI guardrails pass;
- DR test is documented;
- UAT is approved;
- residual risks are formally recorded.

------------------------------------------------------------------------

# 21. Required Security Audit Before Production

Before any real government deployment:

- independent security assessment;
- vulnerability assessment;
- penetration testing;
- source-code review;
- configuration review;
- cryptographic review;
- cloud/infrastructure review;
- incident-response exercise;
- DR exercise;
- privacy/data-protection review;
- formal authorization from the competent authority.

SIH success is not equivalent to production approval.
