# Standard 03: Polygon Blockchain Anchor Architecture

### 3.1 Network Topology

Anchors deployed on Polygon Amoy (Testnet) and Polygon PoS Mainnet.

### 3.2 Smart Contract Trust Boundaries

- EvidenceRegistry: Immutable state storage.

- ProvenanceRegistry: Append-only custody logs.

- AuditAnchorRegistry: Batch Merkle tree root publisher.

### 3.3 Transaction Lifecycle

1. Transaction broadcast with EIP-1559 gas estimation.

2. Mempool propagation and validator inclusion.
