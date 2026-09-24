# Security Policy

## About This Policy

Proof Vault is a security-first research and prototype project for
**Proof Vault Project — Secure Digital Document Management System for Legal and
Investigation Documents**.

Because the project is intended for a sensitive public-sector domain,
security vulnerabilities must be handled responsibly. This repository
must never be treated as an appropriate location for real government
records, investigation documents, credentials, or confidential
operational information.

------------------------------------------------------------------------

## Security Objectives

Proof Vault is designed around the following security objectives:

- Confidentiality of sensitive legal and investigation information
- Integrity and verifiability of digital documents
- Strong authentication and authorization
- Least-privilege and need-to-know access
- Complete and tamper-evident auditability
- Secure document lifecycle management
- Controlled inter-agency sharing
- Protection against insider misuse
- Secure cryptographic key management
- Secure AI-assisted processing
- Resilience, backup, and disaster recovery

------------------------------------------------------------------------

## Supported Versions

As this repository is currently an SIH research/prototype project,
security support applies primarily to the actively maintained branch.

| Version / Branch     | Security Support |
|----------------------|------------------|
| `main`               | Supported        |
| Development branches | Best effort      |
| Archived branches    | Not supported    |

Once production releases are established, this section should be updated
with explicit release and end-of-support dates.

------------------------------------------------------------------------

## Reporting a Vulnerability

### Do not create a public GitHub issue for a security vulnerability.

If you discover a vulnerability, report it privately through the
repository's configured GitHub security-reporting mechanism, such as
**Private Vulnerability Reporting** or a **GitHub Security Advisory**.

If the repository has not yet enabled a private reporting channel,
contact the project maintainers through the private contact method
specified in the repository profile.

### Please include

A useful report should contain:

- Vulnerability title
- Affected component
- Affected version or commit
- Vulnerability type
- Severity assessment, if known
- Reproduction steps
- Minimal proof of concept
- Expected behavior
- Actual behavior
- Security impact
- Suggested mitigation, if available

Avoid including real confidential data in the report.

Use synthetic data when demonstrating the issue.

------------------------------------------------------------------------

## Examples of Security Issues

Please report issues such as:

### Authentication

- Authentication bypass
- MFA bypass
- Session fixation
- Token theft
- Weak session invalidation
- JWT validation flaws

### Authorization

- RBAC bypass
- ABAC bypass
- Privilege escalation
- Cross-case access
- Unauthorized document download
- Unauthorized evidence sharing
- Broken object-level authorization

### Data Security

- PII leakage
- Cross-tenant/cross-organization data exposure
- Unencrypted sensitive data
- Encryption implementation flaws
- Key-management weaknesses
- Insecure backups
- Storage access-control bypass

### Evidence Integrity

- Document hash bypass
- Unauthorized version modification
- Provenance manipulation
- Custody-history alteration
- Audit-log tampering
- Blockchain-anchor verification bypass

### Application Security

- SQL/NoSQL injection
- Command injection
- SSRF
- XSS
- CSRF
- Path traversal
- Deserialization vulnerabilities
- Remote code execution
- Insecure file upload
- Malware-scanning bypass

### API Security

- Broken authentication
- Broken authorization
- Excessive data exposure
- Rate-limit bypass
- Mass assignment
- API key exposure
- Insecure webhook handling

### Smart Contracts

- Access-control vulnerabilities
- Reentrancy
- Signature replay
- Incorrect authorization
- Integer/arithmetic vulnerabilities
- Upgradeability flaws
- Manipulation of provenance records
- Incorrect event/state assumptions

### AI Security

- Prompt injection
- Cross-case retrieval leakage
- Sensitive data exposure through model output
- Retrieval authorization bypass
- Embedding/index poisoning
- Model or prompt manipulation
- Unsafe tool execution
- Leakage through logs or telemetry

------------------------------------------------------------------------

## Confidentiality Rules

Never submit real sensitive information to GitHub issues, pull requests,
discussions, commits, or public logs.

This includes:

- FIRs
- Case diaries
- Witness statements
- Victim information
- Accused information
- Forensic reports
- Investigation records
- Aadhaar or other identity information
- Phone numbers
- Addresses
- Passwords
- API keys
- Private keys
- Wallet seed phrases
- Encryption keys
- Government credentials
- Production database records
- Production certificates
- Confidential infrastructure information

Use synthetic or explicitly authorized data for testing.

------------------------------------------------------------------------

## Blockchain Security Boundary

Proof Vault uses blockchain as a **trust and provenance layer**, not as
the repository for confidential documents.

The following must not be placed on a public blockchain:

- Original documents
- FIR contents
- Images
- Video
- Audio
- Victim PII
- Witness PII
- Accused PII
- Addresses
- Phone numbers
- Authentication secrets
- Encryption keys

The intended model is:

``` text
Sensitive Document
       |
       v
Encrypted Off-Chain Storage
       |
       +----> SHA-256 / Integrity Proof
       |
       +----> Provenance / Audit Layer
                       |
                       v
                Blockchain Anchor
```

For the SIH prototype, Polygon Amoy is a test environment. Production
blockchain deployment requires independent government security, privacy,
infrastructure, legal, and governance review.

------------------------------------------------------------------------

## Cryptographic Requirements

Do not introduce custom cryptography without a documented security
rationale and appropriate expert review.

The architecture uses established cryptographic primitives such as:

- SHA-256 for integrity hashing
- AES-256-GCM for authenticated encryption
- Digital signatures
- Secure key rotation
- HSM/KMS-ready key management

Important:

> **Hashing provides integrity verification; encryption provides
> confidentiality.**

A hash must never be treated as a substitute for encryption.

Private keys and encryption keys must never be stored in source code.

------------------------------------------------------------------------

## Authentication and Authorization

All protected operations must be authorized server-side.

The project follows:

- MFA
- RBAC
- ABAC
- Least privilege
- Need-to-know access
- Case-level authorization
- Sensitivity-based controls
- Separation of duties
- Time-bound access where appropriate
- Break-glass access with justification, logging, approval, and expiry

Frontend checks are not security boundaries.

An endpoint must remain secure even if a malicious user bypasses the
frontend.

------------------------------------------------------------------------

## Document Integrity

Every document version should have a verifiable integrity identity.

A typical flow is:

``` text
Upload
  ↓
Validation
  ↓
SHA-256
  ↓
Encryption
  ↓
Secure Storage
  ↓
Evidence Passport
  ↓
Provenance Record
  ↓
Blockchain Anchor
```

Documents must not be silently overwritten.

A modification should result in a new controlled version.

Integrity verification should detect unauthorized changes.

------------------------------------------------------------------------

## Audit and Logging

Security-sensitive operations should produce structured audit events.

Examples:

- Login
- Failed login
- MFA event
- Document upload
- Document access
- Document download
- Document modification
- Version creation
- Sharing
- Permission change
- Break-glass activation
- Break-glass expiry
- Verification
- Failed integrity verification
- Administrative action
- Key-management event
- AI processing of protected information

Logs must not contain unnecessary sensitive document contents or
secrets.

Audit systems should be designed to resist unauthorized alteration and
support centralized monitoring/SIEM integration.

------------------------------------------------------------------------

## AI Security

AI is an assistive component and must not become the authority over
evidence.

AI components must not:

- Modify source evidence
- Delete evidence
- Change provenance
- Grant permissions
- Override authorization policies
- Make final legal determinations
- Automatically approve their own security-sensitive actions

AI security testing should consider:

- Prompt injection
- Retrieval-augmented generation leakage
- Cross-case information leakage
- Unauthorized vector retrieval
- PII leakage
- Model hallucination
- Embedding poisoning
- Malicious documents
- Tool-use abuse
- Sensitive information in prompts, outputs, or logs

AI outputs should be treated as derived information and, where
appropriate, subject to human review.

------------------------------------------------------------------------

## Secure Development Requirements

Security should be integrated into the development lifecycle.

Contributors should consider:

- Threat modeling
- Secure coding
- Dependency scanning
- SAST
- DAST
- Secret scanning
- Container scanning
- SBOM generation
- API security testing
- Authentication testing
- Authorization testing
- Cryptographic verification
- Smart-contract testing
- AI security evaluation
- Penetration testing before production deployment

Security findings should be tracked and remediated according to
severity.

------------------------------------------------------------------------

## Dependency and Supply-Chain Security

Contributors should:

- Prefer maintained dependencies.
- Avoid unnecessary packages.
- Pin or constrain critical dependencies appropriately.
- Review dependency changes.
- Monitor known vulnerabilities.
- Avoid abandoned libraries for security-critical functionality.
- Verify third-party packages and container images.
- Never introduce a dependency solely to avoid implementing a small,
  well-understood function unless the dependency provides a clear
  security or maintenance benefit.

Production builds should support software-supply-chain visibility,
including SBOM generation where appropriate.

------------------------------------------------------------------------

## Secrets Management

Secrets must never be committed to Git.

Examples include:

``` text
DATABASE_URL
JWT_SECRET
PRIVATE_KEY
RPC credentials
Storage credentials
API keys
OAuth client secrets
Encryption keys
HSM/KMS credentials
```

Use:

``` text
.env.example
```

for local configuration documentation.

Use an approved secrets manager or HSM/KMS for production deployments.

If a secret is accidentally committed:

1.  Revoke/rotate it immediately.
2.  Assume it has been exposed.
3.  Remove it from the working tree.
4.  Review repository history where necessary.
5.  Investigate potential misuse.

Simply deleting the secret from the latest commit is not sufficient.

------------------------------------------------------------------------

## Vulnerability Severity

Maintainers may use the following general categories when triaging
vulnerabilities:

| Severity | Meaning                                                                                                            |
|----------|--------------------------------------------------------------------------------------------------------------------|
| Critical | Could enable major compromise, broad confidential-data exposure, or control over protected infrastructure/evidence |
| High     | Significant unauthorized access, privilege escalation, sensitive-data exposure, or integrity compromise            |
| Medium   | Meaningful security weakness requiring specific conditions or limited impact                                       |
| Low      | Limited-impact issue or defense-in-depth weakness                                                                  |

Severity should consider exploitability, affected assets,
confidentiality, integrity, availability, and scope.

------------------------------------------------------------------------

## Disclosure Process

A typical responsible-disclosure process is:

``` text
Researcher reports privately
          ↓
Maintainer acknowledges
          ↓
Reproduction / validation
          ↓
Severity assessment
          ↓
Fix developed
          ↓
Security testing
          ↓
Release / mitigation
          ↓
Coordinated disclosure where appropriate
```

Exact timelines may depend on severity, complexity, affected
dependencies, and whether the issue involves a third-party component.

Do not publicly disclose exploit details while remediation is actively
underway unless disclosure is legally or operationally required.

------------------------------------------------------------------------

## Security Testing Data

Security testing must use:

- Synthetic records
- Public datasets with appropriate licenses
- Explicitly authorized fixtures
- Controlled forensic reference datasets

Do not test against live government systems or real investigation
records without explicit authorization.

Do not perform intrusive testing against third-party infrastructure
without permission.

------------------------------------------------------------------------

## Production Deployment

The SIH prototype is not automatically a production-ready government
deployment.

A production deployment would require, among other things:

- Formal threat modeling
- Security architecture review
- Infrastructure hardening
- Identity integration
- HSM/KMS deployment
- Key-management procedures
- Network segmentation
- Monitoring/SIEM integration
- Vulnerability assessment
- Penetration testing
- Disaster recovery validation
- Backup security
- Incident-response procedures
- Data-governance review
- Legal/compliance review
- Government authorization and operational approval

No contributor should represent the prototype as an approved government
production system unless such approval actually exists.

------------------------------------------------------------------------

## Security Contact

Repository maintainers should configure a private security contact
through GitHub and replace this section with the project's official
reporting channel once established.

``` text
Security reporting:
Use GitHub Private Vulnerability Reporting / Security Advisories.
```

Do not use a public issue for sensitive vulnerability reports.

------------------------------------------------------------------------

## Acknowledgements

We appreciate responsible security researchers and contributors who help
improve Proof Vault while protecting confidential information and
avoiding unauthorized testing.

**Security is a system property. Evidence integrity, confidentiality,
authorization, auditability, and responsible disclosure are core project
requirements—not optional features.**
