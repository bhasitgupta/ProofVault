# Code of Conduct

## Our Commitment

NYAYA-VAULT is a security-focused collaborative project developed in the context of **Smart India Hackathon 2026 — SIH26190: Secure Digital Document Management System for Legal and Investigation Documents**.

We want the project community to be professional, technically rigorous, inclusive, and respectful.

This Code of Conduct applies to contributors, maintainers, reviewers, mentors, participants, and anyone interacting with the project's repositories, issues, pull requests, discussions, documentation, or official project spaces.

## Expected Behavior

We expect participants to:

- Treat others with respect and professionalism.
- Communicate clearly and constructively.
- Focus criticism on code, architecture, documentation, ideas, or processes—not people.
- Assume good faith while remaining technically rigorous.
- Provide useful technical feedback.
- Welcome contributors with different levels of experience.
- Respect different technical perspectives.
- Give appropriate credit.
- Protect confidential, personal, and security-sensitive information.
- Report vulnerabilities responsibly.
- Follow project contribution and security procedures.
- Accept reasonable feedback from maintainers and reviewers.
- Keep discussions relevant to the project.

## Technical Disagreement

Strong technical disagreement is acceptable and often valuable.

Healthy disagreement should identify the technical reason, risk, evidence, or alternative.

For example:

> “This authorization model appears to create a privilege-escalation risk because the backend does not enforce the policy.”

Unacceptable behavior includes personal attacks, harassment, intimidation, insults, or deliberately derailing technical discussions.

The objective is to improve the system, not to win an argument.

## Security and Confidentiality

NYAYA-VAULT concerns legal and investigation documents and therefore requires a particularly high standard of information handling.

Never publicly disclose:

- Real FIRs
- Witness statements
- Victim information
- Accused information
- Investigation records
- Forensic evidence
- Aadhaar or other identity information
- Credentials
- Private keys
- Passwords
- Encryption keys
- Government infrastructure details
- Production secrets
- Confidential datasets
- Restricted documents

Use synthetic or explicitly authorized data for development and testing.

### Security vulnerabilities

Do **not** post exploitable security vulnerabilities publicly.

Examples include:

- Authentication bypass
- Authorization bypass
- PII leakage
- Evidence-integrity bypass
- Secret exposure
- Remote code execution
- SQL/NoSQL injection
- Smart-contract vulnerabilities
- Cross-case data access
- Audit-log manipulation

Use the repository's private security-reporting mechanism instead.

## Unacceptable Behavior

The following behavior is not acceptable:

- Harassment
- Threats or intimidation
- Discriminatory or hateful conduct
- Personal attacks
- Deliberate humiliation
- Sexual harassment
- Publishing someone's private information without consent
- Doxxing
- Credential theft or solicitation
- Deliberate exposure of confidential information
- Deliberate introduction of malicious code
- Sabotage of project infrastructure
- Knowingly introducing a security backdoor without authorization
- Manipulating evidence or test data to misrepresent system behavior
- Misrepresenting another person's work as your own
- Repeatedly ignoring project security requirements
- Retaliation against someone who reports a concern or vulnerability

## AI-Assisted Development

AI coding assistants are permitted when used responsibly.

Contributors remain responsible for code they submit.

Do not use an AI system to:

- Upload confidential government documents
- Upload real investigation records
- Expose credentials or secrets
- Circumvent project security controls
- Generate or introduce malicious functionality
- Bypass required review

AI-generated code must be reviewed, tested, and understood before submission.

## Evidence and Research Integrity

Contributors must not intentionally fabricate:

- Security test results
- Benchmark results
- Government integrations
- Production deployments
- Legal/compliance approvals
- Dataset provenance
- Blockchain transaction evidence
- AI evaluation results

If a capability is simulated for the SIH prototype, label it clearly as a prototype, simulation, mock, or test integration.

## Professional Communication

During reviews, identify the problem and its impact.

Prefer:

> “This endpoint appears to authorize based only on frontend state. The backend should enforce the policy independently.”

Avoid:

> “This is terrible code.”

Good reviews identify the issue, explain the risk, and where possible suggest a path forward.

## Maintainer Responsibilities

Maintainers should:

- Apply this Code of Conduct consistently.
- Review security reports responsibly.
- Protect reporters from retaliation.
- Avoid conflicts of interest where practical.
- Explain moderation decisions when appropriate.
- Keep project discussions technically focused.
- Protect confidential information.
- Maintain reasonable engineering standards.

Maintainers are not required to accept every contribution, but technical decisions should be made in good faith and based on project requirements.

## Enforcement

If this Code of Conduct is violated, maintainers may take proportionate action, including:

1. Private warning
2. Request to modify or remove inappropriate content
3. Temporary restriction from project spaces
4. Rejection or removal of contributions
5. Temporary suspension
6. Permanent removal from project spaces
7. Reporting illegal or dangerous activity to the appropriate authority where required

Security incidents may require immediate action without prior warning.

## Reporting a Conduct Concern

If you experience or observe unacceptable behavior, report it privately to the project maintainers through the repository's designated private communication channel.

When reporting, provide:

- What happened
- Approximate date/time
- Relevant repository, issue, PR, discussion, or communication
- Links or screenshots where safe and appropriate
- Names/usernames of involved participants
- Any immediate security or safety concern

Do not publicly repost sensitive evidence of the incident.

## Security Reports Are Different

For security vulnerabilities, use the repository's security reporting mechanism rather than a normal issue.

A security report should contain enough information for maintainers to reproduce and assess the vulnerability without unnecessarily exposing sensitive information.

## Scope

This Code of Conduct applies within:

- GitHub repositories
- Issues
- Pull requests
- Discussions
- Code reviews
- Project documentation
- Official project communication channels
- Project events and meetings
- Other spaces when an individual is representing NYAYA-VAULT

## Attribution

This document is inspired by established open-source community standards, including the Contributor Covenant, with additional project-specific requirements for confidentiality, security research, digital evidence integrity, and responsible AI-assisted development.

## Final Principle

NYAYA-VAULT is intended to explore technology for a sensitive public-sector domain.

**Build responsibly. Review rigorously. Protect confidential information. Challenge ideas, not people.**

A strong security culture is part of the system's architecture—not an optional feature.
