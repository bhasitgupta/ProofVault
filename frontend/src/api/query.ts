import { apiFetch } from './client';
import { QueryResponse } from '../lib/types';

export async function askEvidence(query: string, caseIds: string[] = []): Promise<QueryResponse> {
  return apiFetch<QueryResponse>('/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, case_ids: caseIds }),
  });
}
