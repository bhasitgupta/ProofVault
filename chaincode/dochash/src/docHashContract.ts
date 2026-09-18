import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { DocRecord, MerkleStep } from './types';
import { verifyMerkleProof } from './merkle';

@Info({ title: 'DocHashContract', description: 'Smart contract for Dochash-Channel' })
export class DocHashContract extends Contract {
  constructor() {
    super('DocHashContract');
  }

  @Transaction()
  public async RegisterDocument(ctx: Context, recordJson: string): Promise<string> {
    const record: DocRecord = JSON.parse(recordJson);
    const docKey = ctx.stub.createCompositeKey('DocRecord', [record.docId]);

    const existing = await ctx.stub.getState(docKey);
    if (existing && existing.length > 0) {
      throw new Error(`Write-Once Violation: Document ${record.docId} already registered on ledger`);
    }

    record.status = 'ACTIVE';
    await ctx.stub.putState(docKey, Buffer.from(JSON.stringify(record)));
    return ctx.stub.getTxID();
  }

  @Transaction(false)
  @Returns('string')
  public async GetDocument(ctx: Context, docId: string): Promise<string> {
    const docKey = ctx.stub.createCompositeKey('DocRecord', [docId]);
    const docBytes = await ctx.stub.getState(docKey);
    if (!docBytes || docBytes.length === 0) {
      throw new Error(`Document ${docId} not found on ledger`);
    }
    return Buffer.from(docBytes).toString('utf8');
  }

  @Transaction(false)
  @Returns('boolean')
  public async VerifyContentHash(ctx: Context, docId: string, providedHash: string): Promise<boolean> {
    const docJson = await this.GetDocument(ctx, docId);
    const record: DocRecord = JSON.parse(docJson);
    return record.contentHash.toLowerCase() === providedHash.toLowerCase();
  }

  @Transaction(false)
  @Returns('boolean')
  public async VerifyChunk(
    ctx: Context,
    docId: string,
    chunkIndex: number,
    chunkText: string,
    proofJson: string
  ): Promise<boolean> {
    const docJson = await this.GetDocument(ctx, docId);
    const record: DocRecord = JSON.parse(docJson);
    const proof: MerkleStep[] = JSON.parse(proofJson);

    return verifyMerkleProof(docId, chunkIndex, chunkText, record.chunkMerkleRoot, proof);
  }

  @Transaction()
  public async MarkShredded(ctx: Context, caseId: string, reason: string): Promise<string> {
    // Audit marker indicating cryptographic key destruction
    const shredKey = ctx.stub.createCompositeKey('ShredRecord', [caseId]);
    const shredEvent = {
      caseId,
      reason,
      timestamp: new Date().toISOString(),
      txId: ctx.stub.getTxID(),
    };
    await ctx.stub.putState(shredKey, Buffer.from(JSON.stringify(shredEvent)));
    return ctx.stub.getTxID();
  }
}
