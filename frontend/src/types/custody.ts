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

export interface CustodianProfile {
  officerId: string;
  name: string;
  badgeNumber: string;
  clearanceLevel: number;
}

export interface EvidenceDossierSummary {
  caseId: string;
  title: string;
  totalArtifacts: number;
  isFrozen: boolean;
}
