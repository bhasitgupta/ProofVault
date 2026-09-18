import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Bot, 
  User as UserIcon, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Folder, 
  MessageSquare,
  ChevronRight,
  Cpu,
  Layers,
  Lock,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { askEvidence } from '../api/query';
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
  { text: "Who all has access to this content and which roles can view it?", caseId: "CASE-101" },
  { text: "What are the access and clearances granted to my current role?", caseId: "" },
  { text: "What hardware server was seized in Case 101?", caseId: "CASE-101" },
  { text: "What were the forensic ballistics findings in Case 103?", caseId: "CASE-103" },
  { text: "Summarize the witness statement from Case 101.", caseId: "CASE-101" },
  { text: "What was the chemical purity of seized narcotics in Case 105?", caseId: "CASE-105" },
];

export const AskPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedCase, setSelectedCase] = useState(searchParams.get('case') || '');
  const [cases, setCases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      caseScope: activeCase || 'All Cases'
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
        setLoadingStep('Verifying Merkle proofs against on-chain ledger...');
      }, 700);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('Synthesizing grounded answer with local Qwen LLM on CPU...');
      }, 1600);

      const res = await askEvidence(text, activeCase ? [activeCase] : []);
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.answer || res.message || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseMeta: res,
        caseScope: activeCase || 'All Cases'
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

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* ── Chatbot Header ─────────────────────────────────────────── */}
      <div className="glass-ivory border-crimson-gold rounded-t-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-crimson-50 border border-crimson-200 rounded-xl text-crimson-800 shadow-sm">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-serif-judicial font-bold text-stone-900 tracking-tight">Nyaya-Vault Intelligence Bot</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-700 font-mono font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Merkle-Gated
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Grounded, tamper-verified Q&A powered by local Qwen LLM with on-chain cryptographic citations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Case Scope Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs shadow-sm">
            <Folder className="w-3.5 h-3.5 text-crimson-700" />
            <span className="text-stone-500 font-medium">Scope:</span>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="bg-transparent text-stone-800 font-mono font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-white text-stone-900">All Authorized Cases</option>
              {cases.map((id) => (
                <option key={id} value={id} className="bg-white text-stone-900">{id}</option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-2 bg-white hover:bg-parchment-100 text-stone-500 hover:text-stone-800 rounded-xl transition-colors border border-stone-200 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Chat Messages Stream ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-parchment-50/70 border-x border-stone-200 p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Welcome & Suggested Prompts */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-8 space-y-6">
            <div className="glass-ivory rounded-2xl p-6 shadow-sm border border-stone-200 space-y-2">
              <MessageSquare className="w-10 h-10 text-crimson-800 mx-auto mb-2" />
              <h2 className="text-sm font-serif-judicial font-bold text-stone-900">How can I assist your evidentiary investigation?</h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ask any question regarding registered electronic evidence, forensic reports, or FIRs. All answers are strictly synthesized from tamper-verified on-chain records.
              </p>
            </div>

            <div className="w-full space-y-2.5 text-left">
              <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5 px-1 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Suggested Investigative Queries
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedCase(prompt.caseId);
                      handleSendMessage(prompt.text, prompt.caseId);
                    }}
                    className="p-3.5 bg-white hover:bg-parchment-100/90 border border-stone-200 hover:border-crimson-700/40 rounded-xl text-left transition-all group flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <span className="text-xs text-stone-800 group-hover:text-crimson-800 font-medium leading-snug">
                      "{prompt.text}"
                    </span>
                    <span className="text-[10px] font-mono text-stone-400 group-hover:text-stone-600 mt-2.5 flex items-center justify-between">
                      <span>{prompt.caseId || 'Global'}</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-crimson-50 border border-crimson-200 text-crimson-800 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-crimson-800 text-white rounded-tr-none'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 text-[11px] opacity-80 pb-1.5 border-b border-stone-200 font-mono">
                  <span className="font-semibold">{msg.sender === 'user' ? 'Investigator' : 'Nyaya-Vault Intelligence'}</span>
                  <div className="flex items-center gap-2">
                    {msg.caseScope && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${msg.sender === 'user' ? 'bg-crimson-900/60 text-white' : 'bg-parchment-100 text-stone-700 border border-stone-200'}`}>
                        {msg.caseScope}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Quarantined chunks warning */}
                {msg.responseMeta?.tamper_quarantined && (
                  <div className="mb-2.5 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Zero-Trust Gate intercepted & quarantined unverified chunks. Output was synthesized strictly from {msg.responseMeta.citations?.length || 0} verified ledger chunks.
                    </span>
                  </div>
                )}

                {/* Content */}
                {msg.responseMeta?.tamper_detected ? (
                  <TamperAlert 
                    message={msg.responseMeta?.message || msg.text || "Evidence tampering detected! Output blocked by zero-trust gate."} 
                    txId={msg.responseMeta?.tamper_alert_tx}
                  />
                ) : (
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                )}

                {/* Citations & Verified Proofs */}
                {msg.responseMeta?.citations && msg.responseMeta.citations.length > 0 && (
                  <div className="pt-2.5 border-t border-stone-200 space-y-2">
                    <div className="text-[11px] font-semibold text-stone-600 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Ledger Citations:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.responseMeta.citations.map((c: Citation, i: number) => (
                        <CitationChip key={i} citation={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Access & Permission Matrix Breakdown */}
                {msg.responseMeta?.access_info && (
                  <div className="pt-2.5 border-t border-stone-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-600">
                      <span className="flex items-center gap-1.5 font-semibold text-stone-700">
                        <KeyRound className="w-3.5 h-3.5 text-crimson-800" />
                        Role Access & Security Clearance Policy:
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-parchment-100 text-stone-700 border border-stone-200 font-bold">
                        Ceiling: {msg.responseMeta.access_info.content_access.highest_classification_retrieved}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-parchment-50 p-3 rounded-xl border border-stone-200 font-mono">
                      {/* Current User Granted Access */}
                      <div>
                        <div className="text-stone-600 font-semibold mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Access for {msg.responseMeta.access_info.current_user.role}:
                        </div>
                        <div className="text-[10px] text-stone-700 space-y-0.5 pl-4">
                          <div>Clearance: <span className="text-crimson-800 font-bold">{msg.responseMeta.access_info.current_user.clearance}</span></div>
                          <div>Allowed: {msg.responseMeta.access_info.current_user.permitted_classifications.join(', ')}</div>
                        </div>
                      </div>

                      {/* Content Accessibility by Role */}
                      <div>
                        <div className="text-stone-600 font-semibold mb-1 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-700" />
                          Permitted Roles:
                        </div>
                        <div className="flex flex-wrap gap-1 pl-4">
                          {msg.responseMeta.access_info.content_access.roles_with_access.map((r, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ {r}
                            </span>
                          ))}
                          {msg.responseMeta.access_info.content_access.roles_restricted.map((r, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200" title="Restricted">
                              ✕ {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timing / Execution Metrics */}
                {msg.responseMeta?.timings_ms && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-stone-400 font-mono border-t border-stone-200">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Retrieval: {msg.responseMeta.timings_ms.retrieval_ms || 0}ms
                    </span>
                    <span>•</span>
                    <span>Gate: {msg.responseMeta.timings_ms.integrity_gate_ms || 0}ms</span>
                    <span>•</span>
                    <span>LLM: {msg.responseMeta.timings_ms.llm_ms || 0}ms</span>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-crimson-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Live Loading Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-start">
            <div className="w-8 h-8 rounded-xl bg-crimson-50 border border-crimson-200 text-crimson-800 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs font-medium text-stone-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-crimson-700 animate-ping" />
                  <span>{loadingStep || 'Processing query...'}</span>
                </div>
                <span className="font-mono text-[11px] text-stone-500 bg-parchment-100 px-2 py-0.5 rounded border border-stone-200">
                  {elapsedSeconds}s
                </span>
              </div>
              <div className="h-1 w-56 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-crimson-700 animate-indeterminate" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ─────────────────────────────────────────────── */}
      <div className="glass-ivory border-t border-stone-200 rounded-b-2xl p-3.5 sm:p-4 shadow-sm">
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
              placeholder="Ask the Nyaya-Vault Bot about evidence... (Enter to send, Shift+Enter for newline)"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-crimson-700 resize-none disabled:opacity-50 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="flex items-center justify-center p-3 bg-crimson-800 hover:bg-crimson-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-crimson-900/15 shrink-0 h-[48px] w-[48px]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] text-stone-500 font-mono">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-crimson-800" />
            Zero-Trust Pre-Filtered Retrieval • Merkle Proof Gate • Grounded Citations
          </span>
          <span className="hidden sm:inline">Press Enter ↵ to send</span>
        </div>
      </div>
    </div>
  );
};
export default AskPage;
