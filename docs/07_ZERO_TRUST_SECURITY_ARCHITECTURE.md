# Zero-Trust Security Architecture
## Principle of Least Privilege (PoLP) & Continuous Verification

- Session tokens valid for 30 minutes with cryptographic refresh validation.
- RBAC roles: Investigator, Forensic Examiner, Magistrate, Audit Controller.
- Envelope encryption ensures backend operators cannot view document plaintext without authorized DEK access.
