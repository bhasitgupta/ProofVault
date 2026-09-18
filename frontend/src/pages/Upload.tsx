import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, FileUp, CheckCircle, AlertCircle, Shield, ArrowRight } from 'lucide-react';
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
      setError(err.message || 'Document upload & ingestion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Upload className="w-6 h-6 text-emerald-400" />
          Ingest Electronic Evidence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Atomic 14-step ingestion pipeline: malware scan, envelope encryption, Merkle tree commitment, and on-chain registration.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500 rounded-lg text-xs text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {result ? (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <CheckCircle className="w-5 h-5" />
            <span>Document Ingestion Succeeded</span>
          </div>

          <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300">
            <div><span className="text-slate-500">Document ID:</span> {result.doc_id}</div>
            <div><span className="text-slate-500">Content SHA-256:</span> {result.content_hash}</div>
            <div><span className="text-slate-500">Blob SHA-256:</span> {result.blob_hash}</div>
            <div><span className="text-slate-500">Merkle Root:</span> {result.chunk_merkle_root}</div>
            <div><span className="text-slate-500">Chunks Created:</span> {result.chunk_count}</div>
            <div><span className="text-slate-500">Status:</span> {result.status}</div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <LedgerTxLink txId={result.ledger_tx_id} channel="dochash-channel" />
            <button
              onClick={() => navigate(`/documents/${result.doc_id}`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-police-accent hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <span>View Document</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Case</label>
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {cases.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Classification</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="RESTRICTED">RESTRICTED</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="SECRET">SECRET</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select File (PDF / TXT)</label>
            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".pdf,.txt"
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <FileUp className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-semibold text-white">
                  {file ? file.name : 'Click to select or drag and drop'}
                </div>
                <div className="text-xs text-slate-500">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF or UTF-8 Plaintext (max 50MB)'}
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
          >
            <span>{loading ? 'Running 14-Step Pipeline...' : 'Commit Evidence to Ledger'}</span>
            <Shield className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
