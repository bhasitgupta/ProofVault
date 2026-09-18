export interface CustodyRecord {
  docId: string;
  action: string;
  actorId: string;
  timestamp: number;
  txHash: string;
}

export interface CustodyVerificationProof {
  docHash: string;
  merkleRoot: string;
  blockNumber: number;
  isAnchored: boolean;
}
