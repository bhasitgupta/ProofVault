export interface DocRecord {
  docId: string;
  caseId: string;
  contentHash: string;
  blobHash: string;
  chunkMerkleRoot: string;
  chunkCount: number;
  sizeBytes: number;
  mimeType: string;
  docType: string;
  classification: string;
  uploaderId: string;
  uploaderMSP: string;
  uploaderSig: string;
  tsaTokenHash: string;
  ingestTimestampUtc: string;
  supersedesDocId?: string;
  status: 'ACTIVE' | 'REVOKED' | 'SUPERSEDED' | 'SHREDDED';
}

export interface MerkleStep {
  hash: string;
  side: 'left' | 'right';
}
