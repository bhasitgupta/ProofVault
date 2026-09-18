export interface AuditEvent {
  eventId: string;
  actorId: string;
  actorRole: string;
  actorMSP: string;
  action: string;
  caseId?: string;
  docIds: string[];
  queryHash?: string;
  resultHash?: string;
  outcome: 'ALLOW' | 'DENY';
  reason?: string;
  timestamp: string;
}
