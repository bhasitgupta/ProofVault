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
      setError(err.message || 'Failed to load document metadata');
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
      setError(err.message || 'Integrity verification failed');
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
      setError(err.message || 'Certificate issuance failed');
    }
  };

  if (loading) return <div className="text-slate-400 text-sm italic py-8">Loading evidence record...</div>;
  if (!doc) return <div className="text-red-400 text-sm py-8">Document not found or access denied.</div>;

  const badge = formatClassificationBadge(doc.classification);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-police-accent font-bold">{doc.case_id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.text}`}>
              {doc.classification}
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
              {doc.doc_type}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-300" />
            {doc.filename}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-police-accent ${verifying ? 'animate-spin' : ''}`} />
            <span>Verify Integrity</span>
          </button>
          <button
            onClick={handleIssueCert}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Issue BSA §63</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {verifyResult && (
        <div className={`p-4 rounded-xl border space-y-2 ${
          verifyResult.overall ? 'bg-emerald-950/50 border-emerald-500/50' : 'bg-red-950/70 border-red-500 animate-pulse'
        }`}>
          <div className="flex items-center justify-between">
            <VerificationBadge status={verifyResult.overall ? 'VERIFIED' : 'FAILED'} />
            <span className="font-mono text-xs text-slate-400">4-Tier Verification Suite</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Tier 1: Chunk Hash</span>
              <strong className={verifyResult.chunk_hash_ok ? 'text-emerald-400' : 'text-red-400'}>
                {verifyResult.chunk_hash_ok ? 'PASS' : 'FAIL'}
              </strong>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Tier 2: Merkle Proof</span>
              <strong className={verifyResult.merkle_proof_ok ? 'text-emerald-400' : 'text-red-400'}>
                {verifyResult.merkle_proof_ok ? 'PASS' : 'FAIL'}
              </strong>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Tier 3: Blob Hash</span>
              <strong className={verifyResult.blob_hash_ok ? 'text-emerald-400' : 'text-red-400'}>
                {verifyResult.blob_hash_ok ? 'PASS' : 'FAIL'}
              </strong>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Tier 4: Content Hash</span>
              <strong className={verifyResult.content_hash_ok ? 'text-emerald-400' : 'text-red-400'}>
                {verifyResult.content_hash_ok ? 'PASS' : 'FAIL'}
              </strong>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Cryptographic Identity</h2>
        <div className="space-y-3 font-mono text-xs bg-slate-950 p-4 rounded-lg border border-slate-800/80">
          <div><span className="text-slate-500">Document ID:</span> <span className="text-white">{doc.doc_id}</span></div>
          <div><span className="text-slate-500">Plaintext SHA-256:</span> <span className="text-slate-300">{doc.content_hash}</span></div>
          <div><span className="text-slate-500">Ciphertext SHA-256:</span> <span className="text-slate-300">{doc.blob_hash}</span></div>
          <div><span className="text-slate-500">Chunk Merkle Root:</span> <span className="text-emerald-400 font-bold">{doc.chunk_merkle_root}</span></div>
          <div><span className="text-slate-500">Total Chunks:</span> <span className="text-white">{doc.chunk_count}</span></div>
          <div><span className="text-slate-500">Size:</span> <span className="text-white">{formatBytes(doc.size_bytes)}</span></div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <span className="text-xs text-slate-400">On-Chain Registration:</span>
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
