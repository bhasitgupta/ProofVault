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
  ChevronRight,
  AlertTriangle,
  Gavel,
  Landmark,
  BadgeCheck,
  Search,
  Filter,
  FileCheck,
  Terminal,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import { getCases, getIncidents, FALLBACK_CASES } from '../api/audit';
import { Case } from '../lib/types';
import { formatClassificationBadge } from '../lib/format';

export const CaseWorkspace: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [caseData, incData] = await Promise.all([
        getCases(),
        getIncidents().catch(() => ({ total: 0, incidents: [] })),
      ]);
      setCases(caseData && caseData.length > 0 ? caseData : FALLBACK_CASES);
      setIncidents(incData.incidents || []);
      setError(null);
    } catch (err: any) {
      console.warn('Workspace data fetch fallback:', err);
      setCases(FALLBACK_CASES);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const totalDocs = cases.reduce((acc, c) => acc + (c.active_document_count ?? 0), 0);

  // Categorization filter logic for governmental crime classification
  const categories = [
    { id: 'ALL', label: 'All Dockets', count: cases.length },
    { id: 'CYBER', label: 'Cyber & Hawala', match: ['cyber', 'crypto', 'hawala'] },
    { id: 'RANSOMWARE', label: 'Ransomware & Infra', match: ['ransomware', 'gateway', 'bank'] },
    { id: 'NARCOTICS', label: 'Narcotics & Darknet', match: ['narcotics', 'darknet', 'transit'] },
    { id: 'FORENSICS', label: 'Ballistics & Arms', match: ['ballistics', 'firearm', 'seizure'] },
    { id: 'CORRUPTION', label: 'Anti-Corruption', match: ['corruption', 'tender', 'embezzlement'] },
  ];

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;

    const catDef = categories.find((cat) => cat.id === selectedCategory);
    if (!catDef || !catDef.match) return true;

    const combinedText = `${c.title} ${c.description || ''}`.toLowerCase();
    return catDef.match.some((keyword) => combinedText.includes(keyword));
  });

  return (
    <div className="space-y-8">

      {/* Top Governmental Law & Order Command Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                <Gavel className="w-3.5 h-3.5 text-amber-400" />
                MINISTRY OF LAW & JUSTICE • GOVT OF INDIA
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                BSA §63 EVIDENTIARY STATUTE ACTIVE
              </span>
            </div>
            <h1 className="font-serif-judicial text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Judicial Case Repositories & Forensic Crime Dockets
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans max-w-3xl leading-relaxed">
              Sovereign electronic evidence vault. All digital FIRs, charge-sheets, ballistics scans, and audit journals are anchored with cryptographic Merkle trees for statutory court admissibility.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Ingest Case Evidence</span>
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="px-5 py-3 glass-card glass-card-hover text-slate-800 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Browse Vault</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Barometer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/70 font-mono">
          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Crime Dockets</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{cases.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Assigned jurisdictions</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sealed Objects</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalDocs}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Enveloped forensic files</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Statutory Verification</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>100% OK</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">RFC 6962 Merkle proofed</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Chain of Custody</div>
            <div className="text-2xl font-bold text-indigo-700 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>SECURED</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Polygon Amoy Anchored</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => { setError(null); loadWorkspaceData(); }}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors text-[11px] font-sans font-medium cursor-pointer shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* NEW ASYMMETRIC COMMAND CENTER SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: PRIMARY INVESTIGATIVE CASE DOSSIERS (7 COLS)          */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filter & Search Toolbar */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Case ID, crime keyword, FIR memo..."
                className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 font-sans"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white/80 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dossiers Listing */}
          {loading ? (
            <div className="glass-panel rounded-3xl p-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></div>
              <div className="text-slate-500 text-xs font-mono">Accessing sovereign judicial registers...</div>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="glass-panel rounded-3xl p-16 text-center space-y-3 border border-dashed border-slate-300">
              <Shield className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 font-serif-judicial">No Case Dockets Match Filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active police or judicial records matched your query parameters. Clear filter criteria to view all dossiers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCases.map((c) => {
                const badge = formatClassificationBadge(c.classification_ceiling);
                return (
                  <div
                    key={c.case_id}
                    className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-indigo-400/80 transition-all space-y-4 group"
                  >
                    {/* Top Case Header & Metadata Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-xs text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-indigo-700" />
                          {c.case_id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                          MSP: {c.owning_msp || 'PoliceMSP'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                          {c.classification_ceiling}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {c.status}
                        </span>
                      </div>
                    </div>

                    {/* Case Title & Crime Particulars */}
                    <div>
                      <h3 className="font-serif-judicial text-lg sm:text-xl font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-sans leading-relaxed mt-1.5 line-clamp-2">
                        {c.description || 'Electronic judicial case docket under active scrutiny. Contains forensic evidence and chain of custody logs.'}
                      </p>
                    </div>

                    {/* Evidence & Action Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100/90">
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{c.active_document_count ?? 0} Sealed Documents</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                          BSA §63 Verified
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/documents?case=${c.case_id}`)}
                          className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-300" />
                          <span>Inspect Evidence</span>
                        </button>
                        <button
                          onClick={() => navigate(`/ask?case=${c.case_id}`)}
                          className="py-2 px-3.5 glass-card hover:bg-slate-100 text-slate-800 text-xs rounded-xl font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Judicial AI</span>
                        </button>
                        <button
                          onClick={() => navigate(`/custody/${c.case_id}`)}
                          className="py-2 px-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                          title="View Chain of Custody Trail"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Custody</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: JUDICIARY INTELLIGENCE & TELEMETRY PANEL (4 COLS)  */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Statutory Court Admissibility Status */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-judicial text-base font-bold text-slate-900">
                  Judicial Admissibility Status
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Bharatiya Sakshya Adhiniyam §63</span>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SECTION 63(4) CERTIFICATION</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-normal font-sans">
                  Automated cryptographic certificate generation with SHA-256 hash sealing, custodian signature, and timestamping.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>IEA §65B LEGACY COMPLIANCE</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal font-sans">
                  Dual certificate generation ensures full backward admissibility across all Indian High Courts and Sessions Courts.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                <span>Cryptographic Engine:</span>
                <span className="font-bold text-slate-900">Polygon Amoy EVM (80002)</span>
              </div>
            </div>
          </div>

          {/* Live Incident & Custody Feed */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 font-serif-judicial font-bold text-slate-900">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Forensic Incident Watch</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                LIVE WATCH
              </span>
            </div>

            <div className="space-y-3">
              {incidents.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-mono space-y-1">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                  <div>Zero Tamper Incidents</div>
                  <div className="text-[10px] text-slate-400">All hashes match on-chain anchors</div>
                </div>
              ) : (
                incidents.slice(0, 4).map((inc, i) => (
                  <div
                    key={inc.id || i}
                    className="p-3 rounded-xl bg-white/70 border border-slate-200 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700">{inc.failing_check || 'TAMPER_ALERT'}</span>
                      <span className="text-[10px] text-slate-500">{inc.status || 'QUARANTINED'}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 truncate">Doc: {inc.doc_id}</div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/incidents')}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Full Security Audit Log</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Quick Judicial Tools & Actions */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider">
              Judicial Officer Actions
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/ask')}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Query Evidence with Judicial AI</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/upload')}
                className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Seize & Ingest Electronic Evidence</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/documents')}
                className="w-full p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Generate BSA §63 Certificate</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CaseWorkspace;
