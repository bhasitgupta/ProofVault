export type UserRole =
  | 'LAWYER'
  | 'INVESTIGATOR'
  | 'FORENSIC_ANALYST'
  | 'LEGAL_OFFICER'
  | 'SUPERVISOR'
  | 'ADMIN';

export type ClassificationLevel = 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';

export interface User {
  id: string;
  username: string;
  address?: string;
  role: UserRole;
  msp_id: string;
  mfa_verified: boolean;
  live_case_ids: string[];
}

export interface Case {
  case_id: string;
  title: string;
  description?: string;
  status: string;
  classification_ceiling: ClassificationLevel;
  owning_msp?: string;
  active_document_count?: number;
}

export interface DocumentRecord {
  doc_id: string;
  case_id: string;
  filename: string;
  content_hash: string;
  blob_hash: string;
  chunk_merkle_root: string;
  chunk_count: number;
  doc_type: string;
  classification: ClassificationLevel;
  size_bytes: number;
  status: string;
  ledger_tx_id: string;
  created_at?: string;
  has_access?: boolean;
  access_reason?: string;
  did?: string;
  crd?: string;
  thumbnail_url?: string;
  ocr_preview?: string;
}

export interface DocumentChunk {
  chunk_index: number;
  chunk_hash: string;
  page_number: number;
  text: string;
}

export interface DocumentPreview {
  doc_id: string;
  case_id: string;
  filename: string;
  classification: ClassificationLevel;
  doc_type: string;
  size_bytes: number;
  content_hash: string;
  blob_hash: string;
  chunk_merkle_root: string;
  ledger_tx_id: string;
  created_at?: string;
  preview_text: string;
  chunk_count: number;
  chunks: DocumentChunk[];
  did?: string;
  crd?: string;
  thumbnail_url?: string;
}

export interface Citation {
  doc_id: string;
  chunk_index: number;
  page_number?: number;
  chunk_hash?: string;
  ledger_tx_id?: string;
  verification_status: 'VERIFIED' | 'FAILED' | 'TAMPERED';
}

export interface AccessInfo {
  current_user: {
    user_id: string;
    role: string;
    clearance: string;
    assigned_cases: string[];
    permitted_classifications: string[];
  };
  content_access: {
    highest_classification_retrieved: string;
    roles_with_access: string[];
    roles_restricted: string[];
  };
}

export interface QueryResponse {
  answer: string | null;
  citations: Citation[];
  tamper_detected: boolean;
  tamper_quarantined?: boolean;
  tamper_alert_tx?: string;
  scope_note?: string;
  timings_ms?: Record<string, number>;
  message?: string;
  access_info?: AccessInfo;
  provider_tier?: string;
  model_used?: string;
}

export interface AuditEvent {
  eventId: string;
  actorId: string;
  actorRole: string;
  actorMSP: string;
  action: string;
  caseId?: string;
  docIds?: string[];
  outcome: string;
  reason?: string;
  timestamp?: string;
  ledgerTxId?: string;
}
