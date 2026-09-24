import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Bot,
  User as UserIcon,
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
  Paperclip,
  ArrowUpIcon,
  ChevronDown,
} from 'lucide-react';
import { askEvidence, getAIProviderConfigs } from '../api/query';
import { getCases } from '../api/audit';
import { QueryResponse, Citation, AccessInfo } from '../lib/types';
import { CitationChip } from '../components/CitationChip';
import { TamperAlert } from '../components/TamperAlert';
import { Textarea } from '@/components/ui/textarea';
import { useAutoResizeTextarea } from '@/components/ui/v0-ai-chat';
import { cn } from '@/lib/utils';

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
    icon: <Scale className="w-3.5 h-3.5 text-[#565449]" />,
    label: "BSA §63 Admissibility",
    query: "Analyze the admissibility of electronic evidence in this case under Section 63 of Bharatiya Sakshya Adhiniyam (BSA 2023)."
  },
  {
    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />,
    label: "Custody Chronology",
    query: "Audit the chronological chain of custody transitions for all seized exhibits in this case docket."
  },
  {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />,
    label: "Hash & Merkle Audit",
    query: "Verify all document SHA-256 hashes against on-chain Polygon Amoy Merkle tree roots to identify any tampering."
  },
  {
    icon: <FileText className="w-3.5 h-3.5 text-[#565449]" />,
    label: "Forensic Summary",
    query: "Provide an exhaustive forensic summary of all electronic exhibits, phone extractions, and FIR records ingested."
  },
  {
    icon: <MessageSquare className="w-3.5 h-3.5 text-[#565449]" />,
    label: "Witness Cross-Check",
    query: "Extract witness statements and identify any factual contradictions or inconsistencies across testimonies."
  }
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

  // V0-style Auto-resizing textarea
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 56,
    maxHeight: 180,
  });

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

  const handleSendMessage = async (queryToSubmit?: string) => {
    const text = (queryToSubmit || inputText).trim();
    if (!text || loading) return;

    const activeCase = selectedCase;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      caseScope: activeCase || 'Global Evidence Scope',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    adjustHeight(true);
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
        text: `Error processing judicial query: ${err.response?.data?.detail || err.message || 'Unknown network error. Ensure backend server is active.'}`,
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
            h1 { font-size: 20px; border-bottom: 2px solid #111; padding-bottom: 8px; }
            .meta { font-family: monospace; font-size: 12px; margin-bottom: 20px; color: #555; }
            .content { white-space: pre-wrap; font-size: 14px; }
            .footer { margin-top: 40px; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Proof Vault — Judicial Intelligence Analysis Brief</h1>
          <div class="meta">
            DOCKET: ${caseScope || 'Global Evidence Scope'}<br/>
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
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 flex flex-col justify-between" style={{ minHeight: 'calc(100vh - 6rem)' }}>

      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div
        className="w-full rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 border shadow-xs"
        style={{ background: '#FFFFFF', borderColor: '#D8CFBC' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-9 px-2 rounded-xl flex items-center justify-center shrink-0 border bg-white shadow-xs"
            style={{ borderColor: '#D8CFBC' }}
          >
            <img src="/proofvault-logo.png" alt="Proof Vault" className="h-6 w-auto object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-serif-judicial font-bold text-sm sm:text-base text-stone-900 truncate">
                Judicial AI Intelligence
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3 h-3" /> Polygon Amoy (80002)
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-mono truncate">
              Scope: <strong>{selectedCase || 'All Case Dossiers'}</strong> · BSA §63 Grounded
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Scope Dropdown */}
          <div className="relative">
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer pr-7 appearance-none"
              style={{ background: '#FFFBF4', borderColor: '#D8CFBC', color: '#11120D' }}
            >
              <option value="">All Dossiers</option>
              {cases.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-stone-400" />
          </div>

          {/* Model Selector */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as any)}
            className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer hidden md:block"
            style={{ background: '#FFFBF4', borderColor: '#D8CFBC', color: '#11120D' }}
          >
            <option value="auto">⚡ Auto Cascade</option>
            <option value="tier1">Tier 1: GPT-6 Astra</option>
            <option value="tier2">Tier 2: Grok 4.6</option>
            <option value="tier3">Tier 3: Nemotron 3</option>
            <option value="tier4">Tier 4: Gemini 3.8</option>
          </select>

          {isAdmin && (
            <button
              onClick={() => setShowConfigModal(true)}
              title="Configure AI API Keys"
              className="p-2 rounded-xl border text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
              style={{ borderColor: '#D8CFBC' }}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleClearChat}
            title="Reset Conversation"
            className="p-2 rounded-xl border text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            style={{ borderColor: '#D8CFBC' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Message Conversation Feed ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-5 px-1 py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 sm:py-16 space-y-4 max-w-xl mx-auto">
            <div
              className="h-14 px-3.5 rounded-2xl flex items-center justify-center shadow-xs border bg-white"
              style={{ borderColor: '#D8CFBC' }}
            >
              <img src="/proofvault-logo.png" alt="Proof Vault" className="h-10 w-auto object-contain" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif-judicial font-bold text-stone-900 tracking-tight">
              What evidence would you like to examine?
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
              Inquire into electronic exhibits, forensic phone extractions, FIRs, and witness statements. Every claim is cross-verified with Polygon Amoy Merkle tree roots.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant Icon */}
              {msg.sender === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-white shadow-xs p-1"
                  style={{ borderColor: '#D8CFBC' }}
                >
                  <Gavel className="w-4 h-4 text-stone-900" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs border ${
                  msg.sender === 'user'
                    ? 'bg-stone-900 text-amber-50 border-stone-800'
                    : 'bg-white text-stone-900 border-[#D8CFBC]'
                }`}
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between text-[11px] font-mono pb-2 border-b border-stone-200/50">
                  <span className="font-bold flex items-center gap-1.5">
                    {msg.sender === 'user' ? (
                      <>
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>{user?.role || 'INVESTIGATOR'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-serif-judicial font-bold text-stone-900">Judicial Intelligence Output</span>
                      </>
                    )}
                  </span>
                  <span className="opacity-70">{msg.timestamp}</span>
                </div>

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

                {/* Citations */}
                {msg.responseMeta?.citations && msg.responseMeta.citations.length > 0 && (
                  <div className="pt-2 space-y-2 border-t border-stone-200">
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
                        <span className="hidden sm:inline">
                          {msg.responseMeta.timings_ms.llm_ms || 0}ms · Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="px-2 py-1 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
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
                        className="px-2 py-1 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Print Statutory Brief"
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
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-stone-900 text-amber-50 shadow-xs"
                >
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Step Animation */}
        {loading && (
          <div className="flex gap-3 justify-start items-start">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-white shadow-xs p-1 animate-pulse"
              style={{ borderColor: '#D8CFBC' }}
            >
              <Gavel className="w-4 h-4 text-stone-900" />
            </div>
            <div
              className="rounded-2xl p-4 border space-y-2 max-w-md bg-white shadow-xs"
              style={{ borderColor: '#D8CFBC' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
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

      {/* ── V0-Style Interactive Input Console ────────────────────── */}
      <div className="w-full space-y-3 pt-3">
        {/* V0 Elevated Input Container */}
        <div
          className="relative bg-white rounded-2xl border transition-colors shadow-sm focus-within:border-stone-900"
          style={{ borderColor: '#D8CFBC' }}
        >
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask Judicial AI a question about evidence, BSA §63 admissibility, or chain of custody..."
              className={cn(
                "w-full px-4 pt-3.5 pb-2",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-stone-900 text-xs sm:text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-stone-400 placeholder:text-xs sm:placeholder:text-sm",
                "min-h-[56px]"
              )}
              style={{ overflow: 'hidden' }}
            />
          </div>

          {/* V0 Bottom Action Toolbar inside box */}
          <div className="flex items-center justify-between p-2.5 border-t" style={{ borderColor: '#F2ECE0' }}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSendMessage("List all seized forensic evidence files and documents in this case.")}
                disabled={loading}
                className="group px-2 py-1 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer disabled:opacity-50"
                title="Attach / Inspect Case Evidence"
              >
                <Paperclip className="w-3.5 h-3.5 text-stone-700" />
                <span className="hidden sm:inline font-mono text-[11px]">Exhibits</span>
              </button>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
                Polygon Amoy EVM 80002
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || loading}
                className={cn(
                  "p-2 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40",
                  inputText.trim() && !loading
                    ? "bg-[#11120D] text-[#FFFBF4] hover:bg-[#1e1f18] shadow-xs"
                    : "bg-stone-100 text-stone-400 border border-stone-200"
                )}
                title="Send Query (Enter)"
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* V0 ActionButton Pill Carousel */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUTORY_QUICK_ACTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(item.query)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
              style={{ background: '#FFFFFF', borderColor: '#D8CFBC', color: '#565449' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#11120D';
                (e.currentTarget as HTMLElement).style.color = '#11120D';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#D8CFBC';
                (e.currentTarget as HTMLElement).style.color = '#565449';
              }}
            >
              {item.icon}
              <span className="text-[11px] sm:text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Admin Configuration Modal ─────────────────────────────── */}
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
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Configure provider API keys for the 4-tier cascading judicial reasoning pipeline. Stored locally in your browser.
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-amber-50 bg-stone-900 hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
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
