import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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

const SUGGESTED_PROMPTS = [
  { text: 'What evidence documents are ingested in this case?', caseId: '' },
  { text: 'What are the access and clearances granted to my current role?', caseId: '' },
  { text: 'Summarize all ingested witness statements for this case.', caseId: '' },
  { text: 'What forensic findings are documented in this case dossier?', caseId: '' },
  { text: 'Which documents have been anchored on-chain in this case?', caseId: '' },
  { text: 'Show the chain of custody events for this case.', caseId: '' },
];

/* ── Typing dots indicator ───────────────────────────────── */
const TypingIndicator: React.FC = () => (
  <div className="flex gap-1 items-center px-1 py-0.5">
    <span className="typing-dot w-2 h-2 rounded-full" style={{ background: '#a09d8f' }} />
    <span className="typing-dot w-2 h-2 rounded-full" style={{ background: '#a09d8f' }} />
    <span className="typing-dot w-2 h-2 rounded-full" style={{ background: '#a09d8f' }} />
  </div>
);

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
      caseScope: activeCase || 'All Cases',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setElapsedSeconds(0);
    setLoadingStep('Scoring & retrieving evidence chunks from vector store...');

    const startEpoch = Date.now();
    const intervalId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startEpoch) / 1000));
    }, 1000);

    try {
      const stepTimer = setTimeout(() => {
        setLoadingStep('Verifying Merkle proofs against Polygon EVM roots...');
      }, 700);
      const stepTimer2 = setTimeout(() => {
        setLoadingStep('Synthesizing grounded answer with Cascading Sovereign AI...');
      }, 1600);

      const res = await askEvidence(text, activeCase ? [activeCase] : [], { preferredTier: selectedTier });
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.answer || res.message || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseMeta: res,
        caseScope: activeCase || 'All Cases',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error processing query: ${err.response?.data?.detail || err.message || 'Unknown network error'}`,
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

  return (
    <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>

      {/* ── Chat Header ──────────────────────────────────────────── */}
      <div
        className="rounded-t-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3"
        style={{ background: '#11120D', borderBottom: '1px solid rgba(216,207,188,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="relative p-2.5 rounded-xl"
            style={{ background: 'rgba(216,207,188,0.1)', border: '1px solid rgba(216,207,188,0.2)' }}
          >
            <Gavel className="w-5 h-5" style={{ color: '#D8CFBC' }} />
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2"
              style={{ background: '#565449', ringColor: '#11120D' }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-serif-judicial font-bold tracking-tight" style={{ color: '#FFFBF4' }}>
                Judicial AI Intelligence
              </h1>
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold flex items-center gap-1"
                style={{ background: 'rgba(216,207,188,0.12)', border: '1px solid rgba(216,207,188,0.2)', color: '#D8CFBC' }}
              >
                <ShieldCheck className="w-3 h-3" /> Merkle-Gated
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#a09d8f' }}>
              Grounded, tamper-verified Q&A · 4-Tier Cascading AI · On-chain citations
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tier Selector */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs"
            style={{ background: 'rgba(255,251,244,0.06)', border: '1px solid rgba(216,207,188,0.15)' }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: '#D8CFBC' }} />
            <span className="font-medium" style={{ color: '#a09d8f' }}>Model:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="bg-transparent font-mono font-semibold focus:outline-none cursor-pointer text-xs border-0"
              style={{ color: '#FFFBF4' }}
            >
              <option value="auto" className="bg-stone-900 text-white">⚡ Auto Cascade</option>
              <option value="tier1" className="bg-stone-900 text-white">Tier 1: GPT-6 Astra</option>
              <option value="tier2" className="bg-stone-900 text-white">Tier 2: Grok 4.6</option>
              <option value="tier3" className="bg-stone-900 text-white">Tier 3: Nemotron 3</option>
              <option value="tier4" className="bg-stone-900 text-white">Tier 4: Gemini 3.8</option>
            </select>
          </div>

          {/* Admin AI Keys */}
          {isAdmin && (
            <button
              onClick={() => setShowConfigModal(true)}
              title="Configure AI API Keys (Root Admin Only)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: 'rgba(216,207,188,0.1)', border: '1px solid rgba(216,207,188,0.2)', color: '#D8CFBC' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(216,207,188,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(216,207,188,0.1)'; }}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>AI Keys</span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                style={{ background: 'rgba(216,207,188,0.2)', color: '#D8CFBC' }}
              >
                ADMIN
              </span>
              {(tier1Key || tier2Key || tier3Key || tier4Key) && (
                <span className="w-2 h-2 rounded-full" style={{ background: '#565449' }} />
              )}
            </button>
          )}

          {/* Case Scope */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
            style={{ background: 'rgba(255,251,244,0.06)', border: '1px solid rgba(216,207,188,0.15)' }}
          >
            <Folder className="w-3.5 h-3.5" style={{ color: '#D8CFBC' }} />
            <span className="font-medium" style={{ color: '#a09d8f' }}>Scope:</span>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="bg-transparent font-mono font-semibold focus:outline-none cursor-pointer text-xs border-0"
              style={{ color: '#FFFBF4' }}
            >
              <option value="" className="bg-stone-900 text-white">All Authorized Cases</option>
              {cases.map((id) => (
                <option key={id} value={id} className="bg-stone-900 text-white">{id}</option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-2 rounded-xl transition-colors"
              style={{ background: 'rgba(216,207,188,0.08)', border: '1px solid rgba(216,207,188,0.15)', color: '#a09d8f' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FFFBF4'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#a09d8f'; }}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Chat Messages ────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        style={{ background: '#FFFBF4', borderLeft: '1px solid #D8CFBC', borderRight: '1px solid #D8CFBC' }}
      >
        {messages.length === 0 ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-8 space-y-6">
            {/* Hero icon */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
              style={{ background: '#11120D', border: '1px solid rgba(216,207,188,0.15)' }}
            >
              <Scale className="w-10 h-10" style={{ color: '#D8CFBC' }} />
            </div>

            <div
              className="rounded-2xl p-6 shadow-sm space-y-3 w-full"
              style={{ background: '#FFFFFF', border: '1px solid #D8CFBC' }}
            >
              <h2 className="text-base font-serif-judicial font-bold" style={{ color: '#11120D' }}>
                How can I assist your evidentiary investigation?
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: '#565449' }}>
                Ask any question about registered electronic evidence, forensic reports, or FIRs. All answers are strictly synthesized from tamper-verified on-chain records.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                {[
                  { icon: <ShieldCheck className="w-3 h-3" />, label: 'Merkle-Verified' },
                  { icon: <Lock className="w-3 h-3" />, label: 'Zero-Trust Gate' },
                  { icon: <Zap className="w-3 h-3" />, label: '4-Tier AI' },
                ].map((b, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border"
                    style={{ background: 'rgba(216,207,188,0.2)', borderColor: '#D8CFBC', color: '#565449' }}
                  >
                    {b.icon}
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full space-y-2.5 text-left">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 px-1 font-mono"
                style={{ color: '#565449' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#D8CFBC' }} />
                Suggested Investigative Queries
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedCase(prompt.caseId);
                      handleSendMessage(prompt.text, prompt.caseId);
                    }}
                    className="p-3.5 rounded-xl text-left transition-all group flex flex-col justify-between"
                    style={{ background: '#FFFFFF', border: '1px solid #D8CFBC' }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = '#565449';
                      el.style.boxShadow = '0 4px 16px rgba(17,18,13,0.08)';
                      el.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = '#D8CFBC';
                      el.style.boxShadow = 'none';
                      el.style.transform = 'translateY(0)';
                    }}
                  >
                    <span className="text-xs font-medium leading-snug" style={{ color: '#11120D' }}>
                      "{prompt.text}"
                    </span>
                    <span
                      className="text-[10px] font-mono mt-2.5 flex items-center justify-between"
                      style={{ color: '#a09d8f' }}
                    >
                      <span>{prompt.caseId || 'Global'}</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot avatar */}
              {msg.sender === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: '#11120D', border: '1px solid rgba(216,207,188,0.15)' }}
                >
                  <Gavel className="w-4 h-4" style={{ color: '#D8CFBC' }} />
                </div>
              )}

              {/* Bubble */}
              <div
                className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm"
                style={
                  msg.sender === 'user'
                    ? {
                        background: '#11120D',
                        color: '#FFFBF4',
                        borderRadius: '1rem 1rem 0.25rem 1rem',
                      }
                    : {
                        background: '#FFFFFF',
                        border: '1px solid #D8CFBC',
                        color: '#11120D',
                        borderRadius: '1rem 1rem 1rem 0.25rem',
                      }
                }
              >
                {/* Meta header */}
                <div
                  className="flex items-center justify-between gap-3 text-[11px] pb-1.5 font-mono"
                  style={{
                    borderBottom: msg.sender === 'user' ? '1px solid rgba(216,207,188,0.15)' : '1px solid #e8e0d1',
                    opacity: 0.8,
                    color: msg.sender === 'user' ? '#D8CFBC' : '#a09d8f',
                  }}
                >
                  <span className="font-semibold">
                    {msg.sender === 'user' ? user?.username || 'Investigator' : 'Judicial AI'}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {msg.responseMeta?.provider_tier && (
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-semibold"
                        style={{ background: 'rgba(216,207,188,0.2)', color: '#565449', border: '1px solid rgba(216,207,188,0.5)' }}
                      >
                        {msg.responseMeta.provider_tier}
                      </span>
                    )}
                    {msg.caseScope && (
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={
                          msg.sender === 'user'
                            ? { background: 'rgba(216,207,188,0.12)', color: '#D8CFBC' }
                            : { background: '#f2ede4', color: '#565449', border: '1px solid #D8CFBC' }
                        }
                      >
                        {msg.caseScope}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Tamper quarantine warning */}
                {msg.responseMeta?.tamper_quarantined && (
                  <div
                    className="mb-2.5 p-2.5 rounded-xl text-xs flex items-center gap-2 font-mono"
                    style={{ background: 'rgba(216,207,188,0.3)', border: '1px solid #D8CFBC', color: '#565449' }}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#565449' }} />
                    <span>
                      Zero-Trust Gate intercepted & quarantined unverified chunks. Output synthesized from {msg.responseMeta.citations?.length || 0} verified blockchain chunks.
                    </span>
                  </div>
                )}

                {/* Content */}
                {msg.responseMeta?.tamper_detected ? (
                  <TamperAlert
                    message={msg.responseMeta?.message || msg.text || 'Evidence tampering detected! Output blocked by zero-trust gate.'}
                    txId={msg.responseMeta?.tamper_alert_tx}
                  />
                ) : (
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                )}

                {/* Citations */}
                {msg.responseMeta?.citations && msg.responseMeta.citations.length > 0 && (
                  <div className="pt-2.5 space-y-2" style={{ borderTop: '1px solid #e8e0d1' }}>
                    <div className="text-[11px] font-semibold flex items-center gap-1 font-mono" style={{ color: '#565449' }}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Evidentiary Citations:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.responseMeta.citations.map((c: Citation, i: number) => (
                        <CitationChip key={i} citation={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Access matrix */}
                {msg.responseMeta?.access_info && (
                  <div className="pt-2.5 space-y-2 text-xs" style={{ borderTop: '1px solid #e8e0d1' }}>
                    <div className="flex items-center justify-between text-[11px] font-mono" style={{ color: '#565449' }}>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <KeyRound className="w-3.5 h-3.5" />
                        Role Access & Security Clearance:
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-bold font-mono"
                        style={{ background: '#f2ede4', color: '#565449', border: '1px solid #D8CFBC' }}
                      >
                        Ceiling: {msg.responseMeta.access_info.content_access.highest_classification_retrieved}
                      </span>
                    </div>
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-3 rounded-xl font-mono"
                      style={{ background: '#FFFBF4', border: '1px solid #D8CFBC' }}
                    >
                      <div>
                        <div className="font-semibold mb-1 flex items-center gap-1" style={{ color: '#565449' }}>
                          <CheckCircle2 className="w-3 h-3" />
                          Access for {msg.responseMeta.access_info.current_user.role}:
                        </div>
                        <div className="text-[10px] space-y-0.5 pl-4" style={{ color: '#11120D' }}>
                          <div>Clearance: <span className="font-bold" style={{ color: '#565449' }}>{msg.responseMeta.access_info.current_user.clearance}</span></div>
                          <div>Allowed: {msg.responseMeta.access_info.current_user.permitted_classifications.join(', ')}</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold mb-1 flex items-center gap-1" style={{ color: '#565449' }}>
                          <Lock className="w-3 h-3" />
                          Permitted Roles:
                        </div>
                        <div className="flex flex-wrap gap-1 pl-4">
                          {msg.responseMeta.access_info.content_access.roles_with_access.map((r, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(86,84,73,0.1)', color: '#565449', border: '1px solid rgba(86,84,73,0.2)' }}>
                              ✓ {r}
                            </span>
                          ))}
                          {msg.responseMeta.access_info.content_access.roles_restricted.map((r, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(184,48,48,0.07)', color: '#7a1818', border: '1px solid rgba(184,48,48,0.15)' }}>
                              ✕ {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timing */}
                {msg.responseMeta?.timings_ms && (
                  <div
                    className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono"
                    style={{ borderTop: '1px solid #e8e0d1', color: '#a09d8f' }}
                  >
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Retrieval: {msg.responseMeta.timings_ms.retrieval_ms || 0}ms
                    </span>
                    <span>·</span>
                    <span>Gate: {msg.responseMeta.timings_ms.integrity_gate_ms || 0}ms</span>
                    <span>·</span>
                    <span>LLM: {msg.responseMeta.timings_ms.llm_ms || 0}ms</span>
                  </div>
                )}
              </div>

              {/* User avatar */}
              {msg.sender === 'user' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: '#565449' }}
                >
                  <UserIcon className="w-4 h-4" style={{ color: '#FFFBF4' }} />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-start">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#11120D', border: '1px solid rgba(216,207,188,0.15)' }}
            >
              <Gavel className="w-4 h-4" style={{ color: '#D8CFBC' }} />
            </div>
            <div
              className="rounded-2xl p-4 shadow-sm space-y-2 max-w-xs"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D8CFBC',
                borderRadius: '1rem 1rem 1rem 0.25rem',
              }}
            >
              <TypingIndicator />
              <div className="text-xs font-medium" style={{ color: '#565449' }}>
                {loadingStep || 'Processing query...'}
              </div>
              <div
                className="h-1 w-48 rounded-full overflow-hidden"
                style={{ background: '#f2ede4' }}
              >
                <div
                  className="h-full rounded-full animate-pulse"
                  style={{ width: '60%', background: '#565449' }}
                />
              </div>
              <div className="text-[10px] font-mono" style={{ color: '#a09d8f' }}>
                {elapsedSeconds}s elapsed
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ────────────────────────────────────────────── */}
      <div
        className="rounded-b-2xl p-3.5 sm:p-4"
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #D8CFBC',
          borderLeft: '1px solid #D8CFBC',
          borderRight: '1px solid #D8CFBC',
          borderBottom: '1px solid #D8CFBC',
          boxShadow: '0 4px 20px rgba(17,18,13,0.06)',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2.5"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Judicial AI about evidence... (Enter to send, Shift+Enter for newline)"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm resize-none disabled:opacity-50 transition-all"
              style={{
                background: '#FFFBF4',
                border: '1.5px solid #D8CFBC',
                color: '#11120D',
              }}
              onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#565449'; (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(86,84,73,0.1)'; }}
              onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#D8CFBC'; (e.target as HTMLTextAreaElement).style.boxShadow = 'none'; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="flex items-center justify-center p-3 rounded-xl transition-all shrink-0 disabled:opacity-40 cursor-pointer"
            style={{
              background: '#11120D',
              color: '#FFFBF4',
              height: 48,
              width: 48,
            }}
            onMouseEnter={e => {
              if (!loading && inputText.trim()) {
                (e.currentTarget as HTMLElement).style.background = '#1e1f18';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(17,18,13,0.25)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#11120D';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div
          className="flex items-center justify-between mt-2.5 px-1 text-[10px] font-mono"
          style={{ color: '#a09d8f' }}
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" style={{ color: '#565449' }} />
            Zero-Trust Retrieval · Merkle Proof Gate · Grounded Citations
          </span>
          <span className="hidden sm:inline">Press Enter ↵ to send</span>
        </div>
      </div>

      {/* ── Admin AI Keys Modal ──────────────────────────────────── */}
      {showConfigModal && isAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(17,18,13,0.5)' }}
        >
          <div
            className="rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 animate-scale-in"
            style={{ background: '#FFFFFF', border: '1px solid #D8CFBC', boxShadow: '0 20px 60px rgba(17,18,13,0.2)' }}
          >
            <div className="flex items-center justify-between pb-3.5" style={{ borderBottom: '1px solid #D8CFBC' }}>
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: '#11120D', border: '1px solid rgba(216,207,188,0.1)' }}
                >
                  <Sliders className="w-5 h-5" style={{ color: '#D8CFBC' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-serif-judicial font-bold" style={{ color: '#11120D' }}>
                      Cascading AI Gateway Configuration
                    </h2>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                      style={{ background: 'rgba(86,84,73,0.1)', color: '#565449', border: '1px solid rgba(86,84,73,0.2)' }}
                    >
                      ADMIN ONLY
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: '#a09d8f' }}>
                    Configure your 4-tier failover keys. See{' '}
                    <Link to="/admin" className="underline font-semibold" style={{ color: '#565449' }}>
                      Admin Panel
                    </Link>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#a09d8f' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f2ede4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKeys} className="space-y-3">
              {[
                { key: tier1Key, setter: setTier1Key, label: 'Tier 1: GPT-6 Astra (Primary)', model: 'openai/gpt-6-astra', dotColor: '#565449', placeholder: 'Paste GPT-6 Astra API Key...' },
                { key: tier2Key, setter: setTier2Key, label: 'Tier 2: Grok 4.6 (Failover 1)', model: 'x-ai/grok-4.6', dotColor: '#D8CFBC', placeholder: 'Paste Grok 4.6 API Key...' },
                { key: tier3Key, setter: setTier3Key, label: 'Tier 3: Nemotron 3 Ultra (Failover 2)', model: 'nvidia/nemotron-3-ultra', dotColor: '#a09d8f', placeholder: 'Paste Nemotron 3 Ultra API Key...' },
                { key: tier4Key, setter: setTier4Key, label: 'Tier 4: Gemini 3.8 Flash (Failover 3)', model: 'google/gemini-3.8-flash', dotColor: '#c4baa5', placeholder: 'Paste Gemini 3.8 Flash API Key...' },
              ].map((tier, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl space-y-2"
                  style={{ background: '#FFFBF4', border: '1px solid #D8CFBC' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#11120D' }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: tier.dotColor }} />
                      {tier.label}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: '#f2ede4', color: '#a09d8f' }}>
                      {tier.model}
                    </span>
                  </div>
                  <input
                    type="password"
                    value={tier.key}
                    onChange={(e) => tier.setter(e.target.value)}
                    placeholder={tier.placeholder}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg focus:outline-none"
                    style={{ background: '#FFFFFF', border: '1.5px solid #D8CFBC', color: '#11120D' }}
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px]" style={{ color: '#a09d8f' }}>
                  {saveSuccess ? (
                    <span className="font-semibold flex items-center gap-1" style={{ color: '#565449' }}>
                      <Check className="w-3.5 h-3.5" /> Keys updated in vault!
                    </span>
                  ) : (
                    <span>Keys are never sent to third parties.</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-colors"
                    style={{ borderColor: '#D8CFBC', color: '#565449', background: '#FFFFFF' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                    style={{ background: '#11120D', color: '#FFFBF4' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1e1f18'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#11120D'; }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Keys
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AskPage;
