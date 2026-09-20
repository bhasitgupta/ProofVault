import { apiFetch } from './client';
import { DocumentRecord } from '../lib/types';

const SUPABASE_REST_URL = 'https://kraxwwwkhprczuiqkxuw.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'sb_publishable_yBEvcnfdSVjN_5ZlxSw_5w_bDe53Czq';

export async function uploadDocument(formData: FormData): Promise<any> {
  const token = localStorage.getItem('sdms_token');
  const response = await fetch('/api/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Upload failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  return response.json();
}

export async function getDocument(docId: string): Promise<DocumentRecord> {
  try {
    return await apiFetch<DocumentRecord>(`/documents/${docId}`);
  } catch (backendErr) {
    const res = await fetch(`${SUPABASE_REST_URL}/documents?id=eq.${encodeURIComponent(docId)}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows[0]) {
        const d = rows[0];
        return {
          doc_id: d.id || d.doc_id,
          case_id: d.case_id,
          filename: d.filename,
          content_hash: d.content_hash,
          blob_hash: d.blob_hash,
          chunk_merkle_root: d.chunk_merkle_root,
          chunk_count: d.chunk_count,
          size_bytes: d.size_bytes,
          mime_type: d.mime_type,
          doc_type: d.doc_type,
          classification: d.classification,
          uploader_id: d.uploader_id,
          ledger_tx_id: d.ledger_tx_id,
          status: d.status,
          created_at: d.created_at,
        } as DocumentRecord;
      }
    }
    throw backendErr;
  }
}

export async function verifyDocument(docId: string): Promise<any> {
  return apiFetch<any>(`/verify/${docId}`);
}

export async function issueCertificate(docId: string): Promise<any> {
  return apiFetch<any>(`/certificates/${docId}`, {
    method: 'POST',
  });
}

export interface GetDocumentsFilter {
  case_id?: string;
  classification?: string;
  doc_type?: string;
  search?: string;
  accessible_only?: boolean;
}

export async function getDocuments(filters: GetDocumentsFilter = {}): Promise<DocumentRecord[]> {
  try {
    const params = new URLSearchParams();
    if (filters.case_id) params.append('case_id', filters.case_id);
    if (filters.classification) params.append('classification', filters.classification);
    if (filters.doc_type) params.append('doc_type', filters.doc_type);
    if (filters.search) params.append('search', filters.search);
    if (filters.accessible_only !== undefined) params.append('accessible_only', String(filters.accessible_only));

    const query = params.toString();
    return await apiFetch<DocumentRecord[]>(`/documents${query ? `?${query}` : ''}`);
  } catch (backendErr) {
    console.warn('Backend documents endpoint unavailable, querying Supabase cloud DB:', backendErr);
    try {
      let supaQuery = `${SUPABASE_REST_URL}/documents?select=*`;
      if (filters.case_id) supaQuery += `&case_id=eq.${encodeURIComponent(filters.case_id)}`;
      if (filters.classification) supaQuery += `&classification=eq.${encodeURIComponent(filters.classification)}`;
      const res = await fetch(supaQuery, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        return (rows || []).map((d: any) => ({
          doc_id: d.id || d.doc_id,
          case_id: d.case_id,
          filename: d.filename,
          content_hash: d.content_hash,
          blob_hash: d.blob_hash,
          chunk_merkle_root: d.chunk_merkle_root,
          chunk_count: d.chunk_count,
          size_bytes: d.size_bytes,
          mime_type: d.mime_type,
          doc_type: d.doc_type,
          classification: d.classification,
          uploader_id: d.uploader_id,
          ledger_tx_id: d.ledger_tx_id,
          status: d.status,
          created_at: d.created_at,
        }));
      }
    } catch {}
    return [];
  }
}

export async function getDocumentPreview(docId: string): Promise<import('../lib/types').DocumentPreview> {
  return apiFetch<import('../lib/types').DocumentPreview>(`/documents/${docId}/preview`);
}

export async function downloadDocumentFile(docId: string, filename: string): Promise<void> {
  const token = localStorage.getItem('sdms_token');
  const response = await fetch(`/api/v1/documents/${docId}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    let err = 'Download failed';
    try {
      const data = await response.json();
      err = data.detail || err;
    } catch {}
    throw new Error(err);
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
