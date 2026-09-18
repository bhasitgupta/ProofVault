import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { AuditEvent } from './types';

@Info({ title: 'AccessContract', description: 'Smart contract for Access-Channel audit logging' })
export class AccessContract extends Contract {
  constructor() {
    super('AccessContract');
  }

  @Transaction()
  public async AppendEvent(ctx: Context, eventJson: string): Promise<string> {
    const event: AuditEvent = JSON.parse(eventJson);
    const txId = ctx.stub.getTxID();
    event.timestamp = new Date().toISOString();

    const eventKey = ctx.stub.createCompositeKey('AuditEvent', [event.eventId]);
    await ctx.stub.putState(eventKey, Buffer.from(JSON.stringify(event)));

    // Index by caseId for timeline queries
    if (event.caseId) {
      const caseIndexKey = ctx.stub.createCompositeKey('CaseEvent', [event.caseId, event.eventId]);
      await ctx.stub.putState(caseIndexKey, Buffer.from(event.eventId));
    }

    // Index by docIds for document chain-of-custody queries
    if (event.docIds && event.docIds.length > 0) {
      for (const docId of event.docIds) {
        const docIndexKey = ctx.stub.createCompositeKey('DocEvent', [docId, event.eventId]);
        await ctx.stub.putState(docIndexKey, Buffer.from(event.eventId));
      }
    }

    return txId;
  }

  @Transaction(false)
  @Returns('string')
  public async GetEventsByCase(ctx: Context, caseId: string): Promise<string> {
    const iterator = await ctx.stub.getStateByPartialCompositeKey('CaseEvent', [caseId]);
    const events: AuditEvent[] = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value) {
        const eventId = Buffer.from(res.value.value).toString('utf8');
        const eventKey = ctx.stub.createCompositeKey('AuditEvent', [eventId]);
        const eventBytes = await ctx.stub.getState(eventKey);
        if (eventBytes && eventBytes.length > 0) {
          events.push(JSON.parse(Buffer.from(eventBytes).toString('utf8')));
        }
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify(events);
  }

  @Transaction(false)
  @Returns('string')
  public async GetDocumentHistory(ctx: Context, docId: string): Promise<string> {
    const iterator = await ctx.stub.getStateByPartialCompositeKey('DocEvent', [docId]);
    const events: AuditEvent[] = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value) {
        const eventId = Buffer.from(res.value.value).toString('utf8');
        const eventKey = ctx.stub.createCompositeKey('AuditEvent', [eventId]);
        const eventBytes = await ctx.stub.getState(eventKey);
        if (eventBytes && eventBytes.length > 0) {
          events.push(JSON.parse(Buffer.from(eventBytes).toString('utf8')));
        }
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify(events);
  }
}
