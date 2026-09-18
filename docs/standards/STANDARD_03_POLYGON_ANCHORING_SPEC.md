# Standard 03: Polygon Blockchain Anchor Architecture (TRD §12.1 Compliance)

### 3.1 Network Topology
Anchors deployed on Polygon Amoy (Testnet Chain ID: 80002) and Polygon PoS / CDK Mainnet.

### 3.2 Smart Contract Trust Boundaries
- **EvidenceRegistry.sol**: Immutable evidence registration, canonical SHA-256 digests, chunked Merkle tree root publishing, on-chain chunk proof verification (`verifyChunkProof`), and statutory legal hold state management.
- **ProvenanceRegistry.sol**: Append-only cryptographic custody log with sequential event hash chaining (`prevEventHash`).

### 3.3 Transaction Lifecycle
1. Transaction broadcast with EIP-1559 gas estimation.
2. Mempool propagation and validator inclusion.
3. 5-block confirmation receipt parsing.

### 3.4 Gas Optimization
Batching evidentiary events and fractional chunks per Merkle root reduces on-chain verification costs by 99% while ensuring complete BSA §63 / IEA §65B admissibility.
