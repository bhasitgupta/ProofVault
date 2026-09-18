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
  ShieldAlert,
  Layers,
  FileSignature,
  FileCode,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDocuments, getDocumentPreview, downloadDocumentFile, verifyDocument, issueCertificate } from '../api/documents';
import { getCases } from '../api/audit';
import { DocumentRecord, DocumentPreview, Case } from '../lib/types';
import { formatClassificationBadge, formatBytes, truncateHash } from '../lib/format';
import { VerificationBadge } from '../components/VerificationBadge';
import { LedgerTxLink } from '../components/LedgerTxLink';
import { CertificateDialog } from '../components/CertificateDialog';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
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
  const [activeTab, setActiveTab] = useState<'preview' | 'chunks' | 'verify'>('preview');
  const [copiedText, setCopiedText] = useState(false);

  // Verification & Certificate
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Clearance label map
  const roleClearance: Record<string, string> = {
    ADMIN: 'SECRET (Level 3 - Full Operational Access)',
    SUPERVISOR: 'SECRET (Level 3 - Full Operational Access)',
    FORENSIC_ANALYST: 'SECRET (Level 3 - Full Operational Access)',
    INVESTIGATOR: 'CONFIDENTIAL (Level 2 - Restricted & Confidential)',
    LEGAL_OFFICER: 'CONFIDENTIAL (Level 2 - Restricted & Confidential)',
    LAWYER: 'RESTRICTED (Level 1 - Restricted Only)',
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
      setError(err.response?.data?.detail || 'Failed to fetch evidence documents.');
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
        doc.doc_type.toLowerCase().includes(q)
    );
  }, [documents, searchQuery]);

  // Counts
  const accessibleCount = documents.filter((d) => d.has_access !== false).length;
  const restrictedCount = documents.filter((d) => d.has_access === false).length;

  // Handlers
  const handleOpenPreview = async (doc: DocumentRecord) => {
    setActivePreviewDocId(doc.doc_id);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);
    setVerifyResult(null);
    setActiveTab('preview');

    try {
      const preview = await getDocumentPreview(doc.doc_id);
      setPreviewData(preview);
    } catch (err: any) {
      setPreviewError(err.response?.data?.detail || 'Access denied or unable to decrypt preview.');
    } finally {
      setPreviewLoading(false);
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
      alert(err.message || 'Failed to download encrypted evidence payload.');
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
      alert(err.response?.data?.detail || 'Verification request failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleIssueCert = async (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const cert = await issueCertificate(docId);
      setCertData(cert);
      setIsCertOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate BSA §63 certificate.');
    }
  };

  const handleCopyPreviewText = () => {
    if (previewData?.preview_text) {
      navigator.clipboard.writeText(previewData.preview_text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const getFileIcon = (docType: string) => {
    switch (docType) {
      case 'FIR':
        return <FileText className="w-5 h-5 text-crimson-700" />;
      case 'FORENSIC_REPORT':
        return <Shield className="w-5 h-5 text-mahogany-700" />;
      case 'SEIZURE_MEMO':
        return <FileSignature className="w-5 h-5 text-amber-700" />;
      case 'WITNESS_STATEMENT':
        return <FileText className="w-5 h-5 text-stone-700" />;
      default:
        return <FileCode className="w-5 h-5 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Role Clearance Banner ─────────────────────── */}
      <div className="glass-ivory border-crimson-gold rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-crimson-50 border border-crimson-200 rounded-xl">
              <Folder className="w-6 h-6 text-crimson-800" />
            </div>
            <div>
              <h1 className="text-2xl font-serif-judicial font-bold tracking-tight text-stone-900 flex items-center gap-2">
                Evidence Files Explorer
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                Role-gated repository browser with cryptographic zero-trust verification.
              </p>
            </div>
          </div>
        </div>

        {/* User Role & Clearance Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-parchment-100 border border-stone-200 text-xs font-mono shadow-sm">
            <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Active Clearance Scope</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-crimson-800">{user?.role}</span>
              <span className="text-stone-400">•</span>
              <span className="text-emerald-700 font-semibold">{roleClearance[user?.role || ''] || user?.role}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-1.5 px-4 py-2 bg-crimson-800 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-crimson-900/10 transition-all"
          >
            <Folder className="w-4 h-4" />
            <span>Ingest File</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar & View Controls ─────────────────────────────── */}
      <div className="glass-ivory rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 border border-stone-200/80">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files by name, case ID, or document ID..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-crimson-700 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Toggles & Accessible-Only Switch */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Role Access Filter Toggle */}
            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-stone-200 hover:border-stone-300 shadow-sm">
              <input
                type="checkbox"
                checked={accessibleOnly}
                onChange={(e) => setAccessibleOnly(e.target.checked)}
                className="rounded border-stone-300 text-crimson-700 focus:ring-0 focus:ring-offset-0"
              />
              <span className="flex items-center gap-1.5">
                {accessibleOnly ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{accessibleOnly ? 'Accessible Only' : 'Show Locked Files'}</span>
              </span>
            </label>

            {/* Grid / Table View Switch */}
            <div className="flex items-center bg-parchment-200 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-crimson-800 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-crimson-800 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Case Filter */}
            <select
              value={selectedCase}
              onChange={(e) => {
                setSelectedCase(e.target.value);
                setSearchParams(e.target.value ? { case: e.target.value } : {});
              }}
              className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-stone-700 text-xs focus:outline-none focus:border-crimson-700 font-mono shadow-sm"
            >
              <option value="">All Cases ({cases.length})</option>
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id}>
                  {c.case_id} — {c.title}
                </option>
              ))}
            </select>

            {/* Classification Filter */}
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-stone-700 text-xs focus:outline-none focus:border-crimson-700 shadow-sm"
            >
              <option value="">All Classifications</option>
              <option value="RESTRICTED">RESTRICTED</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              <option value="SECRET">SECRET</option>
            </select>

            {/* Doc Type Filter */}
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-stone-700 text-xs focus:outline-none focus:border-crimson-700 shadow-sm"
            >
              <option value="">All Document Types</option>
              <option value="FIR">First Information Report (FIR)</option>
              <option value="FORENSIC_REPORT">Forensic Report</option>
              <option value="SEIZURE_MEMO">Seizure Memorandum</option>
              <option value="WITNESS_STATEMENT">Witness Statement</option>
            </select>

            {(selectedCase || selectedClassification || selectedDocType) && (
              <button
                onClick={() => {
                  setSelectedCase('');
                  setSelectedClassification('');
                  setSelectedDocType('');
                  setSearchParams({});
                }}
                className="text-crimson-700 hover:text-crimson-800 hover:underline text-xs flex items-center gap-1 ml-1 font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Count Breakdown */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-stone-600">
            <span>Showing <strong>{filteredDocuments.length}</strong> files</span>
            <span className="text-stone-300">•</span>
            <span className="text-emerald-700 font-semibold">✓ {accessibleCount} accessible</span>
            {restrictedCount > 0 && (
              <>
                <span className="text-stone-300">•</span>
                <span className="text-rose-700 font-semibold">✕ {restrictedCount} locked</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Documents Content ──────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-6 h-6 text-crimson-700 animate-spin" />
          <span className="text-stone-500 text-xs font-mono">Evaluating cryptographic permissions & loading files...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="glass-ivory rounded-2xl p-12 text-center space-y-3 border border-stone-200">
          <FileText className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-sm font-serif-judicial font-bold text-stone-800">No Evidence Documents Found</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            {accessibleOnly
              ? `No accessible documents found matching your filter criteria within your clearance level (${user?.role}).`
              : 'No documents match the specified search and filter criteria.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ─────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => {
            const isAccessible = doc.has_access !== false;
            const badge = formatClassificationBadge(doc.classification);

            return (
              <div
                key={doc.doc_id}
                onClick={() => handleOpenPreview(doc)}
                className={`glass-ivory glass-ivory-hover rounded-2xl p-5 flex flex-col justify-between transition-all group relative cursor-pointer border ${
                  isAccessible
                    ? 'border-stone-200 hover:border-crimson-700/40'
                    : 'border-rose-200/60 bg-stone-50/80 opacity-70 hover:opacity-90'
                }`}
              >
                {/* Lock Overlay for Restricted Files */}
                {!isAccessible && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold">
                    <Lock className="w-3 h-3" />
                    <span>LOCKED</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Top: Icon + Case Tag + Classification Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 bg-parchment-100 border border-stone-200 rounded-xl group-hover:border-crimson-600/30 transition-colors">
                      {getFileIcon(doc.doc_type)}
                    </div>
                    {isAccessible && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg} ${badge.text}`}>
                        {doc.classification}
                      </span>
                    )}
                  </div>

                  {/* File Title & Case */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-crimson-800 font-semibold mb-0.5">
                      <span>{doc.case_id}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-500">{doc.doc_type}</span>
                    </div>
                    <h3
                      className={`text-sm font-semibold truncate transition-colors ${
                        isAccessible ? 'text-stone-900 group-hover:text-crimson-800' : 'text-stone-500'
                      }`}
                      title={doc.filename}
                    >
                      {doc.filename}
                    </h3>
                  </div>

                  {/* Cryptographic Footprint Preview */}
                  <div className="p-2.5 rounded-xl bg-parchment-100/70 border border-stone-200/70 space-y-1 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-stone-500">
                      <span>DOC ID:</span>
                      <span className="text-stone-700">{truncateHash(doc.doc_id, 4, 4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-500">
                      <span>MERKLE:</span>
                      <span className="text-emerald-700 font-semibold truncate max-w-[120px]" title={doc.chunk_merkle_root}>
                        {truncateHash(doc.chunk_merkle_root, 4, 4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-stone-500">
                      <span>SIZE:</span>
                      <span className="text-stone-700">{formatBytes(doc.size_bytes)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 mt-3 border-t border-stone-200/80 flex items-center justify-between gap-1.5">
                  {isAccessible ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPreview(doc);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-parchment-100 hover:bg-parchment-200 text-stone-700 hover:text-stone-900 rounded-lg text-xs font-semibold transition-colors border border-stone-200"
                        title="Decrypted View"
                      >
                        <Eye className="w-3.5 h-3.5 text-crimson-700" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(doc.doc_id, doc.filename);
                        }}
                        disabled={downloadingId === doc.doc_id}
                        className="p-1.5 bg-parchment-100 hover:bg-parchment-200 text-stone-700 hover:text-stone-900 rounded-lg transition-colors border border-stone-200"
                        title="Download Payload"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerify(doc.doc_id);
                        }}
                        className="p-1.5 bg-parchment-100 hover:bg-parchment-200 text-stone-700 hover:text-stone-900 rounded-lg transition-colors border border-stone-200"
                        title="Verify Merkle Proof"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      </button>

                      <button
                        onClick={(e) => handleIssueCert(doc.doc_id, e)}
                        className="p-1.5 bg-parchment-100 hover:bg-parchment-200 text-stone-700 hover:text-stone-900 rounded-lg transition-colors border border-stone-200"
                        title="Issue BSA §63 Certificate"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono text-rose-700 flex items-center gap-1 mx-auto py-1">
                      <Lock className="w-3 h-3" /> Requires {doc.classification} Clearance
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table View ────────────────────────────────────────────── */
        <div className="glass-ivory rounded-2xl overflow-hidden shadow-sm border border-stone-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-parchment-200/80 border-b border-stone-200 text-stone-600 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Evidence File</th>
                  <th className="py-3.5 px-3">Case ID</th>
                  <th className="py-3.5 px-3">Classification</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Size</th>
                  <th className="py-3.5 px-3">Merkle Root</th>
                  <th className="py-3.5 px-3">Access Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredDocuments.map((doc) => {
                  const isAccessible = doc.has_access !== false;
                  const badge = formatClassificationBadge(doc.classification);

                  return (
                    <tr
                      key={doc.doc_id}
                      onClick={() => isAccessible && handleOpenPreview(doc)}
                      className={`transition-colors ${
                        isAccessible
                          ? 'hover:bg-parchment-100/80 cursor-pointer'
                          : 'bg-rose-50/40 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-sans font-semibold text-stone-900 flex items-center gap-2.5">
                        <div className="p-1.5 bg-parchment-100 rounded-lg border border-stone-200 shrink-0">
                          {getFileIcon(doc.doc_type)}
                        </div>
                        <span className="truncate max-w-xs" title={doc.filename}>
                          {doc.filename}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-crimson-800 font-bold">{doc.case_id}</td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg} ${badge.text}`}>
                          {doc.classification}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-stone-600">{doc.doc_type}</td>
                      <td className="py-3.5 px-3 text-stone-600">{formatBytes(doc.size_bytes)}</td>
                      <td className="py-3.5 px-3 text-stone-600 truncate max-w-[120px]" title={doc.chunk_merkle_root}>
                        {truncateHash(doc.chunk_merkle_root, 4, 4)}
                      </td>
                      <td className="py-3.5 px-3">
                        {isAccessible ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Accessible
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-700 font-semibold text-[10px]" title={doc.access_reason}>
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {isAccessible ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenPreview(doc)}
                              className="p-1.5 bg-parchment-100 hover:bg-parchment-200 text-stone-700 rounded-lg transition-colors border border-stone-200"
                              title="Preview Content"
                            >
                              <Eye className="w-3.5 h-3.5 text-crimson-700" />
                            </button>
                            <button
                              onClick={() => handleDownload(doc.doc_id, doc.filename)}
                              className="p-1.5 bg-parchment-100 hover:bg-parchment-200 text-stone-700 rounded-lg transition-colors border border-stone-200"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleVerify(doc.doc_id)}
                              className="p-1.5 bg-parchment-100 hover:bg-parchment-200 text-stone-700 rounded-lg transition-colors border border-stone-200"
                              title="Verify Merkle Proof"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-rose-700">Forbidden</span>
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

      {/* ── Document Preview & Inspection Modal Drawer ─────────────── */}
      {activePreviewDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between gap-3 bg-parchment-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-white border border-stone-200 rounded-xl shadow-sm">
                  <FileText className="w-5 h-5 text-crimson-800" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-crimson-800 font-bold">
                      {previewData?.case_id || 'Case Evidence'}
                    </span>
                    {previewData && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          formatClassificationBadge(previewData.classification).bg
                        } ${formatClassificationBadge(previewData.classification).text}`}
                      >
                        {previewData.classification}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-serif-judicial font-bold text-stone-900 truncate">
                    {previewData?.filename || 'Loading evidence...'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewData && (
                  <button
                    onClick={() => handleDownload(previewData.doc_id, previewData.filename)}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-parchment-100 text-stone-800 text-xs font-semibold rounded-lg transition-colors border border-stone-200 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}
                <button
                  onClick={handleClosePreview}
                  className="p-2 hover:bg-parchment-200 rounded-lg text-stone-500 hover:text-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="px-5 border-b border-stone-200 bg-parchment-50 flex items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'preview'
                    ? 'border-crimson-800 text-crimson-800 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Decrypted Content</span>
              </button>

              <button
                onClick={() => setActiveTab('chunks')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'chunks'
                    ? 'border-crimson-800 text-crimson-800 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Merkle Chunks ({previewData?.chunk_count || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('verify')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'verify'
                    ? 'border-crimson-800 text-crimson-800 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>4-Tier Integrity Verification</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
              {previewLoading ? (
                <div className="py-16 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-crimson-700 animate-spin mx-auto" />
                  <p className="text-xs text-stone-500 font-mono">Decrypting payload from Vault & assembling verified chunks...</p>
                </div>
              ) : previewError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {previewError}
                </div>
              ) : previewData ? (
                <>
                  {/* TAB 1: Decrypted Content */}
                  {activeTab === 'preview' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="font-mono text-[11px]">
                          Cryptographically Decrypted via AES-256-GCM Envelope Key
                        </span>
                        <button
                          onClick={handleCopyPreviewText}
                          className="flex items-center gap-1 text-xs text-crimson-800 hover:underline font-mono font-semibold"
                        >
                          {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedText ? 'Copied to clipboard' : 'Copy text'}</span>
                        </button>
                      </div>

                      <div className="bg-parchment-50 p-4 rounded-xl border border-stone-200 font-mono text-xs text-stone-900 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto select-text shadow-inner">
                        {previewData.preview_text || 'No readable text content available for this artifact.'}
                      </div>

                      {/* Cryptographic Footprint */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-parchment-100 rounded-xl border border-stone-200 text-[11px] font-mono">
                        <div>
                          <span className="text-stone-500">Document ID:</span>{' '}
                          <span className="text-stone-800">{previewData.doc_id}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Chunk Merkle Root:</span>{' '}
                          <span className="text-emerald-700 font-bold">{truncateHash(previewData.chunk_merkle_root, 8, 8)}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Plaintext SHA-256:</span>{' '}
                          <span className="text-stone-800">{truncateHash(previewData.content_hash, 8, 8)}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Ciphertext SHA-256:</span>{' '}
                          <span className="text-stone-800">{truncateHash(previewData.blob_hash, 8, 8)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Merkle Chunks */}
                  {activeTab === 'chunks' && (
                    <div className="space-y-3">
                      <div className="text-xs text-stone-600 leading-relaxed">
                        Every evidence page is split into deterministic chunks. Each chunk is hashed with SHA-256 and committed to the on-chain Merkle tree root ({previewData.chunk_merkle_root}).
                      </div>

                      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                        {previewData.chunks.map((chunk) => (
                          <div
                            key={chunk.chunk_index}
                            className="bg-parchment-50 p-3.5 rounded-xl border border-stone-200 space-y-2 font-mono text-xs"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-crimson-800">
                                Chunk #{chunk.chunk_index} (Page {chunk.page_number})
                              </span>
                              <span className="text-stone-500">
                                SHA: <span className="text-stone-700">{truncateHash(chunk.chunk_hash, 8, 8)}</span>
                              </span>
                            </div>
                            <div className="text-stone-800 bg-white p-2.5 rounded-lg border border-stone-200 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                              {chunk.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: 4-Tier Integrity Suite */}
                  {activeTab === 'verify' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-serif-judicial font-bold text-stone-900">4-Tier Zero-Trust Integrity Verification</h3>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Verifies on-chain Merkle root, chunk hashes, ciphertext blob, and plaintext consistency.
                          </p>
                        </div>
                        <button
                          onClick={() => handleVerify(previewData.doc_id)}
                          disabled={verifying}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-crimson-800 hover:bg-crimson-700 text-white text-xs font-semibold rounded-lg transition-colors shadow"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                          <span>Run Suite</span>
                        </button>
                      </div>

                      {verifyResult ? (
                        <div
                          className={`p-4 rounded-xl border space-y-3 ${
                            verifyResult.overall
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-rose-50 border-rose-300 animate-pulse'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <VerificationBadge status={verifyResult.overall ? 'VERIFIED' : 'FAILED'} />
                            <span className="font-mono text-xs text-stone-600">Status: PASS (No Tamper Detected)</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                            <div className="p-2.5 bg-white rounded-lg border border-stone-200 shadow-sm">
                              <span className="text-stone-500 block text-[10px]">Tier 1: Chunk Hash</span>
                              <strong className={verifyResult.chunk_hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                                {verifyResult.chunk_hash_ok ? 'PASS' : 'FAIL'}
                              </strong>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-stone-200 shadow-sm">
                              <span className="text-stone-500 block text-[10px]">Tier 2: Merkle Proof</span>
                              <strong className={verifyResult.merkle_proof_ok ? 'text-emerald-700' : 'text-rose-700'}>
                                {verifyResult.merkle_proof_ok ? 'PASS' : 'FAIL'}
                              </strong>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-stone-200 shadow-sm">
                              <span className="text-stone-500 block text-[10px]">Tier 3: Blob Hash</span>
                              <strong className={verifyResult.blob_hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                                {verifyResult.blob_hash_ok ? 'PASS' : 'FAIL'}
                              </strong>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-stone-200 shadow-sm">
                              <span className="text-stone-500 block text-[10px]">Tier 4: Content Hash</span>
                              <strong className={verifyResult.content_hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                                {verifyResult.content_hash_ok ? 'PASS' : 'FAIL'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-parchment-50 p-6 rounded-xl border border-stone-200 text-center space-y-2">
                          <Shield className="w-8 h-8 text-stone-400 mx-auto" />
                          <p className="text-xs text-stone-600">
                            Click "Run Suite" to re-verify cryptographic integrity across all four tiers against the on-chain ledger.
                          </p>
                        </div>
                      )}

                      {/* BSA Certificate Button */}
                      <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-stone-900">BSA §63 Electronic Evidence Certificate</div>
                          <div className="text-[11px] text-stone-500">Generate court-admissible certificate under Bharatiya Sakshya Adhiniyam.</div>
                        </div>
                        <button
                          onClick={() => handleIssueCert(previewData.doc_id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-mahogany-800 hover:bg-mahogany-700 text-white text-xs font-semibold rounded-lg transition-colors shadow"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Generate BSA Certificate</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-parchment-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono text-stone-600">
                <span>Ledger Tx:</span>
                <LedgerTxLink txId={previewData?.ledger_tx_id || ''} channel="dochash-channel" />
              </div>
              <button
                onClick={handleClosePreview}
                className="px-4 py-1.5 bg-white hover:bg-parchment-200 text-stone-800 rounded-lg font-semibold transition-colors border border-stone-200 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BSA §63 Certificate Dialog */}
      <CertificateDialog
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        certData={certData}
      />
    </div>
  );
};
export default DocumentsPage;
