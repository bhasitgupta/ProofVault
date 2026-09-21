## Annexure C: Polygon Amoy PoS Ledger Integration Details

- **EVM RPC Target**: `https://rpc-amoy.polygon.technology/`

- **Chain ID**: `80002` (EIP-155 compliant)

- **Gas Strategy**: Dynamic EIP-1559 maxFeePerGas and maxPriorityFeePerGas estimation.

- **Block Confirmation Policy**: Minimum 5 block confirmations required for statutory finality.

- **Fallback RPC Nodes**: Alchemy Amoy, Infura Polygon Amoy, PublicNode endpoints.

- **Contract ABI Caching**: In-memory ABI caching with automatic contract binding via Web3.py.

- **Deployed Contract Addresses (Polygon Amoy Testnet)**:
  - `EvidenceRegistry`: `0xC15D29c23C72c7E6301AeD190F2FD186372b7DBe`
  - `ProvenanceRegistry`: `0x11A0a778303196d735B9cCdE62eB5bC5B29a855a`
