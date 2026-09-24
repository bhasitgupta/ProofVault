# Polygon Amoy Smart Contract Specification
## Solidity 0.8.20 EVM Integration (TRD §12.1 Strict Compliance)

In strict accordance with Proof Vault Project Technical Requirements Document (`TRD(2).md §12.1 & §13`) and Software Requirements Specification (`SRS(2).md §6.6`), the trust layer consists of **two** authoritative smart contracts:

1. `EvidenceRegistry.sol`:
   - Registers document existence, canonical content hashes (`bytes32`), Merkle roots (`bytes32`), and encrypted blob references.
   - Manages statutory lifecycle statuses: `REGISTERED`, `ACTIVE`, `SUPERSEDED`, `LEGAL_HOLD`, `SHREDDED`.
   - Incorporates on-chain statutory legal holds (`imposeLegalHold`, `liftLegalHold`) directly per TRD §12.1.
   - Performs on-chain Merkle batch chunk verification (`verifyChunkProof`) per TRD §13.
   - Enforces on-chain multi-admin governance (`addAdmin`, `removeAdmin`, `adminCount > 1`).

2. `ProvenanceRegistry.sol`:
   - Records sequential, immutable chain-of-custody and institutional transfer events across police, forensics, prosecution, and judiciary.
   - Cryptographically chains events using `prevEventHash` to guarantee unbroken forensic provenance.
   - Enforces on-chain multi-admin governance and writer authorization.
