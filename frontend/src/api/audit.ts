import { apiFetch } from './client';
import { Case, AuditEvent } from '../lib/types';

const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 'https://kraxwwwkhprczuiqkxuw.supabase.co';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_ANON_KEY =
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_yBEvcnfdSVjN_5ZlxSw_5w_bDe53Czq';

// No fallback/dummy cases — always show real data or empty state
export const FALLBACK_CASES: Case[] = [];

export async function getCases(): Promise<Case[]> {
  // 1. Direct query to live Supabase PostgreSQL database
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/cases?select=*&order=created_at.asc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((c: any) => ({
          case_id: c.case_id || c.id,
          title: c.title || `Docket ${c.case_id}`,
          description: c.description || '',
          status: c.status || 'ACTIVE',
          classification_ceiling: c.classification_ceiling || 'CONFIDENTIAL',
          owning_msp: c.owning_msp || 'PoliceMSP',
          created_at: c.created_at,
        }));
      }
      if (Array.isArray(data) && data.length === 0) {
        return [];
      }
    }
  } catch (supaErr) {
    console.warn('Supabase cloud DB query error:', supaErr);
  }

  // 2. Try local or configured backend
  try {
    const data = await apiFetch<Case[]>('/cases');
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (backendErr) {
    console.warn('Backend cases endpoint returned error or offline:', backendErr);
  }

  // 3. Return empty — no dummy data
  return [];
}

export async function createCase(caseData: {
  case_id: string;
  title: string;
  description: string;
  classification_ceiling: string;
  owning_msp?: string;
}): Promise<Case> {
  const nowIso = new Date().toISOString();
  const payload = {
    case_id: caseData.case_id,
    title: caseData.title,
    description: caseData.description,
    classification_ceiling: caseData.classification_ceiling,
    owning_msp: caseData.owning_msp || 'PoliceMSP',
    status: 'ACTIVE',
    created_at: nowIso,
    updated_at: nowIso,
  };

  const res = await fetch(`${SUPABASE_REST_URL}/cases`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`Failed to create case in Supabase: ${errTxt}`);
  }

  // Log audit event
  await recordCustodyEvent({
    actorId: localStorage.getItem('sdms_user_id') || 'USR-001',
    actorRole: 'INVESTIGATOR',
    actorMSP: caseData.owning_msp || 'PoliceMSP',
    action: 'CASE_INITIALIZED',
    caseId: caseData.case_id,
    outcome: 'ALLOW',
    reason: `Initial legal hold & forensic docket created: ${caseData.title}`,
  });

  return payload as Case;
}

export async function updateCaseStatus(
  caseId: string,
  status: 'ACTIVE' | 'LEGAL_HOLD' | 'DISPOSED',
  reason: string = ''
): Promise<void> {
  const nowIso = new Date().toISOString();
  const res = await fetch(`${SUPABASE_REST_URL}/cases?case_id=eq.${encodeURIComponent(caseId)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, updated_at: nowIso }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update case status: ${err}`);
  }

  // Record audit log
  await recordCustodyEvent({
    actorId: localStorage.getItem('sdms_user_id') || 'USR-001',
    actorRole: 'SUPERVISOR',
    actorMSP: 'JudiciaryMSP',
    action: status === 'LEGAL_HOLD' ? 'STATUTORY_FREEZE' : status === 'ACTIVE' ? 'HOLD_LIFTED' : 'CASE_DISPOSITION',
    caseId,
    outcome: 'ALLOW',
    reason: reason || `Judicial order updated case status to ${status}`,
  });
}

export async function getCaseDetails(caseId: string): Promise<Case> {
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/cases?case_id=eq.${encodeURIComponent(caseId)}&select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows[0]) {
        const c = rows[0];
        return {
          case_id: c.case_id || c.id,
          title: c.title,
          description: c.description || '',
          status: c.status || 'ACTIVE',
          classification_ceiling: c.classification_ceiling || 'CONFIDENTIAL',
          owning_msp: c.owning_msp || 'PoliceMSP',
        };
      }
    }
  } catch {}

  // Try backend fallback
  try {
    return await apiFetch<Case>(`/cases/${caseId}`);
  } catch {
    throw new Error(`Case ${caseId} not found`);
  }
}

export async function getCaseTimeline(caseId: string): Promise<{ case_id: string; events: AuditEvent[] }> {
  try {
    const res = await fetch(
      `${SUPABASE_REST_URL}/audit_logs?case_id=eq.${encodeURIComponent(caseId)}&select=*&order=created_at.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (res.ok) {
      const rows = await res.json();
      const events: AuditEvent[] = (rows || []).map((r: any) => ({
        eventId: r.event_id || r.id,
        actorId: r.actor_id || 'System',
        actorRole: r.actor_role || 'SYSTEM',
        actorMSP: r.actor_msp || 'PoliceMSP',
        action: r.action || 'ACCESS',
        caseId: r.case_id || caseId,
        outcome: r.outcome || 'ALLOW',
        reason: r.reason || '',
        timestamp: r.created_at || r.timestamp,
        ledgerTxId: r.ledger_tx_id || '',
      }));
      return { case_id: caseId, events };
    }
  } catch (err) {
    console.warn('Failed to load case timeline from Supabase:', err);
  }

  // Fallback to backend route if available
  try {
    return await apiFetch<{ case_id: string; events: AuditEvent[] }>(`/case-audit/${caseId}`);
  } catch {
    return { case_id: caseId, events: [] };
  }
}

export async function getAllAuditLogs(filter?: {
  case_id?: string;
  action?: string;
  limit?: number;
}): Promise<AuditEvent[]> {
  try {
    let query = `${SUPABASE_REST_URL}/audit_logs?select=*&order=created_at.desc`;
    if (filter?.case_id) query += `&case_id=eq.${encodeURIComponent(filter.case_id)}`;
    if (filter?.action) query += `&action=eq.${encodeURIComponent(filter.action)}`;
    if (filter?.limit) query += `&limit=${filter.limit}`;
    else query += '&limit=50';

    const res = await fetch(query, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (res.ok) {
      const rows = await res.json();
      return (rows || []).map((r: any) => ({
        eventId: r.event_id || r.id,
        actorId: r.actor_id || 'System',
        actorRole: r.actor_role || 'SYSTEM',
        actorMSP: r.actor_msp || 'PoliceMSP',
        action: r.action || 'ACCESS',
        caseId: r.case_id,
        outcome: r.outcome || 'ALLOW',
        reason: r.reason || '',
        timestamp: r.created_at || r.timestamp,
        ledgerTxId: r.ledger_tx_id || '',
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch audit logs from Supabase:', err);
  }

  return [];
}

export async function recordCustodyEvent(params: {
  actorId: string;
  actorRole: string;
  actorMSP?: string;
  action: string;
  caseId: string;
  outcome?: string;
  reason?: string;
  ledgerTxId?: string;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  const randSuffix = Math.random().toString(36).slice(2, 6);
  const timeSuffix = Date.now().toString().slice(-6);

  const payload = {
    id: `aud_${timeSuffix}_${randSuffix}`,
    event_id: `evt_${timeSuffix}_${randSuffix}`,
    actor_id: params.actorId || 'USR-001',
    actor_role: params.actorRole || 'INVESTIGATOR',
    actor_msp: params.actorMSP || 'PoliceMSP',
    action: params.action || 'CUSTODY_TRANSFER',
    case_id: params.caseId || '',
    outcome: params.outcome || 'ALLOW',
    reason: params.reason || 'Evidentiary transfer between agencies',
    raw_query_encrypted: '',
    ledger_tx_id: params.ledgerTxId || '',
    created_at: nowIso,
    updated_at: nowIso,
  };

  try {
    const res = await fetch(`${SUPABASE_REST_URL}/audit_logs`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      console.warn('Supabase audit_logs insert warning:', res.status, errTxt);
    }
  } catch (err) {
    console.warn('recordCustodyEvent error:', err);
  }
}

export async function getIncidents(): Promise<{ total: number; incidents: any[] }> {
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/audit_logs?outcome=eq.DENY&select=*&order=created_at.desc&limit=20`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        total: data.length,
        incidents: data.map((d: any) => ({
          id: d.id,
          failing_check: d.action,
          doc_id: d.case_id,
          status: 'FLAGGED_BLOCKED',
          ledger_tx_id: d.ledger_tx_id || 'TAMPER_ISOLATED',
          created_at: d.created_at,
          reason: d.reason,
        })),
      };
    }
  } catch {}

  try {
    return await apiFetch<{ total: number; incidents: any[] }>('/audit/incidents');
  } catch {
    return { total: 0, incidents: [] };
  }
}
