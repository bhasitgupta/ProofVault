export interface PolygonAnchorReceipt {
  txHash: string;
  blockNumber: number;
  contractAddress: string;
  gasUsed: string;
}

export interface PolygonRpcNodeStatus {
  rpcUrl: string;
  latencyMs: number;
  isAlive: boolean;
  chainId: number;
}

export interface MerkleInclusionProof {
  leafHash: string;
  merkleRoot: string;
  proofPath: string[];
  leafIndex: number;
}

export interface SmartContractRoleClearance {
  account: string;
  roleKeccak: string;
  grantedBy: string;
  timestamp: number;
}

export interface GasStrategyEstimation {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  baseFee: bigint;
}
