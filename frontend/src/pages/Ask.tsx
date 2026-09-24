import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Bot,
  User as UserIcon,
  Send,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Folder,
  MessageSquare,
  ChevronRight,
  Cpu,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sliders,
  X,
  Check,
  Gavel,
  Scale,
  Copy,
  Printer,
  FileText,
  CornerDownLeft,
  ChevronDown
} from 'lucide-react';
import { askEvidence, getAIProviderConfigs } from '../api/query';
import { getCases } from '../api/audit';
import { QueryResponse, Citation, AccessInfo } from '../lib/types';
import { CitationChip } from '../components/CitationChip';
import { TamperAlert } from '../components/TamperAlert';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  responseMeta?: QueryResponse;
  caseScope?: string;
}

const STATUTORY_QUICK_ACTIONS = [
  {
    category: 'STATUTORY AUDIT',
    title: 'BSA §63 Admissibility Brief',
    query: 'Analyze the admissibility of electronic evidence in this case under Section 63 of Bharatiya Sakshya Adhiniyam (BSA 2023).',
    icon: Scale,
  },
  {
    category: 'CHAIN OF CUSTODY',
    title: 'Verify Custody Chronology',
    query: 'Audit the chronological chain of custody transitions for all seized exhibits in this case docket.',
    icon: ShieldCheck,
  },
  {
    category: 'TAMPER DETECTION',
    title: 'Check Hash & Merkle Discrepancy',
    query: 'Verify all document SHA-256 hashes against on-chain Polygon Amoy Merkle tree roots to identify any tampering.',
    icon: AlertTriangle,
  },
  {
    category: 'FORENSIC SUMMARY',
    title: 'Summarize Seized Evidence',
    query: 'Provide an exhaustive forensic summary of all electronic exhibits, phone extractions, and FIR records ingested.',
    icon: FileText,
  },
  {
    category: 'WITNESS CROSS-CHECK',
    title: 'Cross-Examine Statements',
    query: 'Extract witness statements and identify any factual contradictions or inconsistencies across testimonies.',
    icon: MessageSquare,
  },
];

const SUGGESTED_PILLS = [
  'What exhibits are anchored on-chain?',
  'Draft Section 65B Certificate brief',
  'Summarize forensic ballistic findings',
  'Audit access logs and clearance levels',
];

export const AskPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedCase, setSelectedCase] = useState(searchParams.get('case') || '');
  const [selectedTier, setSelectedTier] = useState<'auto' | 'tier1' | 'tier2' | 'tier3' | 'tier4'>('auto');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [cases, setCases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI Configuration Keys State
  const [tier1Key, setTier1Key] = useState(localStorage.getItem('pv_tier1_key') || '');
  const [tier2Key, setTier2Key] = useState(localStorage.getItem('pv_tier2_key') || '');
  const [tier3Key, setTier3Key] = useState(localStorage.getItem('pv_tier3_key') || '');
  const [tier4Key, setTier4Key] = useState(localStorage.getItem('pv_tier4_key') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pv_tier1_key', tier1Key.trim());
    localStorage.setItem('pv_tier2_key', tier2Key.trim());
    localStorage.setItem('pv_tier3_key', tier3Key.trim());
    localStorage.setItem('pv_tier4_key', tier4Key.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowConfigModal(false);
    }, 900);
  };

  useEffect(() => {
    getCases()
      .then((res) => {
        const ids = res.map((c) => c.case_id);
        setCases(ids);
        if (!selectedCase && ids.length > 0) {
          const caseFromParam = searchParams.get('case');
          if (caseFromParam && ids.includes(caseFromParam)) {
            setSelectedCase(caseFromParam);
          }
        }
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (queryToSubmit?: string, overrideCase?: string) => {
    const text = (queryToSubmit || inputText).trim();
    if (!text || loading) return;

    const activeCase = overrideCase !== undefined ? overrideCase : selectedCase;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      caseScope: activeCase || 'Global Evidence Scope',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setElapsedSeconds(0);
    setLoadingStep('1/3 Scoring vector similarity across encrypted exhibits...');

    const startEpoch = Date.now();
    const intervalId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startEpoch) / 1000));
    }, 1000);

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('2/3 Verifying Merkle proofs against Polygon Amoy roots (80002)...');
      }, 700);
      const stepTimer2 = setTimeout(() => {
        setLoadingStep('3/3 Synthesizing statutory judicial brief with sovereign legal LLM...');
      }, 1600);

      const res = await askEvidence(text, activeCase ? [activeCase] : [], { preferredTier: selectedTier });
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.answer || res.message || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseMeta: res,
        caseScope: activeCase || 'Global Evidence Scope',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error processing judicial query: ${err.response?.data?.detail || err.message || 'Unknown network error. Please ensure backend is running.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      clearInterval(intervalId);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => setMessages([]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const printLegalBrief = (msgText: string, caseScope?: string) => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Proof Vault — Statutory Evidence Brief</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { font-size: 22px; border-bottom: 2px solid #111; padding-bottom: 8px; }
            .meta { font-family: monospace; font-size: 12px; margin-bottom: 20px; color: #555; }
            .content { white-space: pre-wrap; font-size: 14px; }
            .footer { margin-top: 40px; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Proof Vault — Judicial Intelligence Analysis Brief</h1>
          <div class="meta">
            DOCKET / CASE: ${caseScope || 'Global Evidence Scope'}<br/>
            TIMESTAMP: ${new Date().toISOString()}<br/>
            TRUST ANCHOR: Polygon Amoy Testnet (Chain ID 80002)<br/>
            GOVERNING LAW: Bharatiya Sakshya Adhiniyam §63 / IEA §65B
          </div>
          <div class="content">${msgText.replace(/</g, '&lt;')}</div>
          <div class="footer">
            Generated by Proof Vault Sovereign Legal AI • Cryptographically anchored and verified.
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };

  return (
    <div
      className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex flex-col lg:flex-row gap-5"
      style={{ minHeight: 'calc(100vh - 5.5rem)' }}
    >
      {/* ── Left Sidebar (Dossier & Legal Actions) ──────────────────── */}
      <aside
        className="w-full lg:w-80 shrink-0 rounded-3xl p-5 flex flex-col justify-between space-y-5 border"
        style={{
          background: '#FFFFFF',
          borderColor: '#D8CFBC',
          boxShadow: '0 4px 20px rgba(17,18,13,0.04)',
        }}
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <div
                className="h-10 px-2 rounded-xl flex items-center justify-center shadow-xs border bg-white shrink-0"
                style={{ borderColor: '#D8CFBC' }}
              >
                <img src="/proofvault-logo.png" alt="Proof Vault" className="h-7 w-auto object-contain" />
              </div>
              <div>
                <h2 className="font-serif-judicial font-bold text-sm" style={{ color: '#11120D' }}>
                  Judicial AI Console
                </h2>
                <div className="text-[10px] font-mono flex items-center gap-1" style={{ color: '#565449' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Polygon Amoy (80002)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearChat}
              title="Reset Conversation"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Scope Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: '#565449' }}>
              <span>Dossier Scope</span>
              <span className="text-[10px] lowercase font-normal opacity-70">{cases.length} active</span>
            </label>
            <div className="relative">
              <select
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer appearance-none"
                style={{
                  background: '#FFFBF4',
                  borderColor: '#D8CFBC',
                  color: '#11120D',
                }}
              >
                <option value="">🌐 All Case Dossiers (Global)</option>
                {cases.map((c) => (
                  <option key={c} value={c}>
                    📁 {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-stone-500" />
            </div>
          </div>

          {/* Model Cascading Tier Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: '#565449' }}>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> AI Engine
              </span>
              {isAdmin && (
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="text-[10px] font-bold text-stone-600 hover:text-stone-900 underline cursor-pointer"
                >
                  Configure Keys
                </button>
              )}
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono font-semibold border outline-none cursor-pointer"
              style={{
                background: '#FFFBF4',
                borderColor: '#D8CFBC',
                color: '#11120D',
              }}
            >
              <option value="auto">⚡ Auto Sovereign Cascade</option>
              <option value="tier1">Tier 1: GPT-6 Astra (Forensic)</option>
              <option value="tier2">Tier 2: Grok 4.6 (Judicial)</option>
              <option value="tier3">Tier 3: Nemotron 3 (Statutory)</option>
              <option value="tier4">Tier 4: Gemini 3.8 (Evidence RAG)</option>
            </select>
          </div>

          {/* Statutory Quick Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: '#565449' }}>
              Statutory Quick Audits
            </div>
            <div className="space-y-1.5">
              {STATUTORY_QUICK_ACTIONS.map((action, idx) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(action.query)}
                    disabled={loading}
                    className="w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 group cursor-pointer disabled:opacity-50"
                    style={{
                      background: '#FFFBF4',
                      borderColor: '#D8CFBC',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#11120D';
                      (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#D8CFBC';
                      (e.currentTarget as HTMLElement).style.background = '#FFFBF4';
                    }}
                  >
                    <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-900 group-hover:text-amber-100 transition-colors shrink-0 mt-0.5">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono font-semibold text-stone-500 uppercase tracking-tight">
                        {action.category}
                      </div>
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {action.title}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all mt-1" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Role Card */}
        <div
          className="p-3.5 rounded-2xl border space-y-1"
          style={{ background: 'rgba(216,207,188,0.2)', borderColor: '#D8CFBC' }}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] font-bold text-stone-500 uppercase">Clearance Holder</span>
            <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-stone-900 text-amber-50">
              {user?.role || 'ADMIN'}
            </span>
          </div>
          <div className="text-xs font-bold text-stone-900 truncate">
            {user?.username || 'Sovereign Officer'}
          </div>
          <div className="text-[10px] font-mono text-stone-600">
            MSP: {user?.msp_id || 'PoliceMSP'} · §63 Clearance Granted
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ────────────────────────────────────────── */}
      <section
        className="flex-1 rounded-3xl flex flex-col justify-between overflow-hidden border"
        style={{
          background: '#FFFFFF',
          borderColor: '#D8CFBC',
          boxShadow: '0 4px 24px rgba(17,18,13,0.06)',
          height: 'calc(100vh - 6rem)',
        }}
      >
        {/* Top Chat Bar */}
        <header
          className="px-6 py-4 flex items-center justify-between border-b shrink-0"
          style={{
            background: '#FFFFFF',
            borderColor: '#E8E0D1',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center p-2 shrink-0 shadow-sm"
              style={{ background: '#11120D' }}
            >
              <Gavel className="w-5 h-5" style={{ color: '#D8CFBC' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-judicial text-base font-bold text-stone-900">
                  Judicial Evidence Legal Assistant
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Merkle-Gated
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Scope: <strong className="text-stone-800 font-mono">{selectedCase || 'Global Evidence Vault'}</strong> · Governed by BSA §63 / IEA §65B
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendMessage('Generate complete §63 court admissibility certificate report for this docket.')}
              disabled={loading}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-300 hover:border-stone-900 bg-white text-stone-800 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Court Certificate</span>
            </button>
            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
              title="Clear Thread"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto py-10 space-y-6">
              <div
                className="h-16 px-4 rounded-3xl flex items-center justify-center shadow-xs border bg-white"
                style={{ borderColor: '#D8CFBC' }}
              >
                <img src="/proofvault-logo.png" alt="Proof Vault" className="h-11 w-auto object-contain" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif-judicial text-2xl sm:text-3xl font-bold text-stone-900">
                  Sovereign Judicial Intelligence
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Ask questions about ingested forensic exhibits, phone extractions, FIRs, and witness statements. Every response is verified against on-chain Merkle tree roots with zero hallucination.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {STATUTORY_QUICK_ACTIONS.slice(0, 4).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(item.query)}
                    className="p-3.5 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer"
                    style={{ background: '#FFFBF4', borderColor: '#D8CFBC' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#11120D'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D8CFBC'; }}
                  >
                    <div className="text-[10px] font-mono font-bold text-stone-500 uppercase">{item.category}</div>
                    <div className="text-xs font-bold text-stone-900 mt-0.5">{item.title}</div>
                    <div className="text-[11px] text-stone-600 line-clamp-2 mt-1">{item.query}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Emblem */}
                {msg.sender === 'assistant' && (
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-sm"
                    style={{ background: '#11120D' }}
                  >
                    <Gavel className="w-5 h-5 text-amber-100" />
                  </div>
                )}

                {/* Message Body */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 space-y-3 shadow-sm border ${
                    msg.sender === 'user'
                      ? 'bg-stone-900 text-amber-50 border-stone-800'
                      : 'bg-white text-stone-900 border-stone-300'
                  }`}
                  style={msg.sender === 'assistant' ? { background: '#FFFFFF', borderColor: '#D8CFBC' } : undefined}
                >
                  {/* Message Meta Header */}
                  <div className="flex items-center justify-between gap-3 text-[11px] font-mono pb-2 border-b border-stone-200/50">
                    <span className="font-bold flex items-center gap-1.5">
                      {msg.sender === 'user' ? (
                        <>
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>{user?.role || 'INVESTIGATOR'}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-stone-900 font-serif-judicial font-bold">Judicial Intelligence Output</span>
                        </>
                      )}
                    </span>
                    <span className="opacity-70">{msg.timestamp}</span>
                  </div>

                  {/* Quarantine Alert */}
                  {msg.responseMeta?.tamper_quarantined && (
                    <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 font-mono">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                      <span>Zero-Trust Intercept: Unverified chunks quarantined. Only verified on-chain evidence synthesized.</span>
                    </div>
                  )}

                  {/* Tamper Alert */}
                  {msg.responseMeta?.tamper_detected ? (
                    <TamperAlert
                      message={msg.responseMeta?.message || msg.text}
                      txId={msg.responseMeta?.tamper_alert_tx}
                    />
                  ) : (
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>
                  )}

                  {/* Verified Citations */}
                  {msg.responseMeta?.citations && msg.responseMeta.citations.length > 0 && (
                    <div className="pt-2.5 space-y-2 border-t border-stone-200">
                      <div className="text-[11px] font-mono font-bold text-stone-600 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cryptographically Anchored Citations:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.responseMeta.citations.map((c: Citation, i: number) => (
                          <CitationChip key={i} citation={c} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar for Assistant Messages */}
                  {msg.sender === 'assistant' && (
                    <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-500 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        {msg.responseMeta?.provider_tier && (
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-bold">
                            {msg.responseMeta.provider_tier}
                          </span>
                        )}
                        {msg.responseMeta?.timings_ms && (
                          <span>
                            {msg.responseMeta.timings_ms.llm_ms || 0}ms · Verified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="p-1 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => printLegalBrief(msg.text, msg.caseScope)}
                          className="p-1 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Print Legal Brief"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Print</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Icon */}
                {msg.sender === 'user' && (
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-sm"
                    style={{ background: '#565449' }}
                  >
                    <UserIcon className="w-5 h-5 text-amber-100" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading Animation Card */}
          {loading && (
            <div className="flex gap-3.5 justify-start items-start">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-sm animate-pulse"
                style={{ background: '#11120D' }}
              >
                <Gavel className="w-5 h-5 text-amber-100" />
              </div>
              <div
                className="rounded-3xl p-4 sm:p-5 border space-y-2 max-w-md"
                style={{ background: '#FFFFFF', borderColor: '#D8CFBC' }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-serif-judicial font-bold text-sm text-stone-900">
                    Sovereign Legal AI Reasoning...
                  </span>
                  <span className="text-xs font-mono text-stone-400">({elapsedSeconds}s)</span>
                </div>
                <div className="text-xs font-mono text-stone-600 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-stone-500 animate-spin" />
                  <span>{loadingStep || 'Scoring evidence chunks...'}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Box Console */}
        <div
          className="p-3 sm:p-4 border-t space-y-2.5 shrink-0"
          style={{
            background: '#FFFFFF',
            borderColor: '#E8E0D1',
          }}
        >
          {/* Quick Suggestion Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[10px] font-mono font-bold text-stone-400 uppercase shrink-0">
              Suggestions:
            </span>
            {SUGGESTED_PILLS.map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(pill)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50"
                style={{
                  background: 'rgba(216,207,188,0.2)',
                  borderColor: '#D8CFBC',
                  color: '#565449',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#11120D';
                  (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#D8CFBC';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(216,207,188,0.2)';
                }}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Input Textarea Bar */}
          <div
            className="flex items-end gap-2 p-2 rounded-2xl border transition-all"
            style={{
              background: '#FFFBF4',
              borderColor: '#D8CFBC',
              boxShadow: '0 2px 12px rgba(17,18,13,0.04)',
            }}
          >
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Inquire with Judicial AI (e.g., 'Summarize Section 65B compliance for FIR-2024-001')..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-xs sm:text-sm px-2 py-1 max-h-32 text-stone-900 placeholder:text-stone-400"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              style={{
                background: '#11120D',
                color: '#FFFBF4',
              }}
              onMouseEnter={e => {
                if (!loading && inputText.trim()) (e.currentTarget as HTMLElement).style.background = '#1e1f18';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#11120D';
              }}
            >
              <span>Submit</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 px-1">
            <span>Press Enter ↵ to submit · Shift+Enter for new line</span>
            <span>Proof Vault Sovereign Legal Intelligence · All answers verified on Polygon Amoy</span>
          </div>
        </div>
      </section>

      {/* ── Admin AI Configuration Modal ──────────────────────────── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <div
            className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 animate-scale-in"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #D8CFBC',
              boxShadow: '0 20px 60px rgba(17,18,13,0.2)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-stone-900" />
                <h3 className="font-serif-judicial font-bold text-lg text-stone-900">
                  AI Provider Engine Keys
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Set provider API keys for the 4-tier cascading judicial reasoning pipeline. Stored locally in your browser.
            </p>

            <form onSubmit={handleSaveKeys} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono font-bold text-stone-700 block mb-1">
                  Tier 1: OpenAI / GPT-6 Astra Key
                </label>
                <input
                  type="password"
                  value={tier1Key}
                  onChange={(e) => setTier1Key(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono"
                  style={{ background: '#FFFBF4', borderColor: '#D8CFBC' }}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-stone-700 block mb-1">
                  Tier 2: xAI / Grok 4.6 Key
                </label>
                <input
                  type="password"
                  value={tier2Key}
                  onChange={(e) => setTier2Key(e.target.value)}
                  placeholder="xai-..."
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono"
                  style={{ background: '#FFFBF4', borderColor: '#D8CFBC' }}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-stone-700 block mb-1">
                  Tier 3: NVIDIA Nemotron Key
                </label>
                <input
                  type="password"
                  value={tier3Key}
                  onChange={(e) => setTier3Key(e.target.value)}
                  placeholder="nvapi-..."
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono"
                  style={{ background: '#FFFBF4', borderColor: '#D8CFBC' }}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-stone-700 block mb-1">
                  Tier 4: Google Gemini Key
                </label>
                <input
                  type="password"
                  value={tier4Key}
                  onChange={(e) => setTier4Key(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono"
                  style={{ background: '#FFFBF4', borderColor: '#D8CFBC' }}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-amber-50 bg-stone-900 hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save API Keys</span>
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

export default AskPage;
