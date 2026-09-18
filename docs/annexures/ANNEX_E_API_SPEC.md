## Annexure E: OpenAPI Core Endpoint Schema

- `POST /api/v1/auth/login`: Authenticate institutional user with username/password.

- `POST /api/v1/auth/mfa`: Verify phase-2 TOTP challenge.

- `GET /api/v1/cases/`: List all accessible case dossiers for officer.

- `POST /api/v1/documents/upload`: Ingest new digital evidence with forensic hashing.

- `GET /api/v1/documents/{id}/verify`: Cryptographically verify document hash on Polygon ledger.

- `GET /api/v1/custody/{doc_id}`: Retrieve chronological chain-of-custody timeline.

- `POST /api/v1/certificates/section65b`: Generate statutory PDF/JSON Section 65B/63 certificate.
