import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, FileUp, CheckCircle, AlertCircle, Shield, ArrowRight, Lock, FileSignature } from 'lucide-react';
import { uploadDocument } from '../api/documents';
import { getCases } from '../api/audit';
import { LedgerTxLink } from '../components/LedgerTxLink';

export const UploadPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [caseId, setCaseId] = useState(searchParams.get('case') || 'CASE-101');
  const [cases, setCases] = useState<string[]>([]);
  const [docType, setDocType] = useState('WITNESS_STATEMENT');
  const [classification, setClassification] = useState('CONFIDENTIAL');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCases()
      .then((res) => {
        const ids = res.map((c) => c.case_id);
        setCases(ids);
        if (!ids.includes(caseId) && ids.length > 0) {
          setCaseId(ids[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);
    formData.append('doc_type', docType);
    formData.append('classification', classification);

    try {
      const res = await uploadDocument(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Document upload & ingestion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-ivory border-crimson-gold rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-crimson-50 border border-crimson-200 rounded-xl text-crimson-800 shadow-sm">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-judicial font-bold tracking-tight text-stone-900">
              Ingest Electronic Evidence
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Atomic 14-step ingestion pipeline: malware scan, envelope encryption, Merkle tree commitment, and on-chain registration.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium">{error}</div>
        </div>
      )}

      {result ? (
        <div className="glass-ivory border border-emerald-300 rounded-2xl p-6 sm:p-7 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-serif-judicial font-bold text-lg">
            <CheckCircle className="w-6 h-6" />
            <span>Document Ingestion Succeeded</span>
          </div>

          <div className="space-y-2 text-xs font-mono bg-parchment-50 p-4 rounded-xl border border-stone-200 text-stone-700">
            <div><span className="text-stone-500 font-semibold">Document ID:</span> {result.doc_id}</div>
            <div><span className="text-stone-500 font-semibold">Content SHA-256:</span> {result.content_hash}</div>
            <div><span className="text-stone-500 font-semibold">Blob SHA-256:</span> {result.blob_hash}</div>
            <div><span className="text-stone-500 font-semibold">Merkle Root:</span> <span className="text-emerald-700 font-bold">{result.chunk_merkle_root}</span></div>
            <div><span className="text-stone-500 font-semibold">Chunks Created:</span> {result.chunk_count}</div>
            <div><span className="text-stone-500 font-semibold">Status:</span> <span className="text-crimson-800 font-bold">{result.status}</span></div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200">
            <LedgerTxLink txId={result.ledger_tx_id} contract="EvidenceRegistry" />
            <button
              onClick={() => navigate(`/documents`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-crimson-800 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
            >
              <span>View Documents Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="glass-ivory border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-md space-y-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Target Case Assignment</label>
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-crimson-700 font-mono shadow-sm"
            >
              {cases.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
              >
                <option value="WITNESS_STATEMENT">Witness Statement</option>
                <option value="FIR">First Information Report (FIR)</option>
                <option value="FORENSIC_REPORT">Forensic Report</option>
                <option value="CASE_DIARY">Case Diary</option>
                <option value="SEIZURE_MEMO">Seizure Memo</option>
                <option value="CHARGESHEET">Chargesheet</option>
                <option value="COURT_ORDER">Court Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Classification Level</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
              >
                <option value="RESTRICTED">RESTRICTED</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="SECRET">SECRET</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Select Evidentiary Payload (PDF / TXT)</label>
            <div className="border-2 border-dashed border-stone-300 hover:border-crimson-700 rounded-2xl p-7 text-center cursor-pointer transition-colors bg-parchment-50/70">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".pdf,.txt"
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2.5 block">
                <div className="p-3 bg-white border border-stone-200 rounded-xl inline-block shadow-sm">
                  <FileUp className="w-7 h-7 text-crimson-800" />
                </div>
                <div className="text-sm font-semibold text-stone-900">
                  {file ? file.name : 'Click to select or drag and drop'}
                </div>
                <div className="text-xs text-stone-500 font-mono">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF or UTF-8 Plaintext (max 50MB)'}
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full flex items-center justify-center gap-2 py-3 bg-crimson-800 hover:bg-crimson-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-crimson-900/15"
          >
            <span>{loading ? 'Executing 14-Step Cryptographic Pipeline...' : 'Anchor Evidence on Polygon Amoy'}</span>
            <Shield className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
export default UploadPage;
