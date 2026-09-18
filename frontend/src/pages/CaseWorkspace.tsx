import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Upload, HelpCircle, Shield, History, Layers, Activity, Sparkles, Database, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';
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
    <div className="space-y-8">
      
      {/* Hero Bento Statistics Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Main Banner (Col 8) */}
        <div className="md:col-span-8 p-8 rounded-3xl glass-obsidian border-iridescent shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                SOVEREIGN EVIDENCE VAULT
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Activity className="w-3 h-3" /> ZERO-TRUST ABAC ENFORCED
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Case Repositories & Evidentiary Dossiers
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Institutional electronic records sealed with domain-separated Merkle trees and cryptographic chain-of-custody for judicial scrutiny.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/10 relative z-10 font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">ACTIVE DOSSIERS</div>
              <div className="text-2xl font-black text-white mt-0.5">{cases.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">SEALED EVIDENCE</div>
              <div className="text-2xl font-black text-indigo-400 mt-0.5">{totalDocs} <span className="text-xs text-slate-500">docs</span></div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">INTEGRITY TIER</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">TIER 4 <span className="text-xs text-slate-500">verified</span></div>
            </div>
          </div>
        </div>

        {/* Side Telemetry Bento (Col 4) */}
        <div className="md:col-span-4 p-6 rounded-3xl glass-obsidian border border-white/10 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Perimeter
            </div>
            <p className="text-[11px] text-slate-400">
              Clearance credentials bound to local session and verified live on every retrieval transaction.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">TRUST ANCHOR</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> POLYGON DLT
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">KEY CUSTODY</span>
              <span className="text-indigo-400 font-bold">VAULT TRANSIT</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">BSA CERTIFICATE</span>
              <span className="text-cyan-400 font-bold">BSA §63 / IEA §65B</span>
            </div>
          </div>

          <div className="pt-2">
            <ScopeIndicator caseIds={caseIds} />
          </div>
        </div>

      </div>

      {error && (
        <div className="p-4 bg-rose-950/70 border border-rose-500/60 rounded-2xl text-xs text-rose-300 shadow-xl">
          {error}
        </div>
      )}

      {/* Case Dossiers Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          <div className="text-slate-400 text-xs font-mono">Synchronizing zero-trust dossier records...</div>
        </div>
      ) : cases.length === 0 ? (
        <div className="glass-obsidian rounded-3xl p-16 text-center space-y-3 border-dashed border-white/10">
          <Shield className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Authorized Dossiers</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your credentials currently have no assigned cases. Request an active case allocation from your supervisory unit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              <span>Assigned Case Dossiers</span>
              <span className="text-xs text-slate-500 font-mono">({cases.length})</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Click card to inspect evidence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => {
              const badge = formatClassificationBadge(c.classification_ceiling);
              return (
                <div
                  key={c.case_id}
                  className="glass-obsidian glass-obsidian-hover rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 relative overflow-hidden group border border-white/10"
                >
                  {/* Subtle hover gradient wash */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none group-hover:from-indigo-500/20 transition-all duration-300"></div>

                  <div className="space-y-3.5 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-500/30">
                        {c.case_id}
                      </span>
                      <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                        {c.classification_ceiling}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1.5">
                        {c.description || 'Cryptographically verified evidence dossier under active judicial purview.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <strong className="text-slate-200">{c.status}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <strong className="text-white font-bold">{c.active_document_count ?? 0}</strong> docs
                      </span>
                    </div>

                    {/* Quick Forensic Action Dock */}
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => navigate(`/documents?case=${c.case_id}`)}
                        className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-black/40 hover:bg-indigo-950/70 border border-white/5 hover:border-indigo-500/40 text-slate-300 hover:text-white text-[10px] rounded-2xl font-bold transition-all shadow-sm cursor-pointer"
                        title="Open Evidence Vault"
                      >
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>Files</span>
                      </button>
                      <button
                        onClick={() => navigate(`/ask?case=${c.case_id}`)}
                        className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-black/40 hover:bg-cyan-950/70 border border-white/5 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-[10px] rounded-2xl font-bold transition-all shadow-sm cursor-pointer"
                        title="Query Verifiable AI"
                      >
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span>Ask AI</span>
                      </button>
                      <button
                        onClick={() => navigate(`/upload?case=${c.case_id}`)}
                        className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-black/40 hover:bg-emerald-950/70 border border-white/5 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-[10px] rounded-2xl font-bold transition-all shadow-sm cursor-pointer"
                        title="Ingest Evidence"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>Ingest</span>
                      </button>
                      <button
                        onClick={() => navigate(`/custody/${c.case_id}`)}
                        className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-black/40 hover:bg-amber-950/70 border border-white/5 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-[10px] rounded-2xl font-bold transition-all shadow-sm cursor-pointer"
                        title="View Custody Ledger"
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
        </div>
      )}

      {/* Live Blockchain & Custody Telemetry Ticker */}
      <div className="glass-obsidian rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-white font-bold">LIVE TELEMETRY:</span>
          <span>Dual-Channel Ledgers in consensus. Qdrant vector space pre-filtered.</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-400">
          <span>POLYGON AMOY TESTNET NODE</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

    </div>
  );
};
