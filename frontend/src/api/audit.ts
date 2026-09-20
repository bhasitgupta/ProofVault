import { apiFetch } from './client';
import { Case, AuditEvent } from '../lib/types';

const SUPABASE_REST_URL = 'https://kraxwwwkhprczuiqkxuw.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'sb_publishable_yBEvcnfdSVjN_5ZlxSw_5w_bDe53Czq';

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
  // 1. Try local or configured backend
  try {
    const data = await apiFetch<Case[]>('/cases');
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (backendErr) {
    console.warn('Backend cases endpoint returned error or offline, connecting to Supabase cloud DB:', backendErr);
  }

  // 2. Direct query to live Supabase PostgreSQL database
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/cases?select=*&order=created_at.asc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((c: any) => ({
          case_id: c.case_id,
          title: c.title || `Docket ${c.case_id}`,
          description: c.description || '',
          status: c.status || 'ACTIVE',
          classification_ceiling: c.classification_ceiling || 'CONFIDENTIAL',
          owning_msp: c.owning_msp || 'PoliceMSP',
          active_document_count: c.active_document_count ?? 4,
          created_at: c.created_at,
        }));
      }
    }
  } catch (supaErr) {
    console.warn('Supabase cloud DB query error:', supaErr);
  }

  // 3. Fallback cases
  return FALLBACK_CASES;
}

export async function getCaseDetails(caseId: string): Promise<Case> {
  try {
    return await apiFetch<Case>(`/cases/${caseId}`);
  } catch (err) {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/cases?case_id=eq.${encodeURIComponent(caseId)}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows[0]) return rows[0];
      }
    } catch {}
    const found = FALLBACK_CASES.find((c) => c.case_id === caseId);
    if (found) return found;
    throw err;
  }
}

export async function getCaseTimeline(caseId: string): Promise<{ case_id: string; events: AuditEvent[] }> {
  try {
    return await apiFetch<{ case_id: string; events: AuditEvent[] }>(`/case-audit/${caseId}`);
  } catch {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/audit_logs?case_id=eq.${encodeURIComponent(caseId)}&select=*&order=created_at.asc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const events = await res.json();
        return { case_id: caseId, events: events || [] };
      }
    } catch {}
    return { case_id: caseId, events: [] };
  }
}

export async function getIncidents(): Promise<{ total: number; incidents: any[] }> {
  try {
    return await apiFetch<{ total: number; incidents: any[] }>('/audit/incidents');
  } catch {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/incidents?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return { total: data.length, incidents: data };
      }
    } catch {}
    return { total: 0, incidents: [] };
  }
}
