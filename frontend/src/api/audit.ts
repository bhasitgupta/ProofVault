import { apiFetch } from './client';
import { Case, AuditEvent } from '../lib/types';

export const FALLBACK_CASES: Case[] = [
  {
    case_id: 'CASE-101',
    title: 'State vs Cyber Syndicate - Hawala Breach & Crypto Theft',
    description: 'Inter-state cybercrime and fraudulent cryptocurrency transfer involving international cold wallets.',
    status: 'ACTIVE',
    classification_ceiling: 'CONFIDENTIAL',
    owning_msp: 'PoliceMSP',
    active_document_count: 5,
  },
  {
    case_id: 'CASE-102',
    title: 'FIR 402/2026 - Central Bank Core Gateway Ransomware',
    description: 'Critical banking infrastructure ransomware deployment impacting central clearing switch.',
    status: 'ACTIVE',
    classification_ceiling: 'SECRET',
    owning_msp: 'PoliceMSP',
    active_document_count: 4,
  },
  {
    case_id: 'CASE-103',
    title: 'Special Investigation - Ballistics & Arms Seizure',
    description: 'Ballistic cross-matching and illegal firearm telemetry in trans-border arms smuggling.',
    status: 'ACTIVE',
    classification_ceiling: 'SECRET',
    owning_msp: 'PoliceMSP',
    active_document_count: 3,
  },
  {
    case_id: 'CASE-104',
    title: 'Judicial Review - Corporate Embezzlement & Balance Sheet Forgery',
    description: 'Shell corporation money trails, forged auditor sign-offs, and siphoned infrastructure subsidies.',
    status: 'ACTIVE',
    classification_ceiling: 'CONFIDENTIAL',
    owning_msp: 'JudiciaryMSP',
    active_document_count: 3,
  },
  {
    case_id: 'CASE-105',
    title: 'Digital Narcotics Trafficking & Darknet Transit Network',
    description: 'Encrypted communication extractions, cryptocurrency payments, and darknet postal drops.',
    status: 'ACTIVE',
    classification_ceiling: 'SECRET',
    owning_msp: 'PoliceMSP',
    active_document_count: 4,
  },
];

export async function getCases(): Promise<Case[]> {
  try {
    const data = await apiFetch<Case[]>('/cases');
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return FALLBACK_CASES;
  } catch (err) {
    console.warn('Backend cases endpoint returned error or offline, activating sovereign fallback cases:', err);
    return FALLBACK_CASES;
  }
}

export async function getCaseDetails(caseId: string): Promise<Case> {
  try {
    return await apiFetch<Case>(`/cases/${caseId}`);
  } catch (err) {
    const found = FALLBACK_CASES.find((c) => c.case_id === caseId);
    if (found) return found;
    throw err;
  }
}

export async function getCaseTimeline(caseId: string): Promise<{ case_id: string; events: AuditEvent[] }> {
  try {
    return await apiFetch<{ case_id: string; events: AuditEvent[] }>(`/audit/cases/${caseId}/timeline`);
  } catch {
    return { case_id: caseId, events: [] };
  }
}

export async function getIncidents(): Promise<{ total: number; incidents: any[] }> {
  try {
    return await apiFetch<{ total: number; incidents: any[] }>('/audit/incidents');
  } catch {
    return { total: 0, incidents: [] };
  }
}
