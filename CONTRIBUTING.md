# Contributing to Proof Vault

Thank you for contributing to **Proof Vault**.

Proof Vault is an enterprise-oriented, security-first platform for trusted management, provenance, verification, and controlled access to legal and investigation documents. Because the project concerns sensitive government workflows and digital evidence, contributions must prioritize security, integrity, privacy, interoperability, auditability, and maintainability.

> **Important:** This repository is an Proof Vault Project research/prototype project. Do not commit real FIRs, witness statements, investigation records, personally identifiable information (PII), forensic material, credentials, production secrets, or confidential government data.

## 1. Contribution Principles

Contributions should follow these principles:

- Security by design
- Privacy by design
- Evidence integrity
- Cryptographic verifiability
- Least-privilege access
- Complete auditability
- Human oversight for AI-assisted operations
- Interoperability with the existing criminal-justice ecosystem
- Clear separation of confidential data from public/blockchain infrastructure
- Production-oriented engineering

> **Blockchain is a trust/provenance layer, not the document database.**

Sensitive documents and PII must remain off-chain.

## 2. Before You Start

Before making a significant change:

1. Read the project documentation.
2. Check existing issues and pull requests.
3. Search the repository before introducing a new module or dependency.
4. For architectural changes, discuss the proposed approach before implementation.
5. For security-sensitive changes, describe the threat or security property being addressed.
6. Keep changes focused and reviewable.

Key documents:

- `PRD.md` — Product Requirements
- `TRD.md` — Technical Requirements
- `BRD.md` — Business Requirements
- `SRS.md` — Software Requirements Specification
- `Test.md` — Testing and Validation Strategy

## 3. Development Workflow

### Step 1 — Create or identify an issue

For non-trivial work, describe:

- Problem
- Proposed solution
- Scope
- Security/privacy implications
- API/data-model implications
- Testing requirements

### Step 2 — Create a branch

Use descriptive names:

```text
feature/evidence-passport
feature/abac-policy-engine
fix/document-integrity-check
security/api-authentication
docs/architecture
test/custody-workflow
```

Avoid vague names such as `test`, `new`, `changes`, or `final`.

### Step 3 — Implement

Keep changes small, focused, modular, testable, and backward-compatible where practical.

### Step 4 — Test

Run tests appropriate to the change:

- Unit
- Integration
- API
- Smart-contract
- Security
- Permission
- AI evaluation
- Regression

### Step 5 — Open a Pull Request

Explain:

```text
What changed?
Why was it needed?
How was it implemented?
How was it tested?
Does it affect security?
Does it affect privacy?
Does it affect APIs or schemas?
Does it affect smart contracts?
Does it require documentation changes?
```

## 4. Pull Request Requirements

A PR should:

- Have a clear title.
- Reference the relevant issue.
- Describe the change and rationale.
- Include tests where applicable.
- Update documentation when behavior changes.
- Avoid unrelated refactoring.
- Avoid unnecessary dependencies.
- Explain security-sensitive changes explicitly.

Suggested PR prefixes:

```text
feat: add evidence passport verification
fix: prevent unauthorized document access
security: harden document download authorization
docs: update blockchain trust model
test: add provenance integrity tests
refactor: isolate custody service
```

## 5. Security and Confidentiality

Never commit:

- API keys
- Passwords
- Private keys
- Wallet seed phrases
- JWT secrets
- Encryption keys
- Database credentials
- Cloud credentials
- Government credentials
- Real user data
- Real investigation records
- Production certificates
- HSM/KMS secrets
- Confidential infrastructure information

Use environment variables and approved secret-management mechanisms.

Use `.env.example` for documentation. Never commit a populated `.env`.

## 6. Digital Evidence Safety

Use only:

- Synthetic datasets
- Publicly licensed datasets
- Approved test fixtures
- Controlled forensic reference datasets where appropriate

Do not upload actual evidence to GitHub.

Any test document should be clearly synthetic or explicitly authorized.

## 7. Blockchain Contribution Rules

The blockchain layer anchors appropriate integrity/provenance information.

### Appropriate on-chain information

```text
document hash
version hash
provenance reference
timestamp
non-sensitive technical identifiers
```

### Never put on-chain

```text
PDF files
images
videos
audio
FIR contents
victim PII
witness PII
accused PII
addresses
phone numbers
Aadhaar numbers
passwords
encryption keys
```

Never assume that encrypting sensitive information before putting it on a public blockchain makes it appropriate for on-chain storage.

For the SIH prototype, Polygon Amoy is the test environment. Production blockchain architecture requires separate government security, privacy, infrastructure, and governance review.

## 8. Cryptography

Do not implement custom cryptographic primitives unless there is a documented research reason and appropriate expert review.

The architecture uses:

- SHA-256 for document integrity
- AES-256-GCM for authenticated encryption
- Digital signatures
- Key rotation
- HSM/KMS-ready key management

Hashing and encryption solve different problems. Do not treat a hash as confidential storage.

## 9. Authentication and Authorization

Authorization changes are security-critical.

The system is designed around:

- Authentication
- MFA
- RBAC
- ABAC
- Least privilege
- Case-level authorization
- Sensitivity classification
- Need-to-know access
- Separation of duties
- Time-bound access where appropriate
- Break-glass access with explicit justification and auditing

Every protected endpoint must enforce authorization server-side.

Frontend controls are not security controls.

## 10. Document Integrity

A document version is a distinct integrity object.

Changes to evidence must create a new version and corresponding integrity metadata. Do not silently overwrite evidence.

Typical lifecycle:

```text
Upload
  ↓
Validate
  ↓
Hash
  ↓
Encrypt
  ↓
Store
  ↓
Create Evidence Passport
  ↓
Record Provenance
  ↓
Anchor
  ↓
Verify
```

Integrity checks must detect changes made outside the controlled versioning process.

## 11. AI Contributions

AI functionality is assistive.

AI must not:

- Modify source evidence
- Delete evidence
- Change provenance
- Grant permissions
- Override access policies
- Make final legal determinations
- Automatically approve its own outputs

AI-generated information should be treated as derived information.

Where appropriate, outputs should include:

- Source references
- Confidence/uncertainty information
- Model/version information
- Processing timestamp
- Human-review state

Security-sensitive AI changes should consider prompt injection, data leakage, hallucination, unauthorized retrieval, cross-case leakage, embedding/index poisoning, and sensitive information in logs.

## 12. API and Database Changes

API changes should document:

- Endpoint
- Method
- Authentication
- Authorization
- Request schema
- Response schema
- Error behavior
- Rate limits where applicable
- Audit requirements
- Security implications

Database migrations must be reproducible, reviewed, and tested. Never manually modify production-like schemas without a migration.

Avoid storing secrets or unnecessary PII.

## 13. Smart Contract Changes

Smart-contract changes require additional review.

Verify:

- Access control
- Input validation
- Event emission
- Upgradeability assumptions
- Reentrancy considerations where relevant
- Integer/overflow behavior
- Gas usage
- Failure modes
- Contract tests
- Deployment configuration

Never commit a real private key. Use a test wallet for shared testnet deployments.

## 14. Testing Standards

New functionality should include tests appropriate to its risk.

Examples:

### Document service

- Upload succeeds
- Invalid document is rejected
- Hash is generated correctly
- Version is created correctly
- Unauthorized download is rejected

### Authorization

- Correct role permitted
- Incorrect role denied
- Case boundary enforced
- Sensitivity policy enforced
- Break-glass requires justification
- Break-glass expires correctly

### Integrity

- Original hash verifies
- Modified file fails verification
- Version chain remains consistent
- Blockchain-anchor mismatch is detected

### AI

- PII detection evaluated
- Unauthorized documents are not retrieved
- Prompt-injection cases tested
- Unsupported AI claims evaluated

Security tests should include both positive and negative cases.

## 15. Code Quality

Prefer:

- Clear names
- Small functions
- Strong typing
- Explicit error handling
- Structured logging
- Deterministic tests
- Minimal duplication

Avoid:

- Dead code
- Hard-coded secrets
- Hidden side effects
- Broad exception swallowing
- Unnecessary dependencies
- Debug credentials
- Temporary production bypasses

## 16. Security Vulnerabilities

**Do not disclose security vulnerabilities in public GitHub issues.**

If you discover an authentication bypass, authorization bypass, data leak, PII exposure, cryptographic weakness, secret exposure, smart-contract vulnerability, remote-code-execution issue, injection flaw, evidence-integrity bypass, or audit-log manipulation, use the repository's private security-reporting mechanism.

If GitHub Security Advisories or Private Vulnerability Reporting is enabled, use it.

Do not publish exploit details until the maintainers have had a reasonable opportunity to investigate and respond.

## 17. Documentation

If a change affects architecture, security, APIs, data models, workflows, or operations, update the relevant documentation.

Consider updates to:

- `PRD.md`
- `TRD.md`
- `BRD.md`
- `SRS.md`
- `Test.md`
- Architecture diagrams
- API documentation
- Deployment documentation

Documentation is part of the implementation.

## 18. Review Philosophy

Reviewers should evaluate:

1. Correctness
2. Security
3. Privacy
4. Evidence integrity
5. Authorization
6. Auditability
7. Performance
8. Interoperability
9. Maintainability
10. Test coverage

For this project, a feature that works but weakens confidentiality or evidence integrity is not considered a successful contribution.

## 19. Intellectual Property

Before contributing code, documentation, designs, datasets, or other material, ensure that you have the right to contribute it.

Do not submit:

- Proprietary code copied from an employer
- Confidential government material
- Copyrighted material without permission
- Restricted datasets
- Credentials or internal configuration

Contributions must be compatible with the repository's declared license.

## 20. Final Checklist

Before opening a PR:

- [ ] No secrets committed
- [ ] No real confidential/government data committed
- [ ] No unnecessary PII committed
- [ ] Tests added/updated
- [ ] Security implications reviewed
- [ ] Authorization enforced server-side
- [ ] API/schema changes documented
- [ ] Blockchain changes reviewed
- [ ] AI changes evaluated for data leakage
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] PR is focused and reviewable

Thank you for helping build Proof Vault with the security and engineering discipline expected of a sensitive, government-oriented system.
