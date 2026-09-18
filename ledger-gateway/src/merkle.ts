import * as crypto from 'crypto';

export function hashLeaf(docId: string, chunkIndex: number, chunkText: string): string {
  const indexBuf = Buffer.alloc(4);
  indexBuf.writeUInt32BE(chunkIndex, 0);

  const hasher = crypto.createHash('sha256');
  hasher.update(Buffer.from([0x00]));
  hasher.update(Buffer.from(docId, 'utf8'));
  hasher.update(indexBuf);
  hasher.update(Buffer.from(chunkText, 'utf8'));
  return hasher.digest('hex');
}

export function hashNodes(leftHex: string, rightHex: string): string {
  const hasher = crypto.createHash('sha256');
  hasher.update(Buffer.from([0x01]));
  hasher.update(Buffer.from(leftHex, 'hex'));
  hasher.update(Buffer.from(rightHex, 'hex'));
  return hasher.digest('hex');
}

export function verifyMerkleProof(
  docId: string,
  chunkIndex: number,
  chunkText: string,
  rootHex: string,
  proof: Array<{ hash: string; side: 'left' | 'right' }>
): boolean {
  let currentHash = hashLeaf(docId, chunkIndex, chunkText);

  for (const step of proof) {
    if (step.side === 'left') {
      currentHash = hashNodes(step.hash, currentHash);
    } else {
      currentHash = hashNodes(currentHash, step.hash);
    }
  }

  return currentHash.toLowerCase() === rootHex.toLowerCase();
}
