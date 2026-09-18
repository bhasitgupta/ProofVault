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
