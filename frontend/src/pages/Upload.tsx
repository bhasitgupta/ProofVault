import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileUp,
  CheckCircle,
  AlertCircle,
  Shield,
  ArrowRight,
  Database,
  ExternalLink,
  Layers,
  Wallet,
  Download,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { uploadDocument, downloadDocumentFile } from '../api/documents';
import { getCases } from '../api/audit';
import { LedgerTxLink } from '../components/LedgerTxLink';
import { ensurePolygonAmoyNetwork, POLYGONSCAN_BASE } from '../lib/polygon';

export const UploadPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [caseId, setCaseId] = useState(searchParams.get('case') || 'CASE-101');
  const [cases, setCases] = useState<string[]>([]);
  const [docType, setDocType] = useState('WITNESS_STATEMENT');
  const [classification, setClassification] = useState('CONFIDENTIAL');
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Web3 Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

    // Detect browser Web3 wallet
    checkConnectedWallet();
  }, []);

  const checkConnectedWallet = async () => {
    const eth = (window as any).ethereum;
    if (eth && eth.request) {
      try {
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (err) {
        console.warn('Wallet detection query skipped:', err);
      }
    }
  };

  const connectWeb3Wallet = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      alert('No Web3 wallet (MetaMask / Phantom) detected in browser. You can still anchor via sovereign Polygon block state.');
      return;
    }

    setWalletConnecting(true);
    try {
      await ensurePolygonAmoyNetwork();
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err: any) {
      console.warn('Wallet connection cancelled or failed:', err);
    } finally {
      setWalletConnecting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
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
      setUploadStep('1. Slicing into 256KB chunks & computing cryptographic Merkle tree...');
      await new Promise((r) => setTimeout(r, 200));

      setUploadStep('2. Anchoring cryptographic commitment to Polygon Amoy EVM (80002)...');
      const res = await uploadDocument(formData);

      setUploadStep('3. Ingesting encrypted payload into Supabase Storage & PostgreSQL...');
      await new Promise((r) => setTimeout(r, 200));

      setResult(res);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.detail || err.message || 'Document upload & blockchain anchoring failed');
    } finally {
      setLoading(false);
      setUploadStep('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner with Live Telemetry */}
      <div className="glass-ivory border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-crimson-50 border border-crimson-200 rounded-xl text-crimson-800 shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif-judicial font-bold tracking-tight text-stone-900">
                Ingest Electronic Evidence
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                Atomic zero-trust ingestion into Supabase Storage and immutable Polygon Amoy EVM anchor.
              </p>
            </div>
          </div>

          {/* Web3 Wallet Quick Connect */}
          <div>
            {walletAddress ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-mono text-emerald-800 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Amoy Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={connectWeb3Wallet}
                disabled={walletConnecting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-700 shadow-xs transition-colors cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                <span>{walletConnecting ? 'Connecting...' : 'Connect Web3 Wallet'}</span>
              </button>
            )}
          </div>
        </div>

        {/* System Architecture Telemetry Strip */}
        <div className="mt-4 pt-3.5 border-t border-stone-200/70 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-stone-600 bg-stone-50/80 px-3 py-1.5 rounded-lg border border-stone-200/60">
            <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Supabase PostgreSQL: <strong className="text-emerald-700">Connected</strong></span>
          </div>
          <div className="flex items-center gap-2 text-stone-600 bg-stone-50/80 px-3 py-1.5 rounded-lg border border-stone-200/60">
            <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">Bucket: <strong className="text-indigo-700">evidence</strong></span>
          </div>
          <div className="flex items-center gap-2 text-stone-600 bg-stone-50/80 px-3 py-1.5 rounded-lg border border-stone-200/60">
            <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate">Blockchain: <strong className="text-purple-700">Polygon Amoy (80002)</strong></span>
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
        <div className="glass-ivory border border-emerald-300 rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 font-serif-judicial font-bold text-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <span>Evidence Successfully Anchored on Polygon & Supabase</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full border border-emerald-200">
              IMMUTABLE
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono bg-parchment-50 p-5 rounded-xl border border-stone-200 text-stone-700">
            {/* Doc ID */}
            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 font-semibold">Document ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900">{result.doc_id}</span>
                <button
                  onClick={() => copyToClipboard(result.doc_id, 'doc_id')}
                  className="text-stone-400 hover:text-stone-700 p-0.5"
                  title="Copy Document ID"
                >
                  {copiedField === 'doc_id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Content SHA-256 */}
            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 font-semibold">Content SHA-256:</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-800">{result.content_hash.slice(0, 20)}...{result.content_hash.slice(-10)}</span>
                <button
                  onClick={() => copyToClipboard(result.content_hash, 'content_hash')}
                  className="text-stone-400 hover:text-stone-700 p-0.5"
                  title="Copy Full Hash"
                >
                  {copiedField === 'content_hash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Merkle Root */}
            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 font-semibold">Merkle Tree Root:</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-bold text-[11px]">{result.chunk_merkle_root.slice(0, 20)}...{result.chunk_merkle_root.slice(-10)}</span>
                <button
                  onClick={() => copyToClipboard(result.chunk_merkle_root, 'merkle_root')}
                  className="text-stone-400 hover:text-stone-700 p-0.5"
                  title="Copy Merkle Root"
                >
                  {copiedField === 'merkle_root' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Chunks */}
            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 font-semibold">256KB Chunks Created:</span>
              <span className="font-bold text-stone-800">{result.chunk_count} Chunks</span>
            </div>

            {/* Supabase Storage Location */}
            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 font-semibold">Supabase Storage Location:</span>
              <span className="text-[11px] text-indigo-700 font-semibold">{result.storage_path}</span>
            </div>

            {/* Polygon Blockchain Anchor TX */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-stone-500 font-semibold">Polygon Blockchain Anchor:</span>
              <div className="flex items-center gap-2">
                <LedgerTxLink txId={result.ledger_tx_id} contract="EvidenceRegistry" />
                <a
                  href={result.explorer_url || `${POLYGONSCAN_BASE}/tx/${result.ledger_tx_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-indigo-600 hover:text-indigo-800"
                  title="View on Polygonscan Amoy"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadDocumentFile(result.doc_id, result.filename)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify & Download from Supabase</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Another File</span>
              </button>
            </div>

            <button
              onClick={() => navigate(`/documents`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-crimson-800 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <span>View in Documents Explorer</span>
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
                accept=".pdf,.txt,.raw,.enc,.doc,.docx"
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
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF, TXT, or Raw Bitstream (max 100MB)'}
                </div>
              </label>
            </div>
          </div>

          {loading && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 text-xs font-mono text-indigo-900 shadow-sm">
              <div className="flex items-center gap-2 font-bold">
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Executing Cryptographic Pipeline</span>
              </div>
              <p className="text-indigo-700">{uploadStep}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full flex items-center justify-center gap-2 py-3 bg-crimson-800 hover:bg-crimson-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-crimson-900/15 cursor-pointer"
          >
            <span>{loading ? 'Submitting to Blockchain & Supabase...' : 'Anchor Evidence on Polygon Amoy & Store in Supabase'}</span>
            <Shield className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default UploadPage;
