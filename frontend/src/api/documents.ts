import { apiFetch } from './client';
import { DocumentRecord } from '../lib/types';

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
  return apiFetch<DocumentRecord>(`/documents/${docId}`);
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
  const params = new URLSearchParams();
  if (filters.case_id) params.append('case_id', filters.case_id);
  if (filters.classification) params.append('classification', filters.classification);
  if (filters.doc_type) params.append('doc_type', filters.doc_type);
  if (filters.search) params.append('search', filters.search);
  if (filters.accessible_only !== undefined) params.append('accessible_only', String(filters.accessible_only));

  const query = params.toString();
  return apiFetch<DocumentRecord[]>(`/documents${query ? `?${query}` : ''}`);
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
