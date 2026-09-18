import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Upload, HelpCircle, Shield, History, ExternalLink } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Folder className="w-6 h-6 text-police-accent" />
            Case Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access-controlled evidence repositories assigned to your credentials.
          </p>
        </div>

        <ScopeIndicator caseIds={caseIds} />
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm italic py-8">Loading assigned cases...</div>
      ) : cases.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <Shield className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Case Assignments Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your credentials have no active case assignments. Request your supervisor to assign a case to your MSP ID.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((c) => {
            const badge = formatClassificationBadge(c.classification_ceiling);
            return (
              <div
                key={c.case_id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-police-accent">
                      {c.case_id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.text}`}>
                      {c.classification_ceiling}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description || 'Secure case evidence dossier.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Status: <strong className="text-emerald-400">{c.status}</strong></span>
                    <span>Docs: <strong className="text-white">{c.active_document_count ?? 0}</strong></span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => navigate(`/documents?case=${c.case_id}`)}
                      className="flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-semibold transition-colors"
                      title="View Evidence Files"
                    >
                      <FileText className="w-3.5 h-3.5 text-police-accent" />
                      Files
                    </button>
                    <button
                      onClick={() => navigate(`/ask?case=${c.case_id}`)}
                      className="flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-semibold transition-colors"
                      title="Ask AI Intelligence"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-police-accent" />
                      Ask
                    </button>
                    <button
                      onClick={() => navigate(`/upload?case=${c.case_id}`)}
                      className="flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-semibold transition-colors"
                      title="Upload Evidence"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      Upload
                    </button>
                    <button
                      onClick={() => navigate(`/custody/${c.case_id}`)}
                      className="flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-semibold transition-colors"
                      title="Audit Ledger"
                    >
                      <History className="w-3.5 h-3.5 text-amber-400" />
                      Ledger
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
