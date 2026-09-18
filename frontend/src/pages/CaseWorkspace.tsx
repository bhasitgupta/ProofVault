import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Upload, HelpCircle, Shield, History, Layers, Activity, Sparkles, Database, CheckCircle2, ShieldCheck, ArrowUpRight, Scale, Award } from 'lucide-react';
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
        <div className="md:col-span-8 p-8 rounded-3xl glass-ivory border-crimson-gold shadow-xl relative overflow-hidden flex flex-col justify-between bg-white/90">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-red-50 text-red-800 border border-red-200 flex items-center gap-1.5">
                <Scale className="w-3 h-3 text-amber-700" />
                SOVEREIGN EVIDENCE VAULT
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-amber-900 font-mono font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 text-red-600" /> ZERO-TRUST CLEARANCE ENFORCED
              </span>
            </div>

            <h1 className="font-serif-judicial text-3xl sm:text-4xl font-black tracking-tight text-stone-900 leading-tight">
              Case Repositories & Evidentiary Dossiers
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Institutional electronic legal records sealed with domain-separated Merkle trees and cryptographic chain-of-custody for judicial scrutiny.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-stone-200 relative z-10 font-mono">
            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">ACTIVE DOSSIERS</div>
              <div className="text-2xl font-black text-red-900 mt-0.5">{cases.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">SEALED EVIDENCE</div>
              <div className="text-2xl font-black text-amber-800 mt-0.5">{totalDocs} <span className="text-xs text-stone-400">docs</span></div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">INTEGRITY TIER</div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">TIER 4 <span className="text-xs text-stone-400">verified</span></div>
            </div>
          </div>
        </div>

        {/* Side Telemetry Bento (Col 4) */}
        <div className="md:col-span-4 p-6 rounded-3xl glass-ivory border border-amber-900/15 shadow-xl flex flex-col justify-between space-y-4 bg-white/80">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-700" /> Security Perimeter
            </div>
            <p className="text-[11px] text-stone-600">
              Clearance credentials bound to local session and verified live on every retrieval transaction.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between">
              <span className="text-stone-600 font-medium">TRUST ANCHOR</span>
              <span className="text-red-900 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> POLYGON AMOY
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between">
              <span className="text-stone-600 font-medium">KEY CUSTODY</span>
              <span className="text-red-900 font-bold">VAULT TRANSIT</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between">
              <span className="text-stone-600 font-medium">BSA CERTIFICATE</span>
              <span className="text-amber-800 font-bold">BSA §63 / IEA §65B</span>
            </div>
          </div>

          <div className="pt-2">
            <ScopeIndicator caseIds={caseIds} />
          </div>
        </div>

      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 shadow-md">
          {error}
        </div>
      )}

      {/* Case Dossiers Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-red-700 border-t-transparent animate-spin"></div>
          <div className="text-stone-500 text-xs font-mono">Synchronizing zero-trust dossier records...</div>
        </div>
      ) : cases.length === 0 ? (
        <div className="glass-ivory rounded-3xl p-16 text-center space-y-3 border-dashed border-stone-300">
          <Shield className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No Authorized Dossiers</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Your credentials currently have no assigned cases. Request an active case allocation from your supervisory unit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2 font-serif-judicial">
              <Folder className="w-4 h-4 text-red-800" />
              <span>Assigned Case Dossiers</span>
              <span className="text-xs text-stone-500 font-mono font-normal">({cases.length})</span>
            </h2>
            <span className="text-xs text-stone-500 font-mono">Click card actions to inspect evidence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => {
              const badge = formatClassificationBadge(c.classification_ceiling);
              return (
                <div
                  key={c.case_id}
                  className="glass-ivory glass-ivory-hover rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-5 relative overflow-hidden group bg-white/95 border border-stone-200"
                >
                  <div className="space-y-3.5 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-red-900 bg-red-50 px-3 py-1 rounded-xl border border-red-200">
                        {c.case_id}
                      </span>
                      <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                        {c.classification_ceiling}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif-judicial text-base font-bold text-stone-900 group-hover:text-red-800 transition-colors line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mt-1.5 font-sans">
                        {c.description || 'Cryptographically verified evidence dossier under active judicial purview.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-100 relative z-10">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <strong className="text-stone-800">{c.status}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-stone-600">
                        <Layers className="w-3.5 h-3.5 text-amber-700" />
                        <strong className="text-stone-900 font-bold">{c.active_document_count ?? 0}</strong> docs
                      </span>
                    </div>

                    {/* Quick Forensic Action Dock */}
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => navigate(`/documents?case=${c.case_id}`)}
                        className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-stone-50 hover:bg-red-50 border border-stone-200 hover:border-red-200 text-stone-700 hover:text-red-900 text-[10px] rounded-2xl font-bold transition-all shadow-sm cursor-pointer"
                        title="Open Evidence Vault"
                      >
                        <FileText className="w-4 h-4 text-red-700" />
                        <span>Files</span>
                      </button>
                      <button
                        onClick={() => navigate(`/ask?case=${c.case_id}`)}
                        className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 text-stone-700 hover:text-amber-900 text-[10px] rounded-2xl font-bold transition-all shadow-sm cursor-pointer"
                        title="Query Judicial AI"
                      >
                        <HelpCircle className="w-4 h-4 text-amber-700" />
                        <span>Ask AI</span>
                      </button>
                      <button
                        onClick={() => navigate(`/upload?case=${c.case_id}`)}
                        className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 text-stone-700 hover:text-emerald-900 text-[10px] rounded-2xl font-bold transition-all shadow-sm cursor-pointer"
                        title="Ingest Evidence"
                      >
                        <Upload className="w-4 h-4 text-emerald-700" />
                        <span>Ingest</span>
                      </button>
                      <button
                        onClick={() => navigate(`/custody/${c.case_id}`)}
                        className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 text-stone-700 hover:text-amber-900 text-[10px] rounded-2xl font-bold transition-all shadow-sm cursor-pointer"
                        title="View Custody Ledger"
                      >
                        <History className="w-4 h-4 text-stone-600" />
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
      <div className="glass-ivory rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-stone-600 bg-white/90">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <span className="text-stone-900 font-bold">LIVE TELEMETRY:</span>
          <span>Dual-Channel Ledgers in consensus. Qdrant vector space pre-filtered.</span>
        </div>
        <div className="flex items-center gap-2 text-red-800 font-bold">
          <span>POLYGON AMOY TESTNET NODE</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

    </div>
  );
};
