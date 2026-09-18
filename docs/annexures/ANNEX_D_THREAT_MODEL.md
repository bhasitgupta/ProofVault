## Annexure D: Threat Modeling & STRIDE Matrix

- **Spoofing**: Defeated by MFA hardware tokens, ECDSA secp256k1 officer signatures, and IP binding.

- **Tampering**: Defeated by SHA-256 Merkle root anchoring to Polygon public ledger.

- **Repudiation**: Defeated by non-repudiable on-chain custody transfer transactions.

- **Information Disclosure**: Defeated by AES-256-GCM envelope encryption with per-dossier DEKs.

- **Denial of Service**: Defeated by Redis token bucket rate limiters and decentralized storage fallback.

- **Elevation of Privilege**: Defeated by strict RBAC access control lists and zero-trust middleware.
