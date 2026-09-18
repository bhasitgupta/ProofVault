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

export type CustodyActionType = 'INGEST' | 'TRANSFER' | 'INSPECT' | 'EXTRACT' | 'LEGAL_HOLD' | 'DISPOSE';
