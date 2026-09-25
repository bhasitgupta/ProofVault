import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Folder,
  Search,
  Lock,
  Unlock,
  Shield,
  Eye,
  Download,
  RefreshCw,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  X,
  Copy,
  Check,
  FileCheck,
  Layers,
  FileSignature,
  FileCode,
  ArrowRightLeft,
  ExternalLink,
  Hash,
  Clock,
  User,
  Building,
  Scale,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getDocuments,
  getDocumentPreview,
  downloadDocumentFile,
  verifyDocument,
  issueCertificate,
} from '../api/documents';
import { getCases, recordCustodyEvent, getCaseTimeline } from '../api/audit';
import { DocumentRecord, DocumentPreview, Case, AuditEvent } from '../lib/types';
import { formatClassificationBadge, formatBytes, truncateHash } from '../lib/format';
import { VerificationBadge } from '../components/VerificationBadge';
import { LedgerTxLink } from '../components/LedgerTxLink';
import { CertificateDialog } from '../components/CertificateDialog';
import { anchorCustodyTransferOnChain } from '../lib/polygon';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Core Data State
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedCase, setSelectedCase] = useState<string>(searchParams.get('case') || '');
  const [selectedClassification, setSelectedClassification] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Preview Drawer Modal
  const [activePreviewDocId, setActivePreviewDocId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<DocumentPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'chunks' | 'verify' | 'custody'>('preview');
  const [copiedText, setCopiedText] = useState(false);
  const [previewCustodyEvents, setPreviewCustodyEvents] = useState<AuditEvent[]>([]);
  const [custodyLoading, setCustodyLoading] = useState(false);

  // Verification & Certificate
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Direct Custody Transfer Modal State
  const [transferModalDoc, setTransferModalDoc] = useState<DocumentRecord | null>(null);
  const [transferTargetMsp, setTransferTargetMsp] = useState('ForensicLabMSP');
  const [transferActorId, setTransferActorId] = useState(user?.id || 'USR-001');
  const [transferReason, setTransferReason] = useState('Forensic analysis & ballistic examination');
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);

  // In-app banner toast — replaces browser alert()
  const [docToast, setDocToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showDocToast = (message: string, type: 'success' | 'error' = 'success') => {
    setDocToast({ message, type });
    setTimeout(() => setDocToast(null), 6000);
  };

  // Clearance label map
  const roleClearance: Record<string, string> = {
    ADMIN: 'SECRET (Tier-3 Full Sovereign Clearance)',
    SUPERVISOR: 'SECRET (Tier-3 Full Sovereign Clearance)',
    FORENSIC_ANALYST: 'SECRET (Tier-3 Full Operational Clearance)',
    INVESTIGATOR: 'CONFIDENTIAL (Tier-2 Operational Clearance)',
    LEGAL_OFFICER: 'CONFIDENTIAL (Tier-2 Judicial Clearance)',
    LAWYER: 'RESTRICTED (Tier-1 Public Evidentiary Clearance)',
  };

  useEffect(() => {
    getCases()
      .then((data) => setCases(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [selectedCase, selectedClassification, selectedDocType, accessibleOnly]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocuments({
        case_id: selectedCase || undefined,
        classification: selectedClassification || undefined,
        doc_type: selectedDocType || undefined,
        accessible_only: accessibleOnly,
      });
      setDocuments(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch forensic evidence records.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered in-memory documents based on searchQuery
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase().trim();
    return documents.filter(
      (doc) =>
        doc.filename.toLowerCase().includes(q) ||
        doc.case_id.toLowerCase().includes(q) ||
        doc.doc_id.toLowerCase().includes(q) ||
        doc.doc_type.toLowerCase().includes(q) ||
        (doc.did && doc.did.toLowerCase().includes(q)) ||
        (doc.crd && doc.crd.toLowerCase().includes(q)) ||
        (doc.chunk_merkle_root && doc.chunk_merkle_root.toLowerCase().includes(q))
    );
  }, [documents, searchQuery]);

  // Telemetry counts
  const totalCount = documents.length;
  const accessibleCount = documents.filter((d) => d.has_access !== false).length;
  const restrictedCount = documents.filter((d) => d.has_access === false).length;
  const anchoredCount = documents.filter((d) => d.ledger_tx_id && d.ledger_tx_id.trim() !== '').length;

  // Handlers
  const handleOpenPreview = async (doc: DocumentRecord) => {
    setActivePreviewDocId(doc.doc_id);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);
    setVerifyResult(null);
    setActiveTab('preview');
    setPreviewCustodyEvents([]);

    try {
      const preview = await getDocumentPreview(doc.doc_id);
      setPreviewData(preview);

      // Also load case custody timeline for the tab
      setCustodyLoading(true);
      const timeline = await getCaseTimeline(doc.case_id);
      setPreviewCustodyEvents(timeline.events || []);
    } catch (err: any) {
      setPreviewError(err.response?.data?.detail || 'Access denied or unable to decrypt evidentiary payload.');
    } finally {
      setPreviewLoading(false);
      setCustodyLoading(false);
    }
  };

  const handleClosePreview = () => {
    setActivePreviewDocId(null);
    setPreviewData(null);
    setPreviewError(null);
  };

  const handleDownload = async (docId: string, filename: string) => {
    setDownloadingId(docId);
    try {
      await downloadDocumentFile(docId, filename);
    } catch (err: any) {
      showDocToast(err.message || 'Failed to download encrypted evidence payload.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleVerify = async (docId: string) => {
    setVerifying(true);
    try {
      const result = await verifyDocument(docId);
      setVerifyResult(result);
    } catch (err: any) {
      showDocToast(err.response?.data?.detail || 'Cryptographic verification request failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleIssueCert = async (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const cert = await issueCertificate(docId);
      setCertData({
        cert_id: cert.certificate_id || cert.cert_id || `CERT-${docId}`,
        doc_id: cert.doc_id || docId,
        pdf_hash: cert.content_hash || cert.pdf_hash || 'SHA-256 Verified',
        issued_at: cert.issued_at || new Date().toISOString(),
        ledger_tx_id: cert.ledger_tx_id || '0x0000000000000000000000000000000000000000',
        download_url: cert.download_url || '#',
      });
      setIsCertOpen(true);
    } catch (err: any) {
      showDocToast(err.response?.data?.detail || 'Failed to generate court-admissible BSA §63 certificate.', 'error');
    }
  };

  const handleCopyPreviewText = () => {
    if (previewData?.preview_text) {
      navigator.clipboard.writeText(previewData.preview_text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleOpenTransferModal = (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransferModalDoc(doc);
    setTransferSuccessMsg(null);
    setTransferReason(`Transfer of ${doc.filename} (${doc.doc_id}) to ${transferTargetMsp} for custody chain`);
  };

  const handleExecuteCustodyTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalDoc) return;
    setTransferSubmitting(true);
    try {
      // Step 1: Enforce on-chain custody transfer on Polygon Amoy via MetaMask wallet popup
      const { txHash } = await anchorCustodyTransferOnChain({
        caseId: transferModalDoc.case_id,
        fromMsp: user?.msp_id || 'PoliceMSP',
        toMsp: transferTargetMsp,
        recipientOfficerId: transferActorId,
        reason: transferReason,
      });

      // Step 2: Record custody event in database
      await recordCustodyEvent({
        actorId: transferActorId,
        actorRole: user?.role || 'INVESTIGATOR',
        actorMSP: user?.msp_id || 'PoliceMSP',
        action: 'CUSTODY_TRANSFER',
        caseId: transferModalDoc.case_id,
        outcome: 'ALLOW',
        reason: `Evidence ${transferModalDoc.doc_id} transferred to ${transferTargetMsp}: ${transferReason}`,
        ledgerTxId: txHash,
      });

      setTransferSuccessMsg(`Custody of ${transferModalDoc.doc_id} anchored on Polygon Amoy! TX: ${txHash.slice(0, 16)}...`);
      setTimeout(() => {
        setTransferModalDoc(null);
        setTransferSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      setTransferSuccessMsg(`Custody transfer failed: ${err.message}`);
    } finally {
      setTransferSubmitting(false);
    }
  };

  const getFileIcon = (docType: string) => {
    switch (docType) {
      case 'FIR':
        return <FileText className="w-5 h-5 text-crimson-800" />;
      case 'FORENSIC_REPORT':
        return <Shield className="w-5 h-5 text-indigo-800" />;
      case 'SEIZURE_MEMO':
        return <FileSignature className="w-5 h-5 text-amber-800" />;
      case 'WITNESS_STATEMENT':
        return <FileText className="w-5 h-5 text-stone-700" />;
      default:
        return <FileCode className="w-5 h-5 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
      {/* In-app notification toast */}
      {docToast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, maxWidth: '420px', animation: 'slideInRight 0.3s ease' }}>
          <div style={{
            background: docToast.type === 'error' ? 'linear-gradient(135deg, #1c1917 0%, #3f1717 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e3a2f 100%)',
            border: docToast.type === 'error' ? '1px solid #ef4444' : '1px solid #22c55e',
            borderRadius: '14px',
            padding: '14px 18px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            color: '#fff',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ flex: 1 }}>{docToast.message}</span>
            <button onClick={() => setDocToast(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          </div>
        </div>
      )}

      {/* ── 1. Bespoke Sovereign Studio Hero Header ────────────────────────── */}
      <div className="bg-white border-2 border-stone-200/90 rounded-3xl p-7 lg:p-9 shadow-sm relative overflow-hidden">
        {/* Subtle Decorative Judicial Watermark */}
        <div className="absolute right-6 -bottom-10 select-none pointer-events-none opacity-5">
          <Scale className="w-72 h-72 text-stone-900" />
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-50 border border-crimson-200 text-crimson-800 text-[11px] font-mono font-bold tracking-wide">
              <Scale className="w-3.5 h-3.5" />
              <span>STATUTORY COMPLIANCE • BHARATIYA SAKSHYA ADHINIYAM §63</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif-judicial font-bold text-stone-950 tracking-tight leading-snug">
              Forensic Evidence Examination Studio
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
              Cryptographically verified repository of court-admissible digital artifacts. Every exhibit is anchored with SHA-256 Merkle proofs, W3C DIDs, and immutably synchronized with the sovereign audit ledger.
            </p>
          </div>

          {/* Quick Metrics & Direct Actions Dock */}
          <div className="flex flex-col sm:flex-row xl:flex-col items-start xl:items-end gap-4 shrink-0">
            {/* Live Telemetry Matrix */}
            <div className="grid grid-cols-3 gap-2.5 p-2 bg-stone-50 border border-stone-200 rounded-2xl font-mono text-center">
              <div className="px-3 py-2 bg-white rounded-xl border border-stone-200/80 shadow-xs">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Exhibits</span>
                <span className="text-base font-bold text-stone-900">{totalCount}</span>
              </div>
              <div className="px-3 py-2 bg-white rounded-xl border border-stone-200/80 shadow-xs">
                <span className="text-[10px] text-emerald-700 uppercase block font-semibold">Accessible</span>
                <span className="text-base font-bold text-emerald-700">{accessibleCount}</span>
              </div>
              <div className="px-3 py-2 bg-white rounded-xl border border-stone-200/80 shadow-xs">
                <span className="text-[10px] text-indigo-700 uppercase block font-semibold">Anchored</span>
                <span className="text-base font-bold text-indigo-700">{anchoredCount}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center gap-2 px-5 py-2.5 bg-crimson-800 hover:bg-crimson-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ingest Evidence Exhibit</span>
              </button>

              <button
                onClick={() => navigate('/incidents')}
                className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4 text-indigo-700" />
                <span>Chain of Custody</span>
              </button>

              <button
                onClick={() => navigate('/dossiers')}
                className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 transition-all cursor-pointer"
              >
                <Building className="w-4 h-4 text-amber-700" />
                <span>Case Dockets</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Studio Workspace Split (Left Filter Console + Right Stage) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Sovereign Filter & Query Matrix (4 cols) ───────── */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono flex items-center gap-2">
                <Search className="w-4 h-4 text-crimson-800" />
                <span>Search & Filter Matrix</span>
              </h2>
              {(selectedCase || selectedClassification || selectedDocType || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCase('');
                    setSelectedClassification('');
                    setSelectedDocType('');
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="text-[11px] font-mono text-crimson-700 hover:underline font-bold"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Keyword Search Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block">
                Evidence Identifier Query
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filename, DOC-ID, DID, CRD, hash..."
                  className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-crimson-700 transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Case Dossier Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block">
                Linked Case Docket
              </label>
              <select
                value={selectedCase}
                onChange={(e) => {
                  setSelectedCase(e.target.value);
                  setSearchParams(e.target.value ? { case: e.target.value } : {});
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-crimson-700 font-mono shadow-xs"
              >
                <option value="">All Judicial Cases ({cases.length})</option>
                {cases.map((c) => (
                  <option key={c.case_id} value={c.case_id}>
                    {c.case_id} — {c.title.slice(0, 32)}...
                  </option>
                ))}
              </select>

              {/* Quick Case Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {cases.slice(0, 4).map((c) => (
                  <button
                    key={c.case_id}
                    onClick={() => {
                      const next = selectedCase === c.case_id ? '' : c.case_id;
                      setSelectedCase(next);
                      setSearchParams(next ? { case: next } : {});
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all border ${
                      selectedCase === c.case_id
                        ? 'bg-crimson-800 text-white border-crimson-800 font-bold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                    }`}
                  >
                    {c.case_id}
                  </button>
                ))}
              </div>
            </div>

            {/* Statutory Classification Ceiling Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block">
                Security Classification Ceiling
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'].map((cls) => {
                  const active = selectedClassification === cls;
                  return (
                    <button
                      key={cls || 'ALL'}
                      onClick={() => setSelectedClassification(cls)}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all border text-center ${
                        active
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {cls || 'ALL LEVELS'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Forensic Artifact Type Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block">
                Evidentiary Artifact Class
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-crimson-700 font-sans shadow-xs"
              >
                <option value="">All Forensic Artifact Types</option>
                <option value="FIR">First Information Report (FIR)</option>
                <option value="FORENSIC_REPORT">Forensic Analysis Report</option>
                <option value="SEIZURE_MEMO">Seizure Memorandum</option>
                <option value="WITNESS_STATEMENT">Witness Statement</option>
                <option value="OTHER">Other Evidentiary Artifact</option>
              </select>
            </div>

            {/* Clearance Security Gate Toggle */}
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <label className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer hover:border-stone-300 transition-colors">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-900 block">Accessible Exhibits Only</span>
                  <span className="text-[10px] text-stone-500 font-sans block">
                    Filter by user clearance level ({user?.role || 'INVESTIGATOR'})
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={accessibleOnly}
                  onChange={(e) => setAccessibleOnly(e.target.checked)}
                  className="rounded border-stone-300 text-crimson-800 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
              </label>
            </div>

            {/* Display Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block">
                Display Format
              </label>
              <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-crimson-900 shadow-xs border border-stone-200/80'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Dossiers</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-crimson-900 shadow-xs border border-stone-200/80'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Registry Table</span>
                </button>
              </div>
            </div>

            {/* Clearance Level Scope Box */}
            <div className="p-3 bg-parchment-100/70 border border-stone-200 rounded-2xl space-y-1 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-stone-500 block">
                Session Clearance Level
              </span>
              <div className="font-bold text-stone-900 font-mono">{user?.role}</div>
              <div className="text-[11px] text-stone-600 font-sans">
                {roleClearance[user?.role || ''] || user?.role}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right Column: Examination Studio Stage (8/9 cols) ───────────── */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-5">
          {/* Active Filter Bar & Results Header */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-stone-500">
                Found <strong className="text-stone-900">{filteredDocuments.length}</strong> matching exhibit{filteredDocuments.length === 1 ? '' : 's'}
              </span>

              {selectedCase && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-crimson-50 border border-crimson-200 text-crimson-900 text-[11px] font-bold">
                  Case: {selectedCase}
                  <button onClick={() => setSelectedCase('')} className="hover:text-crimson-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedClassification && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                  Ceiling: {selectedClassification}
                  <button onClick={() => setSelectedClassification('')} className="hover:text-amber-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedDocType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-300 text-stone-900 text-[11px] font-bold">
                  Type: {selectedDocType}
                  <button onClick={() => setSelectedDocType('')} className="hover:text-stone-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-stone-500">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{accessibleCount} Accessible</span>
              </span>
              {restrictedCount > 0 && (
                <span className="flex items-center gap-1 text-rose-700 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{restrictedCount} Sealed</span>
                </span>
              )}
            </div>
          </div>

          {/* ── Error Banner ─────────────────────────────────────────── */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Evidence Content Render ──────────────────────────────── */}
          {loading ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-16 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-7 h-7 text-crimson-800 animate-spin" />
              <p className="text-xs font-mono text-stone-600 font-semibold">
                Validating cryptographic authorizations & querying evidence vault...
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-stone-300 rounded-3xl p-16 text-center space-y-3">
              <FileText className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="text-base font-serif-judicial font-bold text-stone-900">
                No Evidentiary Artifacts Found
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                {accessibleOnly
                  ? `No exhibits match your search parameters within your clearance level (${user?.role}). Check 'Accessible Exhibits Only' to view sealed files.`
                  : 'No evidence artifacts match the current filter criteria.'}
              </p>
              <button
                onClick={() => {
                  setSelectedCase('');
                  setSelectedClassification('');
                  setSelectedDocType('');
                  setSearchQuery('');
                  setAccessibleOnly(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ── A. Bespoke Forensic Exhibit Dossier Cards ─────────────── */
            <div className="space-y-4">
              {filteredDocuments.map((doc) => {
                const isAccessible = doc.has_access !== false;
                const badge = formatClassificationBadge(doc.classification);

                return (
                  <div
                    key={doc.doc_id}
                    onClick={() => handleOpenPreview(doc)}
                    className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all relative cursor-pointer hover:shadow-md ${
                      isAccessible
                        ? 'border-stone-200 hover:border-crimson-800/50'
                        : 'border-rose-200/70 bg-rose-50/20 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      {/* Left: Tokenized Exhibit Emblem & Icon */}
                      <div className="flex items-start gap-4">
                        <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200/90 shrink-0 relative group">
                          {getFileIcon(doc.doc_type)}
                          {!isAccessible && (
                            <div className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full shadow-xs">
                              <Lock className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        {/* Middle: Details, Identifiers, Metadata */}
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCase(doc.case_id);
                                setSearchParams({ case: doc.case_id });
                              }}
                              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-mono text-[11px] font-bold transition-colors"
                            >
                              {doc.case_id}
                            </span>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text}`}>
                              {doc.classification}
                            </span>

                            <span className="text-[11px] font-mono text-stone-400">•</span>
                            <span className="text-[11px] font-mono text-stone-500 font-semibold">{doc.doc_type}</span>

                            {doc.created_at && (
                              <>
                                <span className="text-[11px] font-mono text-stone-400">•</span>
                                <span className="text-[11px] font-mono text-stone-500">
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-base font-serif-judicial font-bold text-stone-900 group-hover:text-crimson-900 transition-colors">
                            {doc.filename}
                          </h3>

                          {/* Cryptographic Footprint Pills */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
                            <div className="px-2 py-0.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-600">
                              DOC ID: <strong className="text-stone-900">{doc.doc_id}</strong>
                            </div>

                            {doc.did && (
                              <div className="px-2 py-0.5 rounded-lg bg-crimson-50 border border-crimson-200 text-crimson-900 truncate max-w-[190px]" title={doc.did}>
                                DID: <strong className="text-crimson-950">{truncateHash(doc.did, 7, 4)}</strong>
                              </div>
                            )}

                            {doc.crd && (
                              <div className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 truncate max-w-[190px]" title={doc.crd}>
                                CRD: <strong className="text-indigo-950">{truncateHash(doc.crd, 7, 4)}</strong>
                              </div>
                            )}

                            <div className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 truncate max-w-[170px]" title={doc.chunk_merkle_root}>
                              MERKLE: <strong className="text-emerald-950">{truncateHash(doc.chunk_merkle_root, 4, 4)}</strong>
                            </div>

                            <div className="px-2 py-0.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-600">
                              SIZE: <strong className="text-stone-800">{formatBytes(doc.size_bytes)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions Dock */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                        {isAccessible ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPreview(doc);
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-crimson-800 hover:bg-crimson-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                              title="Inspect & Decrypt Evidentiary Payload"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Examine</span>
                            </button>

                            <button
                              onClick={(e) => handleOpenTransferModal(doc, e)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-200 transition-colors"
                              title="Transfer Evidence Custody"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-700" />
                              <span className="hidden xl:inline">Transfer</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerify(doc.doc_id);
                              }}
                              className="p-2 bg-stone-100 hover:bg-stone-200 text-emerald-700 rounded-xl transition-colors border border-stone-200"
                              title="Verify Cryptographic Proofs"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => handleIssueCert(doc.doc_id, e)}
                              className="p-2 bg-stone-100 hover:bg-stone-200 text-amber-800 rounded-xl transition-colors border border-stone-200"
                              title="Issue BSA §63 Electronic Certificate"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(doc.doc_id, doc.filename);
                              }}
                              disabled={downloadingId === doc.doc_id}
                              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors border border-stone-200"
                              title="Download Raw Encrypted Payload"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-mono text-rose-800 font-bold">
                            <Lock className="w-3.5 h-3.5 text-rose-600" />
                            <span>Requires {doc.classification} Clearance</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── B. Sovereign Judicial Ledger Table ─────────────────────── */
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-4 px-5">Evidence Exhibit</th>
                      <th className="py-4 px-4">Case Docket</th>
                      <th className="py-4 px-4">Classification</th>
                      <th className="py-4 px-4">Type</th>
                      <th className="py-4 px-4">Merkle Root</th>
                      <th className="py-4 px-4">Clearance Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredDocuments.map((doc) => {
                      const isAccessible = doc.has_access !== false;
                      const badge = formatClassificationBadge(doc.classification);

                      return (
                        <tr
                          key={doc.doc_id}
                          onClick={() => isAccessible && handleOpenPreview(doc)}
                          className={`transition-colors ${
                            isAccessible
                              ? 'hover:bg-stone-50/80 cursor-pointer'
                              : 'bg-rose-50/20 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          <td className="py-4 px-5 font-sans font-semibold text-stone-900 flex items-center gap-3">
                            <div className="p-2 bg-stone-100 rounded-xl border border-stone-200 shrink-0">
                              {getFileIcon(doc.doc_type)}
                            </div>
                            <div>
                              <div className="truncate max-w-xs font-bold text-stone-900" title={doc.filename}>
                                {doc.filename}
                              </div>
                              <div className="text-[10px] font-mono text-stone-500">
                                {doc.doc_id} • {formatBytes(doc.size_bytes)}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-bold text-stone-900">{doc.case_id}</td>

                          <td className="py-4 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                              {doc.classification}
                            </span>
                          </td>

                          <td className="py-4 px-4 font-sans text-stone-600">{doc.doc_type}</td>

                          <td className="py-4 px-4 text-emerald-800 font-semibold">
                            {truncateHash(doc.chunk_merkle_root, 6, 4)}
                          </td>

                          <td className="py-4 px-4">
                            {isAccessible ? (
                              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accessible
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-rose-700 font-semibold text-[11px]">
                                <Lock className="w-3.5 h-3.5 text-rose-600" /> Sealed ({doc.classification})
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                            {isAccessible ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenPreview(doc)}
                                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors border border-stone-200"
                                  title="Examine Exhibit"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleOpenTransferModal(doc, e)}
                                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-indigo-700 rounded-lg transition-colors border border-stone-200"
                                  title="Transfer Custody"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleVerify(doc.doc_id)}
                                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-emerald-700 rounded-lg transition-colors border border-stone-200"
                                  title="Verify Proofs"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleIssueCert(doc.doc_id, e)}
                                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-amber-800 rounded-lg transition-colors border border-stone-200"
                                  title="Issue BSA Certificate"
                                >
                                  <FileCheck className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDownload(doc.doc_id, doc.filename)}
                                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors border border-stone-200"
                                  title="Download Payload"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-rose-600 font-bold">LOCKED</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── 3. Direct Custody Transfer Modal ───────────────────────────────── */}
      {transferModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-2 border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif-judicial font-bold text-stone-900">
                    Execute Evidence Custody Transfer
                  </h3>
                  <p className="text-[11px] font-mono text-stone-500">
                    Docket: {transferModalDoc.case_id} • Doc: {transferModalDoc.doc_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTransferModalDoc(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-mono space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Custody Event Immutably Recorded</span>
                </div>
                <div>{transferSuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleExecuteCustodyTransfer} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block mb-1">
                    Exhibit Filename & ID
                  </label>
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-800">
                    {transferModalDoc.filename} ({transferModalDoc.doc_id})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block mb-1">
                      Current Agency (From)
                    </label>
                    <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-800">
                      {user?.msp_id || 'PoliceMSP'}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block mb-1">
                      Transferring Target (To)
                    </label>
                    <select
                      value={transferTargetMsp}
                      onChange={(e) => setTransferTargetMsp(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-none focus:border-crimson-800"
                    >
                      <option value="ForensicLabMSP">ForensicLabMSP (Central Lab)</option>
                      <option value="JudiciaryMSP">JudiciaryMSP (Court Repository)</option>
                      <option value="ProsecutionMSP">ProsecutionMSP (State Legal)</option>
                      <option value="SpecialCellMSP">SpecialCellMSP (Anti-Terror Unit)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block mb-1">
                    Transfer Officer ID / DID
                  </label>
                  <input
                    type="text"
                    value={transferActorId}
                    onChange={(e) => setTransferActorId(e.target.value)}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-none focus:border-crimson-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-stone-600 block mb-1">
                    Statutory Reason / Handover Purpose
                  </label>
                  <textarea
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    rows={2}
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 font-sans focus:outline-none focus:border-crimson-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTransferModalDoc(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={transferSubmitting}
                    className="px-5 py-2 bg-crimson-800 hover:bg-crimson-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {transferSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    )}
                    <span>Commit Custody Transfer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Evidence Inspection & Decryption Modal Drawer ────────────────── */}
      {activePreviewDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-2 border-stone-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 bg-white border border-stone-200 rounded-2xl shadow-xs">
                  <FileText className="w-6 h-6 text-crimson-800" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-crimson-900">
                      {previewData?.case_id || 'Case Exhibit'}
                    </span>
                    {previewData && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          formatClassificationBadge(previewData.classification).bg
                        } ${formatClassificationBadge(previewData.classification).text}`}
                      >
                        {previewData.classification}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-serif-judicial font-bold text-stone-950 truncate">
                    {previewData?.filename || 'Decrypting Evidentiary Artifact...'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {previewData && (
                  <button
                    onClick={() => handleDownload(previewData.doc_id, previewData.filename)}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded-xl transition-colors border border-stone-200 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Payload</span>
                  </button>
                )}
                <button
                  onClick={handleClosePreview}
                  className="p-2 hover:bg-stone-200 rounded-xl text-stone-500 hover:text-stone-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tab Strip */}
            <div className="px-6 border-b border-stone-200 bg-stone-100/60 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                  activeTab === 'preview'
                    ? 'border-crimson-800 text-crimson-900 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Decrypted Plaintext & OCR</span>
              </button>

              <button
                onClick={() => setActiveTab('chunks')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                  activeTab === 'chunks'
                    ? 'border-crimson-800 text-crimson-900 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Merkle Chunks ({previewData?.chunk_count || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('verify')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                  activeTab === 'verify'
                    ? 'border-crimson-800 text-crimson-900 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>4-Tier Integrity Suite</span>
              </button>

              <button
                onClick={() => setActiveTab('custody')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
                  activeTab === 'custody'
                    ? 'border-crimson-800 text-crimson-900 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Case Custody Trail ({previewCustodyEvents.length})</span>
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-stone-50/50">
              {previewLoading ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-crimson-800 animate-spin mx-auto" />
                  <p className="text-xs text-stone-600 font-mono">
                    Resolving envelope encryption key from Secure Key Vault & decrypting chunks...
                  </p>
                </div>
              ) : previewError ? (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
                  <div className="font-bold">Decryption & Verification Error</div>
                  <div>{previewError}</div>
                </div>
              ) : previewData ? (
                <>
                  {/* TAB 1: Decrypted Content */}
                  {activeTab === 'preview' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-stone-600">
                        <span className="font-mono text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Decrypted via AES-256-GCM Envelope Encryption</span>
                        </span>
                        <button
                          onClick={handleCopyPreviewText}
                          className="flex items-center gap-1.5 text-xs text-crimson-900 hover:underline font-mono font-bold"
                        >
                          {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedText ? 'Copied to clipboard' : 'Copy Plaintext'}</span>
                        </button>
                      </div>

                      {/* Line-Numbered Evidence Content Window */}
                      <div className="bg-white p-5 rounded-2xl border border-stone-300 font-mono text-xs text-stone-900 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto select-text shadow-xs">
                        {previewData.preview_text || 'No readable textual payload present in this evidentiary artifact.'}
                      </div>

                      {/* Cryptographic Passport Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-4 bg-white rounded-2xl border border-stone-200 text-[11px] font-mono">
                        <div>
                          <span className="text-stone-500 block text-[10px]">DOCUMENT ID:</span>
                          <span className="text-stone-900 font-bold">{previewData.doc_id}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">MERKLE TREE ROOT:</span>
                          <span className="text-emerald-700 font-bold">{truncateHash(previewData.chunk_merkle_root, 8, 8)}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">TOTAL CHUNKS (256KB):</span>
                          <span className="text-stone-900 font-bold">{previewData.chunk_count}</span>
                        </div>
                        {previewData.did && (
                          <div className="sm:col-span-2">
                            <span className="text-stone-500 block text-[10px]">W3C DECENTRALIZED ID (DID):</span>
                            <span className="text-crimson-900 font-bold truncate block">{previewData.did}</span>
                          </div>
                        )}
                        {previewData.crd && (
                          <div>
                            <span className="text-stone-500 block text-[10px]">CRD CONTENT COMMITMENT:</span>
                            <span className="text-indigo-900 font-bold truncate block">{previewData.crd}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Merkle Chunks */}
                  {activeTab === 'chunks' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-600 leading-relaxed font-sans">
                        In adherence with RFC 6962 and Indian Evidence statutory requirements, the bitstream is fragmented into discrete 256KB segments. Each individual chunk is SHA-256 hashed and integrated into the cryptographic root.
                      </div>

                      <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                        {previewData.chunks.map((chunk) => (
                          <div
                            key={chunk.chunk_index}
                            className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2 font-mono text-xs shadow-xs"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-crimson-900">
                                Chunk #{chunk.chunk_index} (Page {chunk.page_number})
                              </span>
                              <span className="text-stone-500">
                                SHA-256: <span className="text-stone-800 font-bold">{chunk.chunk_hash}</span>
                              </span>
                            </div>
                            <div className="text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-200 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                              {chunk.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: 4-Tier Integrity Suite */}
                  {activeTab === 'verify' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-serif-judicial font-bold text-stone-900">
                            4-Tier Zero-Trust Cryptographic Engine
                          </h3>
                          <p className="text-xs text-stone-500 font-sans mt-0.5">
                            Validates chunk hashes, Merkle branch paths, ciphertext digest, and decrypted plaintext equality.
                          </p>
                        </div>
                        <button
                          onClick={() => handleVerify(previewData.doc_id)}
                          disabled={verifying}
                          className="flex items-center gap-1.5 px-4 py-2 bg-crimson-800 hover:bg-crimson-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                          <span>Run Suite</span>
                        </button>
                      </div>

                      {verifyResult ? (
                        <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-xs">
                          <div className="flex items-center justify-between">
                            <VerificationBadge status={verifyResult.overall ? 'VERIFIED' : 'FAILED'} />
                            <span className="font-mono text-xs text-stone-700 font-bold">
                              Status: INTEGRITY INTACT (No Tampering)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-stone-500 block text-[10px]">Tier 1: Chunk Hash</span>
                              <strong className={verifyResult.chunk_hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                                {verifyResult.chunk_hash_ok ? 'PASS' : 'FAIL'}
                              </strong>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-stone-500 block text-[10px]">Tier 2: Merkle Proof</span>
                              <strong className={verifyResult.merkle_proof_ok ? 'text-emerald-700' : 'text-rose-700'}>
                                {verifyResult.merkle_proof_ok ? 'PASS' : 'FAIL'}
                              </strong>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-stone-500 block text-[10px]">Tier 3: Blob Hash</span>
                              <strong className={verifyResult.blob_hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                                {verifyResult.blob_hash_ok ? 'PASS' : 'FAIL'}
                              </strong>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-stone-500 block text-[10px]">Tier 4: Content Hash</span>
                              <strong className={verifyResult.content_hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                                {verifyResult.content_hash_ok ? 'PASS' : 'FAIL'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                          <Shield className="w-8 h-8 text-stone-400 mx-auto" />
                          <p className="text-xs text-stone-600 font-sans">
                            Click "Run Suite" to verify cryptographic integrity across all four tiers against the on-chain Merkle commitment.
                          </p>
                        </div>
                      )}

                      {/* BSA Certificate CTA */}
                      <div className="p-4 bg-white border border-stone-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-stone-900 font-sans">
                            BSA §63 Electronic Evidence Certificate
                          </div>
                          <div className="text-[11px] text-stone-500 font-sans">
                            Official court-admissible certificate issued under the Bharatiya Sakshya Adhiniyam, 2023.
                          </div>
                        </div>
                        <button
                          onClick={() => handleIssueCert(previewData.doc_id)}
                          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0"
                        >
                          <FileCheck className="w-4 h-4 text-amber-400" />
                          <span>Generate BSA §63 Certificate</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Case Custody Timeline */}
                  {activeTab === 'custody' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-600 font-sans">
                          Immutable Chain of Custody events for docket <strong>{previewData.case_id}</strong>:
                        </span>
                        <button
                          onClick={() => navigate(`/incidents?case=${previewData.case_id}`)}
                          className="text-xs text-crimson-800 font-bold hover:underline font-mono"
                        >
                          Open Full Audit Journal →
                        </button>
                      </div>

                      {custodyLoading ? (
                        <div className="py-8 text-center text-xs font-mono text-stone-500">
                          Loading custody history...
                        </div>
                      ) : previewCustodyEvents.length === 0 ? (
                        <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                          No prior custody transfer records registered for this docket.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                          {previewCustodyEvents.map((evt) => (
                            <div
                              key={evt.eventId}
                              className="p-3.5 bg-white border border-stone-200 rounded-xl space-y-1 font-mono text-xs shadow-xs"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-stone-900">{evt.action}</span>
                                <span className="text-stone-500">{evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Recent'}</span>
                              </div>
                              <div className="text-stone-700 text-[11px] font-sans">
                                <strong>{evt.actorId}</strong> ({evt.actorMSP || 'PoliceMSP'}): {evt.reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono text-stone-600">
                <span>EVM Anchor:</span>
                <LedgerTxLink txId={previewData?.ledger_tx_id || ''} contract="EvidenceRegistry" />
              </div>
              <div className="flex items-center gap-2">
                {previewData && (
                  <button
                    onClick={() => handleDownload(previewData.doc_id, previewData.filename)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Payload</span>
                  </button>
                )}
                <button
                  onClick={handleClosePreview}
                  className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 rounded-xl font-semibold transition-colors border border-stone-200 shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BSA §63 Electronic Certificate Dialog */}
      <CertificateDialog
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        certData={certData}
      />
    </div>
  );
};

export default DocumentsPage;
