import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  FileText,
  Shield,
  Upload,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  Layers,
  History,
  HelpCircle,
  Gavel,
  Plus,
  ArrowRight,
  Send,
  Building2,
  X,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { getCases, createCase, updateCaseStatus, recordCustodyEvent } from '../api/audit';
import { Case } from '../lib/types';
import { formatClassificationBadge } from '../lib/format';
import { ensurePolygonAmoyNetwork, POLYGONSCAN_BASE, PROVENANCE_REGISTRY_ADDR, anchorCaseOnChain, anchorCustodyTransferOnChain } from '../lib/polygon';
import { ethers } from 'ethers';

const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 'https://kraxwwwkhprczuiqkxuw.supabase.co';
const SUPABASE_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_yBEvcnfdSVjN_5ZlxSw_5w_bDe53Czq';
const EVIDENCE_REGISTRY_ADDR = ((import.meta as any).env?.VITE_POLYGON_EVIDENCE_REGISTRY as string) || '0xF022e8E8E7FD5d565fAb24dC74B6fAc1c8760a01';

export const CaseWorkspace: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMsp, setSelectedMsp] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedClearance, setSelectedClearance] = useState<string>('ALL');
  const [copiedCaseId, setCopiedCaseId] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [activeTransferCase, setActiveTransferCase] = useState<Case | null>(null);

  // Form states
  const [newCaseId, setNewCaseId] = useState('');
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCaseClearance, setNewCaseClearance] = useState('CONFIDENTIAL');
  const [newCaseMsp, setNewCaseMsp] = useState('PoliceMSP');
  const [savingCase, setSavingCase] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Transfer form states
  const [transferToMsp, setTransferToMsp] = useState('ForensicsMSP');
  const [transferOfficerId, setTransferOfficerId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Chain anchor toast
  const [chainToast, setChainToast] = useState<{ caseId: string; txHash: string; url: string; title?: string; subtitle?: string } | null>(null);
  const showChainToast = (caseId: string, txHash: string, title = 'Anchored on Polygon Amoy ✓', subtitle = '') => {
    const url = `${POLYGONSCAN_BASE}/tx/${txHash}`;
    setChainToast({ caseId, txHash, url, title, subtitle });
    setTimeout(() => setChainToast(null), 12000);
  };

  const navigate = useNavigate();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await getCases();
      setCases(data);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const copyCaseId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedCaseId(id);
    setTimeout(() => setCopiedCaseId(null), 1500);
  };

  const handleToggleLegalHold = async (c: Case, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = c.status === 'LEGAL_HOLD' ? 'ACTIVE' : 'LEGAL_HOLD';
    try {
      await updateCaseStatus(
        c.case_id,
        newStatus as any,
        newStatus === 'LEGAL_HOLD'
          ? 'Statutory evidence freeze ordered under BSA §63 by Judicial Magistrate'
          : 'Statutory freeze lifted by order of Competent Authority'
      );
      setCases(prev => prev.map(item => (item.case_id === c.case_id ? { ...item, status: newStatus } : item)));
    } catch (err: any) {
      setFormError(`Status update failed: ${err.message}`);
    }
  };

  const handleCreateCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseId.trim() || !newCaseTitle.trim()) {
      setFormError('Case ID and Title are mandatory');
      return;
    }
    setSavingCase(true);
    setFormError(null);
    const caseIdNorm = newCaseId.trim().toUpperCase();
    try {
      // Step 1: Enforce on-chain case anchoring on Polygon Amoy via MetaMask wallet popup
      const { txHash } = await anchorCaseOnChain(caseIdNorm);
      console.info(`[Chain] logCase(${caseIdNorm}) confirmed: ${txHash}`);

      // Step 2: Save to database only after blockchain transaction succeeds
      const created = await createCase({
        case_id: caseIdNorm,
        title: newCaseTitle.trim(),
        description: newCaseDesc.trim(),
        classification_ceiling: newCaseClearance,
        owning_msp: newCaseMsp,
      });

      setCases(prev => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewCaseId('');
      setNewCaseTitle('');
      setNewCaseDesc('');
      showChainToast(caseIdNorm, txHash, 'Docket Anchored on Polygon Amoy ✓', `Case ${caseIdNorm} permanently registered on-chain`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to initialize case on Polygon blockchain');
    } finally {
      setSavingCase(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransferCase) return;
    if (!transferOfficerId.trim()) {
      setTransferError('Recipient Officer ID is required');
      return;
    }
    setTransferring(true);
    setTransferError(null);
    try {
      // Step 1: Enforce on-chain custody transfer on Polygon Amoy via MetaMask wallet popup
      const { txHash, explorerUrl } = await anchorCustodyTransferOnChain({
        caseId: activeTransferCase.case_id,
        fromMsp: activeTransferCase.owning_msp || 'PoliceMSP',
        toMsp: transferToMsp,
        recipientOfficerId: transferOfficerId.trim(),
        reason: transferReason.trim(),
      });
      console.info(`[Chain] anchorCustodyTransferOnChain(${activeTransferCase.case_id}) confirmed: ${txHash}`);

      // Step 2: Record custody event in database with immutable on-chain tx reference
      await recordCustodyEvent({
        actorId: localStorage.getItem('sdms_user_id') || 'USR-001',
        actorRole: 'INVESTIGATOR',
        actorMSP: activeTransferCase.owning_msp,
        action: 'CUSTODY_TRANSFER',
        caseId: activeTransferCase.case_id,
        outcome: 'ALLOW',
        reason: `Formal evidentiary custody transferred to ${transferToMsp} (Officer: ${transferOfficerId.trim()}). Purpose: ${transferReason.trim() || 'Statutory Forensic Evaluation'}`,
        ledgerTxId: txHash,
      });

      // Step 3: Update case owning_msp in Supabase
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/cases?case_id=eq.${encodeURIComponent(activeTransferCase.case_id)}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            owning_msp: transferToMsp,
            updated_at: new Date().toISOString(),
          }),
        });
      } catch (dbErr) {
        console.warn('Failed to update case owning_msp in database:', dbErr);
      }

      // Step 4: Update local state & show elegant on-chain toast (no browser alert())
      setCases(prev => prev.map(item => (item.case_id === activeTransferCase.case_id ? { ...item, owning_msp: transferToMsp } : item)));
      setIsTransferModalOpen(false);
      setTransferReason('');
      setTransferOfficerId('');
      showChainToast(
        activeTransferCase.case_id,
        txHash,
        'Custody Transferred on Polygon Amoy ✓',
        `Transferred from ${activeTransferCase.owning_msp || 'PoliceMSP'} to ${transferToMsp} (Officer ${transferOfficerId.trim()})`
      );
    } catch (err: any) {
      setTransferError(err.message || 'Custody transfer failed on Polygon blockchain');
    } finally {
      setTransferring(false);
    }
  };

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.case_id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      const matchesMsp = selectedMsp === 'ALL' || c.owning_msp === selectedMsp;
      const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      const matchesClearance = selectedClearance === 'ALL' || c.classification_ceiling === selectedClearance;

      return matchesSearch && matchesMsp && matchesStatus && matchesClearance;
    });
  }, [cases, searchQuery, selectedMsp, selectedStatus, selectedClearance]);

  // Aggregate stats
  const totalFiles = cases.reduce((sum, c) => sum + (c.active_document_count || 0), 0);
  const legalHoldCount = cases.filter(c => c.status === 'LEGAL_HOLD').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Chain Anchor Toast */}
      {chainToast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, maxWidth: '420px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a2f 100%)', border: '1px solid #22c55e', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(34,197,94,0.15)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e', marginBottom: '2px' }}>Anchored on Polygon Amoy ✓</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Docket <strong style={{ color: '#e2e8f0' }}>{chainToast.caseId}</strong> is permanently on-chain</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginBottom: '10px', wordBreak: 'break-all' }}>TX: {chainToast.txHash}</div>
                <a href={chainToast.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(130,71,229,0.15)', border: '1px solid rgba(130,71,229,0.4)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, color: '#a78bfa', textDecoration: 'none' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  View on Polygonscan
                </a>
              </div>
              <button onClick={() => setChainToast(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', lineHeight: 1 }}>✕</button>
            </div>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────
          1. SOVEREIGN JUDICIAL COMMAND DECK (HEADER)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-stone-900 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                <Gavel className="w-3.5 h-3.5 text-amber-400" />
                BHARATIYA SAKSHYA ADHINIYAM (BSA §63)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                EVM TRUST ANCHORED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-judicial font-bold text-stone-900 tracking-tight">
              Sovereign Judicial Case Dockets
            </h1>
            <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
              Court dockets, electronic FIRs, and forensic registers. Each dossier provides a deterministic custody root with cryptographic non-repudiation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-crimson-800 hover:bg-crimson-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize Docket</span>
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Ingest Evidence</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Ribbon */}
        <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/70">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Active Dockets</span>
            <span className="text-2xl font-bold text-stone-900 mt-0.5 block">{cases.length}</span>
            <span className="text-[10px] text-stone-500 font-sans">State jurisdictions</span>
          </div>
          <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/70">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Sealed Evidence</span>
            <span className="text-2xl font-bold text-indigo-700 mt-0.5 block">{totalFiles}</span>
            <span className="text-[10px] text-stone-500 font-sans">Indexed Merkle chunks</span>
          </div>
          <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/70">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Statutory Holds</span>
            <span className={`text-2xl font-bold mt-0.5 block ${legalHoldCount > 0 ? 'text-amber-700' : 'text-stone-700'}`}>
              {legalHoldCount}
            </span>
            <span className="text-[10px] text-stone-500 font-sans">Court preservation orders</span>
          </div>
          <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/70">
            <span className="text-stone-500 text-[10px] uppercase font-bold block">Consensus State</span>
            <span className="text-sm font-bold text-emerald-700 mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Polygon Amoy
            </span>
            <span className="text-[10px] text-stone-500 font-sans">Chain ID 80002 Verified</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ASYMMETRIC WORKSPACE: LEFT FILTER RAIL + RIGHT DOCKETS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter & Command Rail (3.5 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-5">
            {/* Search Input */}
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono block mb-1.5">
                Dossier Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Case ID, title, FIR memo..."
                  className="w-full pl-10 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Owning Agency (MSP) Filter */}
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono block mb-2">
                Owning Agency (MSP)
              </label>
              <div className="space-y-1 text-xs">
                {[
                  { id: 'ALL', label: 'All Agencies', count: cases.length },
                  { id: 'PoliceMSP', label: 'Police Stations & Crime Branch', icon: Building2 },
                  { id: 'ForensicsMSP', label: 'Forensic Science Laboratories (FSL)', icon: Shield },
                  { id: 'JudiciaryMSP', label: 'District & Sessions Courts', icon: Gavel },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMsp(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedMsp === item.id
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {selectedMsp === item.id && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono block mb-2">
                Docket Status
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                {[
                  { id: 'ALL', label: 'All Status' },
                  { id: 'ACTIVE', label: 'Active Trial' },
                  { id: 'LEGAL_HOLD', label: 'Legal Hold' },
                  { id: 'DISPOSED', label: 'Disposed' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedStatus(item.id)}
                    className={`px-3 py-1.5 rounded-lg border text-center transition-colors cursor-pointer text-xs ${
                      selectedStatus === item.id
                        ? 'bg-crimson-800 text-white border-crimson-800 font-bold'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clearance Ceiling Filter */}
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono block mb-2">
                Classification Ceiling
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                {['ALL', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedClearance(lvl)}
                    className={`px-2 py-1 rounded-lg border text-center text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedClearance === lvl
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            {(searchQuery || selectedMsp !== 'ALL' || selectedStatus !== 'ALL' || selectedClearance !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMsp('ALL');
                  setSelectedStatus('ALL');
                  setSelectedClearance('ALL');
                }}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Right Docket Matrix (8.5 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-stone-600 px-1">
            <span>
              Showing <strong>{filteredCases.length}</strong> of {cases.length} registered dossiers
            </span>
            <button
              onClick={loadCases}
              className="text-crimson-800 hover:text-crimson-900 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-16 border border-stone-200 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-crimson-800 animate-spin mx-auto" />
              <div className="text-xs text-stone-500 font-mono">Loading sovereign case records...</div>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-dashed border-stone-300 text-center space-y-3">
              <Folder className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-sm font-serif-judicial font-bold text-stone-800">No Case Dockets Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No dossiers match your current filter parameters. Initialize a new case or clear filters to view records.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredCases.map(c => {
                const badge = formatClassificationBadge(c.classification_ceiling);
                const isHold = c.status === 'LEGAL_HOLD';

                return (
                  <div
                    key={c.case_id}
                    className={`bg-white rounded-2xl p-5 border transition-all shadow-xs hover:shadow-sm space-y-4 relative ${
                      isHold ? 'border-amber-300 bg-amber-50/10' : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {/* Top Docket Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-stone-100 text-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-crimson-800" />
                          <span>{c.case_id}</span>
                          <button
                            onClick={e => copyCaseId(c.case_id, e)}
                            className="text-stone-400 hover:text-stone-700 p-0.5 ml-1"
                            title="Copy Case ID"
                          >
                            {copiedCaseId === c.case_id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          {c.owning_msp || 'PoliceMSP'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg} ${badge.text}`}>
                          {c.classification_ceiling}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${
                            isHold
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isHold ? 'bg-amber-600' : 'bg-emerald-500'}`}></span>
                          <span>{c.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Case Title & Narrative */}
                    <div>
                      <h3 className="font-serif-judicial text-base font-bold text-stone-900 hover:text-crimson-800 transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-xs text-stone-600 font-sans leading-relaxed mt-1 line-clamp-2">
                        {c.description || 'Forensic investigation docket registered for statutory scrutiny.'}
                      </p>
                    </div>

                    {/* Footer Actions & Stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
                      <div className="flex items-center gap-3 font-mono text-stone-500">
                        <span className="flex items-center gap-1 font-semibold text-stone-800">
                          <Layers className="w-3.5 h-3.5 text-indigo-700" />
                          <span>{c.active_document_count ?? 0} Evidence Files</span>
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          BSA §63
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => navigate(`/documents?case=${c.case_id}`)}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>Browse Evidence</span>
                        </button>

                        <button
                          onClick={() => navigate(`/custody/${c.case_id}`)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                        >
                          <History className="w-3.5 h-3.5 text-stone-600" />
                          <span>Custody</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTransferCase(c);
                            setIsTransferModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                          title="Transfer legal custody to another agency"
                        >
                          <Send className="w-3.5 h-3.5 text-indigo-700" />
                          <span>Transfer</span>
                        </button>

                        <button
                          onClick={e => handleToggleLegalHold(c, e)}
                          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                            isHold
                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                              : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                          }`}
                          title={isHold ? 'Lift Statutory Legal Hold' : 'Apply Statutory Legal Hold Freeze'}
                        >
                          {isHold ? <Unlock className="w-3.5 h-3.5 text-amber-800" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MODAL: INITIALIZE NEW CASE DOCKET
         ───────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-300 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 font-serif-judicial font-bold text-lg text-stone-900">
                <Folder className="w-5 h-5 text-crimson-800" />
                <span>Initialize Statutory Crime Docket</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCaseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                  Docket Reference ID (e.g. CASE-106, FIR-302)
                </label>
                <input
                  type="text"
                  required
                  value={newCaseId}
                  onChange={e => setNewCaseId(e.target.value)}
                  placeholder="CASE-106"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                  Case Title / State Action
                </label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={e => setNewCaseTitle(e.target.value)}
                  placeholder="State vs Syndicate - Illicit Arms & Telemetry Seizure"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-sans"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                  Investigation Narrative / Charges
                </label>
                <textarea
                  rows={3}
                  value={newCaseDesc}
                  onChange={e => setNewCaseDesc(e.target.value)}
                  placeholder="Detailed synopsis of crime scene, FIR registration, and forensic seizure scope..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                    Clearance Ceiling
                  </label>
                  <select
                    value={newCaseClearance}
                    onChange={e => setNewCaseClearance(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-mono"
                  >
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="SECRET">SECRET</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                    Owning MSP
                  </label>
                  <select
                    value={newCaseMsp}
                    onChange={e => setNewCaseMsp(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-mono"
                  >
                    <option value="PoliceMSP">PoliceMSP</option>
                    <option value="ForensicsMSP">ForensicsMSP</option>
                    <option value="JudiciaryMSP">JudiciaryMSP</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCase}
                  className="px-5 py-2 bg-crimson-800 hover:bg-crimson-700 text-white font-semibold rounded-xl text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingCase ? 'Creating Docket...' : 'Initialize Docket in Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. MODAL: TRANSFER LEGAL CUSTODY
         ───────────────────────────────────────────────────────────── */}
      {isTransferModalOpen && activeTransferCase && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-300 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 font-serif-judicial font-bold text-lg text-stone-900">
                <Send className="w-5 h-5 text-indigo-700" />
                <span>Transfer Evidentiary Custody</span>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono space-y-1">
              <div>
                <span className="text-stone-500">Case Docket:</span>{' '}
                <strong className="text-stone-900">{activeTransferCase.case_id} — {activeTransferCase.title}</strong>
              </div>
              <div>
                <span className="text-stone-500">Current Custodian:</span>{' '}
                <strong className="text-stone-900">{activeTransferCase.owning_msp || 'PoliceMSP'}</strong>
              </div>
            </div>

            {transferError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {transferError}
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-3.5 text-xs">
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
                  <option value="ProsecutorMSP">Public Prosecution Directorate (ProsecutorMSP)</option>
                  <option value="JudiciaryMSP">District Judicial Bench (JudiciaryMSP)</option>
                  <option value="PoliceMSP">Special Crime Branch (PoliceMSP)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                  Recipient Officer / Custodian ID
                </label>
                <input
                  type="text"
                  required
                  value={transferOfficerId}
                  onChange={e => setTransferOfficerId(e.target.value)}
                  placeholder="OFFICER-FSL-409"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 font-mono uppercase text-[11px] block mb-1">
                  Statutory Purpose & Transfer Note
                </label>
                <textarea
                  rows={3}
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="Transfer for ballistic analysis and forensic bitstream verification under Section 63 BSA..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-sans"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-stone-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>On-Chain Custody Transfer: Signs and anchors immutable transfer log to <strong>Polygon Amoy (80002)</strong>.</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold ml-2">METAMASK</span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  {transferring ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Awaiting MetaMask & Anchoring...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Sign & Record Custody Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseWorkspace;
