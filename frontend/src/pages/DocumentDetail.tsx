import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Shield, FileCheck, Download, History, ArrowLeft, RefreshCw } from 'lucide-react';
import { getDocument, verifyDocument, issueCertificate } from '../api/documents';
import { DocumentRecord } from '../lib/types';
import { formatClassificationBadge, formatBytes } from '../lib/format';
import { VerificationBadge } from '../components/VerificationBadge';
import { LedgerTxLink } from '../components/LedgerTxLink';
import { CertificateDialog } from '../components/CertificateDialog';

export const DocumentDetailPage: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [certData, setCertData] = useState<any>(null);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (docId) {
      loadDoc(docId);
    }
  }, [docId]);

  const loadDoc = async (id: string) => {
    try {
      const data = await getDocument(id);
      setDoc(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load document metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!docId) return;
    setVerifying(true);
    try {
      const res = await verifyDocument(docId);
      setVerifyResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Integrity verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleIssueCert = async () => {
    if (!docId) return;
    try {
      const res = await issueCertificate(docId);
      setCertData(res);
      setIsCertOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Certificate issuance failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="w-6 h-6 text-crimson-700 animate-spin" />
        <span className="text-stone-500 text-xs font-mono">Loading evidence dossier...</span>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="glass-ivory rounded-2xl p-8 text-center space-y-3 border border-rose-200">
        <h2 className="text-rose-700 font-bold text-sm">Document not found or clearance insufficient.</h2>
        <button
          onClick={() => navigate('/documents')}
          className="text-xs text-crimson-800 hover:underline font-semibold"
        >
          Return to Documents Explorer
        </button>
      </div>
    );
  }

  const badge = formatClassificationBadge(doc.classification);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Dossiers</span>
      </button>

      {/* Header Banner */}
      <div className="glass-ivory border-crimson-gold rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-crimson-800 font-bold">{doc.case_id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg} ${badge.text}`}>
              {doc.classification}
            </span>
            <span className="text-[10px] text-stone-600 bg-parchment-100 px-2 py-0.5 rounded-lg font-mono border border-stone-200">
              {doc.doc_type}
            </span>
          </div>
          <h1 className="text-xl font-serif-judicial font-bold tracking-tight text-stone-900 flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-crimson-800" />
            <span>{doc.filename}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-parchment-100 text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-crimson-800 ${verifying ? 'animate-spin' : ''}`} />
            <span>Verify Integrity</span>
          </button>
          <button
            onClick={handleIssueCert}
            className="flex items-center gap-1.5 px-4 py-2 bg-mahogany-800 hover:bg-mahogany-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-amber-900/10"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Issue BSA §63</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      {/* 4-Tier Verification Card */}
      {verifyResult && (
        <div className={`p-5 rounded-2xl border space-y-3 shadow-sm ${
          verifyResult.overall ? 'bg-emerald-50/80 border-emerald-300' : 'bg-rose-50/80 border-rose-300 animate-pulse'
        }`}>
          <div className="flex items-center justify-between">
            <VerificationBadge status={verifyResult.overall ? 'VERIFIED' : 'FAILED'} />
            <span className="font-mono text-xs text-stone-600">4-Tier Verification Engine</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs font-mono">
            <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-sm">
              <span className="text-stone-500 block text-[10px]">Tier 1: Chunk Hash</span>
              <strong className={verifyResult.chunk_hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                {verifyResult.chunk_hash_ok ? 'PASS' : 'FAIL'}
              </strong>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-sm">
              <span className="text-stone-500 block text-[10px]">Tier 2: Merkle Proof</span>
              <strong className={verifyResult.merkle_proof_ok ? 'text-emerald-700' : 'text-rose-700'}>
                {verifyResult.merkle_proof_ok ? 'PASS' : 'FAIL'}
              </strong>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-sm">
              <span className="text-stone-500 block text-[10px]">Tier 3: Blob Hash</span>
              <strong className={verifyResult.blob_hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                {verifyResult.blob_hash_ok ? 'PASS' : 'FAIL'}
              </strong>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-sm">
              <span className="text-stone-500 block text-[10px]">Tier 4: Content Hash</span>
              <strong className={verifyResult.content_hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                {verifyResult.content_hash_ok ? 'PASS' : 'FAIL'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Identity Card */}
      <div className="glass-ivory border border-stone-200 rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">Cryptographic Fingerprint & Identity</h2>
        <div className="space-y-2.5 font-mono text-xs bg-parchment-50 p-4 rounded-xl border border-stone-200 text-stone-700">
          <div><span className="text-stone-500 font-semibold">Document ID:</span> <span className="text-stone-900 font-bold">{doc.doc_id}</span></div>
          <div><span className="text-stone-500 font-semibold">Plaintext SHA-256:</span> <span className="text-stone-800">{doc.content_hash}</span></div>
          <div><span className="text-stone-500 font-semibold">Ciphertext SHA-256:</span> <span className="text-stone-800">{doc.blob_hash}</span></div>
          <div><span className="text-stone-500 font-semibold">Chunk Merkle Root:</span> <span className="text-emerald-700 font-bold">{doc.chunk_merkle_root}</span></div>
          <div><span className="text-stone-500 font-semibold">Total Chunks:</span> <span className="text-stone-900 font-bold">{doc.chunk_count}</span></div>
          <div><span className="text-stone-500 font-semibold">Size:</span> <span className="text-stone-900 font-bold">{formatBytes(doc.size_bytes)}</span></div>
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-stone-200">
          <span className="text-xs text-stone-500 font-medium">On-Chain Ledger Registration:</span>
          <LedgerTxLink txId={doc.ledger_tx_id} channel="dochash-channel" />
        </div>
      </div>

      <CertificateDialog
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        certData={certData}
      />
    </div>
  );
};
export default DocumentDetailPage;
