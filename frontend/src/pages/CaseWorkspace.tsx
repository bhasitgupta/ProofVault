import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Upload, HelpCircle, Shield, History, Layers, Activity } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              ASSIGNED REPOSITORIES
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <Activity className="w-3 h-3" /> LIVE SCOPE
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-950/70 border border-blue-500/30">
              <Folder className="w-6 h-6 text-blue-400" />
            </div>
            Active Case Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl">
            Access-controlled evidence vaults bound to your MSP identity and security clearance ceiling.
          </p>
        </div>

        <ScopeIndicator caseIds={caseIds} />
      </div>

      {error && (
        <div className="p-4 bg-red-950/70 border border-red-500/60 rounded-xl text-xs text-red-300 shadow-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          <div className="text-slate-400 text-xs font-mono">Querying zero-trust case assignments...</div>
        </div>
      ) : cases.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3 border-dashed border-slate-700">
          <Shield className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Case Assignments Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your credentials currently have no active case authorizations. Request an assignment from your supervisory unit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => {
            const badge = formatClassificationBadge(c.classification_ceiling);
            return (
              <div
                key={c.case_id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-5 relative overflow-hidden"
              >
                {/* Accent corner line */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none"></div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-500/30">
                      {c.case_id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                      {c.classification_ceiling}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">
                      {c.description || 'Verified cryptographic evidence dossier under judicial purview.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <strong className="text-slate-200">{c.status}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <strong className="text-white font-bold">{c.active_document_count ?? 0}</strong> docs
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => navigate(`/documents?case=${c.case_id}`)}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-slate-900/90 hover:bg-blue-950/70 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-white text-[10px] rounded-xl font-semibold transition-all shadow-sm"
                      title="View Evidence Files"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Files</span>
                    </button>
                    <button
                      onClick={() => navigate(`/ask?case=${c.case_id}`)}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-slate-900/90 hover:bg-blue-950/70 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-white text-[10px] rounded-xl font-semibold transition-all shadow-sm"
                      title="Ask AI Intelligence"
                    >
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>Ask</span>
                    </button>
                    <button
                      onClick={() => navigate(`/upload?case=${c.case_id}`)}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-[10px] rounded-xl font-semibold transition-all shadow-sm"
                      title="Upload Evidence"
                    >
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Ingest</span>
                    </button>
                    <button
                      onClick={() => navigate(`/custody/${c.case_id}`)}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-slate-900/90 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-[10px] rounded-xl font-semibold transition-all shadow-sm"
                      title="Audit Ledger"
                    >
                      <History className="w-4 h-4 text-amber-400" />
                      <span>Ledger</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
