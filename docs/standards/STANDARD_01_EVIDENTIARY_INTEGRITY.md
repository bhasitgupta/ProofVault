# Standard 01: Evidentiary Integrity & Cryptographic Proofs

### 1.1 Scope and Purpose

This standard mandates strict cryptographic controls for evidentiary artifacts.

### 1.2 Approved Hash Functions

- Primary: FIPS-180-4 SHA-256 (256-bit digest)

- Auxiliary: SHA-512 for high-security cases

- Prohibited: MD5 and SHA-1 for legal admissibility

### 1.3 Collision Resistance Guarantees

Probability of collision under SHA-256 is less than 1 in 2^128.
