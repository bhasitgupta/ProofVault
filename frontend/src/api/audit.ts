import { apiFetch } from './client';
import { Case, AuditEvent } from '../lib/types';

export async function getCases(): Promise<Case[]> {
  return apiFetch<Case[]>('/cases');
}

export async function getCaseDetails(caseId: string): Promise<Case> {
  return apiFetch<Case>(`/cases/${caseId}`);
}

export async function getCaseTimeline(caseId: string): Promise<{ case_id: string; events: AuditEvent[] }> {
  return apiFetch<{ case_id: string; events: AuditEvent[] }>(`/audit/cases/${caseId}/timeline`);
}

export async function getIncidents(): Promise<{ total: number; incidents: any[] }> {
  return apiFetch<{ total: number; incidents: any[] }>('/audit/incidents');
}
