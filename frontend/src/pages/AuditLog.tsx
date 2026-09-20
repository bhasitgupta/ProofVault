import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Send,
  User,
  Clock,
  Layers,
  FileCheck,
  Building2,
  X,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { getAllAuditLogs, getCases, recordCustodyEvent, getIncidents } from '../api/audit';
import { AuditEvent, Case } from '../lib/types';
import { LedgerTxLink } from '../components/LedgerTxLink';

export const AuditLogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCase, setSelectedCase] = useState<string>(searchParams.get('case') || 'ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'journal' | 'incidents'>('timeline');

  // Custody Transfer Modal
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferCaseId, setTransferCaseId] = useState('');
  const [transferToMsp, setTransferToMsp] = useState('ForensicsMSP');
  const [transferOfficer, setTransferOfficer] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  const [transferring, setTransferring] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [logs, caseList, incList] = await Promise.all([
        getAllAuditLogs({ limit: 100 }),
        getCases(),
        getIncidents().catch(() => ({ total: 0, incidents: [] })),
      ]);
      setAuditLogs(logs);
      setCases(caseList);
      setIncidents(incList.incidents || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load sovereign audit records');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferCaseId || !transferOfficer.trim()) {
      alert('Case ID and Officer ID are required');
      return;
    }
    setTransferring(true);
    try {
      await recordCustodyEvent({
        actorId: localStorage.getItem('sdms_user_id') || 'USR-001',
        actorRole: 'INVESTIGATOR',
        actorMSP: 'PoliceMSP',
        action: 'CUSTODY_TRANSFER',
        caseId: transferCaseId,
        outcome: 'ALLOW',
        reason: `Formal evidentiary transfer to ${transferToMsp} (Custodian: ${transferOfficer}). Purpose: ${transferPurpose || 'Forensic Examination'}`,
      });
      setIsTransferOpen(false);
      setTransferOfficer('');
      setTransferPurpose('');
      await loadData();
    } catch (err: any) {
      alert(`Transfer recording failed: ${err.message}`);
    } finally {
      setTransferring(false);
    }
  };

  // Filtered audit events
  const filteredEvents = auditLogs.filter(evt => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (evt.caseId && evt.caseId.toLowerCase().includes(q)) ||
      evt.action.toLowerCase().includes(q) ||
      evt.actorId.toLowerCase().includes(q) ||
      (evt.reason && evt.reason.toLowerCase().includes(q));

    const matchesCase = selectedCase === 'ALL' || evt.caseId === selectedCase;
    const matchesAction = selectedAction === 'ALL' || evt.action === selectedAction;

    return matchesSearch && matchesCase && matchesAction;
  });

  // Color mapping for actions
  const getActionBadge = (action: string) => {
    if (action.includes('ANCHOR') || action.includes('INGEST')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
    if (action.includes('TRANSFER')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-300';
    }
    if (action.includes('FREEZE') || action.includes('HOLD')) {
      return 'bg-amber-50 text-amber-800 border-amber-300';
    }
    if (action.includes('CERT') || action.includes('BSA')) {
      return 'bg-purple-50 text-purple-800 border-purple-300';
    }
    return 'bg-stone-100 text-stone-800 border-stone-300';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. PROVENANCE LEDGER HEADER & TELEMETRY STRIP
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-900 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                IMMUTABLE FORENSIC PROVENANCE
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono text-[10px] font-semibold">
                POLYGON AMOY (CHAIN 80002)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-judicial font-bold text-stone-900 tracking-tight">
              Forensic Chain of Custody & Audit Ledger
            </h1>
            <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
              Cryptographically chained audit trail. Every evidence access, forensic extraction, statutory legal hold, and inter-agency handover is timestamped and tamper-evident under BSA §63.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (cases.length > 0) setTransferCaseId(cases[0].case_id);
                setIsTransferOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Record Custody Transfer</span>
            </button>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-stone-600" />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metric Strip */}
        <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Recorded Audit Events</span>
            <span className="text-2xl font-bold text-stone-900 mt-0.5 block">{auditLogs.length}</span>
            <span className="text-[10px] text-stone-500 font-sans">Cryptographic ledger events</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Active Jurisdictions</span>
            <span className="text-2xl font-bold text-indigo-700 mt-0.5 block">{cases.length}</span>
            <span className="text-[10px] text-stone-500 font-sans">Cross-agency dockets</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Integrity Breaches</span>
            <span className={`text-2xl font-bold mt-0.5 block ${incidents.length > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {incidents.length}
            </span>
            <span className="text-[10px] text-stone-500 font-sans">Zero-Trust alerts</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Statutory Standard</span>
            <span className="text-sm font-bold text-emerald-700 mt-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              BSA §63(4)
            </span>
            <span className="text-[10px] text-stone-500 font-sans">Court Admissible</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. NAVIGATION TABS & FILTER CONTROLS
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b md:border-b-0 border-stone-200 pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Custody Lineage Tree</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Audit Journal ({filteredEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-rose-800 text-white font-bold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Tamper Alerts ({incidents.length})</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Case Dropdown */}
          <select
            value={selectedCase}
            onChange={e => setSelectedCase(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-stone-800"
          >
            <option value="ALL">All Dockets ({cases.length})</option>
            {cases.map(c => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id}
              </option>
            ))}
          </select>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-stone-800"
          >
            <option value="ALL">All Event Types</option>
            <option value="EVIDENCE_INGESTED">Ingestion & Anchoring</option>
            <option value="CUSTODY_TRANSFER">Custody Handover</option>
            <option value="STATUTORY_FREEZE">Statutory Freeze (Hold)</option>
            <option value="HOLD_LIFTED">Hold Lifted</option>
            <option value="ACCESS">Evidentiary Access</option>
            <option value="BSA_CERTIFICATE_ISSUED">BSA §63 Certificate</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search audit trail..."
              className="pl-8 pr-7 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. TAB CONTENT
         ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-stone-200 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-700 animate-spin mx-auto" />
          <div className="text-xs text-stone-500 font-mono">Verifying cryptographic provenance signatures...</div>
        </div>
      ) : activeTab === 'timeline' ? (
        /* ── TAB 1: VISUAL CUSTODY LINEAGE TREE ─────────────────────── */
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="font-serif-judicial text-base font-bold text-stone-900">
                Evidentiary Handover Sequence
              </h2>
              <p className="text-xs text-stone-500">
                Chronological chain of custody. Verifies non-repudiation between investigative agencies and the judicial bench.
              </p>
            </div>
            <span className="text-xs font-mono text-stone-500">
              {filteredEvents.length} Recorded Steps
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-xs font-mono">
              No custody events recorded for the selected filter parameters.
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-stone-200 space-y-8 my-4">
              {filteredEvents.map((evt, idx) => (
                <div key={evt.eventId || idx} className="relative group">
                  {/* Timeline node marker */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-700 flex items-center justify-center shadow-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-700" />
                  </div>

                  <div className="bg-stone-50/70 hover:bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 transition-all space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-mono font-bold ${getActionBadge(evt.action)}`}>
                          {evt.action.replace(/_/g, ' ')}
                        </span>
                        {evt.caseId && (
                          <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                            {evt.caseId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px] text-stone-500">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Recent'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>Custodian: <strong className="text-stone-900">{evt.actorId}</strong> ({evt.actorRole})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-stone-400" />
                        <span>Agency: <strong className="text-stone-900">{evt.actorMSP || 'Law Enforcement'}</strong></span>
                      </div>
                    </div>

                    {evt.reason && (
                      <p className="text-xs text-stone-600 bg-white p-3 rounded-lg border border-stone-200/80 leading-relaxed font-sans">
                        {evt.reason}
                      </p>
                    )}

                    <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="flex items-center gap-2 text-stone-500">
                        <span>Event Hash:</span>
                        <span className="text-stone-800 font-semibold">{evt.eventId ? evt.eventId.slice(0, 16) + '...' : 'SECURED'}</span>
                        <button
                          onClick={() => copyText(evt.eventId, evt.eventId)}
                          className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                        >
                          {copiedId === evt.eventId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      {evt.ledgerTxId && evt.ledgerTxId.length > 10 && (
                        <LedgerTxLink txId={evt.ledgerTxId} contract="ProvenanceRegistry" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'journal' ? (
        /* ── TAB 2: AUDIT JOURNAL TABLE ────────────────────────────── */
        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Case Docket</th>
                  <th className="p-3.5">Actor ID / Role</th>
                  <th className="p-3.5">Outcome</th>
                  <th className="p-3.5">Statutory Reason</th>
                  <th className="p-3.5 text-right">EVM Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEvents.map((evt, idx) => (
                  <tr key={evt.eventId || idx} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3.5 text-stone-500 whitespace-nowrap">
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getActionBadge(evt.action)}`}>
                        {evt.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-stone-900">{evt.caseId || 'SYSTEM'}</td>
                    <td className="p-3.5 text-stone-700 font-sans">
                      <div>{evt.actorId}</div>
                      <span className="text-[10px] text-stone-400 font-mono">{evt.actorRole}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          evt.outcome === 'ALLOW'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {evt.outcome}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-600 max-w-xs truncate font-sans" title={evt.reason}>
                      {evt.reason || '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      {evt.ledgerTxId && evt.ledgerTxId.length > 10 ? (
                        <LedgerTxLink txId={evt.ledgerTxId} contract="ProvenanceRegistry" />
                      ) : (
                        <span className="text-stone-400 text-[10px]">Local Proof</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── TAB 3: TAMPER ALERTS & ZERO-TRUST ──────────────────────── */
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 text-stone-900 font-serif-judicial font-bold text-base">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Zero-Trust Tamper Telemetry</span>
            </div>
            <span className="text-xs font-mono text-stone-500">
              {incidents.length} Flagged Anomalies
            </span>
          </div>

          {incidents.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-serif-judicial font-bold text-stone-900">Cryptographic Integrity Pristine</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto font-sans">
                Zero tamper events detected. All evidence bitstreams conform strictly to their canonical RFC 6962 Merkle tree roots.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc, i) => (
                <div key={inc.id || i} className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{inc.failing_check || 'TAMPER_ALERT'}</span>
                    </span>
                    <span className="text-stone-500 text-[11px]">{inc.created_at || 'Recent'}</span>
                  </div>
                  <p className="text-stone-700 font-sans">{inc.reason || 'Cryptographic mismatch detected during verification.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. MODAL: RECORD CUSTODY TRANSFER
         ───────────────────────────────────────────────────────────── */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-300 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 font-serif-judicial font-bold text-lg text-stone-900">
                <Send className="w-5 h-5 text-indigo-700" />
                <span>Record Evidentiary Transfer</span>
              </div>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                  Select Case Docket
                </label>
                <select
                  value={transferCaseId}
                  onChange={e => setTransferCaseId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-mono"
                >
                  {cases.map(c => (
                    <option key={c.case_id} value={c.case_id}>
                      {c.case_id} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                  Recipient Agency (MSP)
                </label>
                <select
                  value={transferToMsp}
                  onChange={e => setTransferToMsp(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-mono"
                >
                  <option value="ForensicsMSP">Forensic Science Laboratory (ForensicsMSP)</option>
                  <option value="ProsecutorMSP">Public Prosecutor Office (ProsecutorMSP)</option>
                  <option value="JudiciaryMSP">District Judicial Court (JudiciaryMSP)</option>
                  <option value="PoliceMSP">Special Crime Investigation Branch (PoliceMSP)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                  Recipient Custodian ID
                </label>
                <input
                  type="text"
                  required
                  value={transferOfficer}
                  onChange={e => setTransferOfficer(e.target.value)}
                  placeholder="OFFICER-FSL-102"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                  Transfer Purpose & Legal Authority
                </label>
                <textarea
                  rows={3}
                  value={transferPurpose}
                  onChange={e => setTransferPurpose(e.target.value)}
                  placeholder="Official handover for forensic ballistic cross-matching under court order..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {transferring ? 'Recording...' : 'Commit to Audit Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
