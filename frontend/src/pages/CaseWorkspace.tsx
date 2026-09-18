import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  FileText,
  Upload,
  HelpCircle,
  Shield,
  History,
  Layers,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Scale,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { getCases } from '../api/audit';
import { Case } from '../lib/types';
import { formatClassificationBadge } from '../lib/format';
import { ScopeIndicator } from '../components/ScopeIndicator';

export const CaseWorkspace: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const data = await getCases();
      setCases(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned cases');
    } finally {
      setLoading(false);
    }
  };

  const caseIds = cases.map((c) => c.case_id);
  const totalDocs = cases.reduce((acc, c) => acc + (c.active_document_count ?? 0), 0);

  return (
    <div className="space-y-10">
      
      {/* Spacious Hero Banner & Key Metrics */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xs space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono">
              <Scale className="w-3.5 h-3.5 text-slate-700" />
              <span>ACTIVE EVIDENTIARY JURISDICTION</span>
            </div>
            <h1 className="font-serif-judicial text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Case Repositories & Dossiers
            </h1>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Electronic legal records sealed with domain-separated Merkle trees and cryptographic chain-of-custody for judicial scrutiny.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Ingest Evidence</span>
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="px-5 py-3 glass-card glass-card-hover text-slate-700 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Browse Vault</span>
            </button>
          </div>
        </div>

        {/* Breathable Metric Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-slate-200/70 font-mono">
          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/60">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Dossiers</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{cases.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Assigned operational cases</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/60">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Sealed Objects</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalDocs}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Anchored evidence files</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/60">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Consensus Status</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>TIER 4</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Polygon Amoy Synchronized</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Case Dossiers Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-transparent animate-spin"></div>
          <div className="text-slate-500 text-xs font-mono">Synchronizing dossier records...</div>
        </div>
      ) : cases.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center space-y-3 border border-dashed border-slate-300">
          <Shield className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Authorized Dossiers</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your credentials currently have no assigned cases. Request an active allocation from your supervisory unit.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5 font-serif-judicial">
                <Folder className="w-5 h-5 text-indigo-700" />
                <span>Assigned Case Dossiers</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Select a case to inspect evidence or perform forensic queries</p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {cases.length} Cases
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => {
              const badge = formatClassificationBadge(c.classification_ceiling);
              return (
                <div
                  key={c.case_id}
                  className="glass-card glass-card-hover rounded-3xl p-7 flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100/90 px-3 py-1 rounded-xl border border-slate-200/80">
                        {c.case_id}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                        {c.classification_ceiling}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif-judicial text-lg font-bold text-slate-900 group-hover:text-indigo-900 transition-colors line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-1.5 font-sans">
                        {c.description || 'Cryptographically verified evidence dossier under active judicial purview.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-700 font-semibold">{c.status}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-900 font-bold">{c.active_document_count ?? 0}</span> docs
                      </span>
                    </div>

                    {/* Clean Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/documents?case=${c.case_id}`)}
                        className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-xl font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Inspect Files</span>
                      </button>
                      <button
                        onClick={() => navigate(`/ask?case=${c.case_id}`)}
                        className="py-2.5 px-3 glass-pill hover:bg-slate-100 text-slate-700 text-xs rounded-xl font-semibold transition-all border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Judicial AI</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => navigate(`/upload?case=${c.case_id}`)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <Upload className="w-3 h-3 text-slate-400" />
                        <span>Upload Object</span>
                      </button>
                      <button
                        onClick={() => navigate(`/custody/${c.case_id}`)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <History className="w-3 h-3 text-slate-400" />
                        <span>Custody Trail</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clean Telemetry Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-900 font-bold">POLYGON AMOY CONSENSUS:</span>
          <span>Zero-Trust Verification Engine Active. Evidence roots synchronized.</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          <span>Chain ID 80002 • EVM Validated</span>
        </div>
      </div>

    </div>
  );
};

export default CaseWorkspace;
