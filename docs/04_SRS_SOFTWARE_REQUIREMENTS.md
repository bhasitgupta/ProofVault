# Software Requirements Specification (SRS)
## IEEE 830-1998 Standard Compliance

### Module 1: Evidence Ingestion & Cryptographic Hashing
- Ingested files must be hashed via SHA-256 before disk writes.
- File entropy must be computed and quarantined if entropy > 7.85.

### Module 2: Chain of Custody (Provenance)
- All accesses must produce an immutable ledger record anchored on Polygon.
