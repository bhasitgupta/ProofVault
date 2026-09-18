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
        text: res.answer || (res.tamper_detected ? 'Tampering detected! Answer withheld by zero-trust gate.' : 'No grounded evidence found in accessible records.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseMeta: res,
        caseScope: activeCase || 'All Cases'
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error processing query: ${err.message || 'Unable to connect to intelligence service.'}`,
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
      <div className="bg-slate-900 border border-slate-800 rounded-t-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-blue-950/80 border border-blue-500/40 rounded-xl text-police-accent shadow-inner">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">SDMS Evidence Intelligence Bot</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Merkle-Gated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded, tamper-verified Q&A powered by local Qwen LLM with on-chain cryptographic citations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Case Scope Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs">
            <Folder className="w-3.5 h-3.5 text-police-accent" />
            <span className="text-slate-400">Scope:</span>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="bg-transparent text-white font-mono font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">All Authorized Cases</option>
              {cases.map((id) => (
                <option key={id} value={id} className="bg-slate-900 text-white">{id}</option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Chat Messages Stream ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-950/70 border-x border-slate-800 p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Welcome & Suggested Prompts */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-8 space-y-6">
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
              <MessageSquare className="w-10 h-10 text-police-accent mx-auto mb-2" />
              <h2 className="text-sm font-semibold text-white">How can I assist your investigation?</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ask any question about registered electronic evidence, forensic reports, or FIRs. All answers are strictly synthesized from tamper-verified on-chain records.
              </p>
            </div>

            <div className="w-full space-y-2 text-left">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Sparkles className="w-3.5 h-3.5 text-police-gold" /> Suggested Investigative Prompts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedCase(prompt.caseId);
                      handleSendMessage(prompt.text, prompt.caseId);
                    }}
                    className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group flex flex-col justify-between"
                  >
                    <span className="text-xs text-slate-200 group-hover:text-police-accent leading-snug">
                      "{prompt.text}"
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 mt-2 flex items-center justify-between">
                      <span>{prompt.caseId}</span>
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
                <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/40 text-police-accent flex items-center justify-center shrink-0 shadow">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-3 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 text-[11px] opacity-75 pb-1 border-b border-white/10 font-mono">
                  <span>{msg.sender === 'user' ? 'Investigator' : 'SDMS Intelligence Bot'}</span>
                  <div className="flex items-center gap-2">
                    {msg.caseScope && (
                      <span className="px-1.5 py-0.2 bg-black/20 rounded text-[10px]">
                        {msg.caseScope}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Quarantined chunks warning */}
                {msg.responseMeta?.tamper_quarantined && (
                  <div className="mb-2.5 p-2 bg-amber-950/60 border border-amber-500/50 rounded-lg text-xs text-amber-300 flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
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
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <KeyRound className="w-3.5 h-3.5 text-police-accent" />
                        Role Access & Security Clearance Policy:
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                        Evidence Ceiling: {msg.responseMeta.access_info.content_access.highest_classification_retrieved}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                      {/* Current User Granted Access */}
                      <div>
                        <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Access for {msg.responseMeta.access_info.current_user.role}:
                        </div>
                        <div className="text-[10px] text-slate-300 space-y-0.5 pl-4">
                          <div>Clearance: <span className="text-police-accent font-bold">{msg.responseMeta.access_info.current_user.clearance}</span></div>
                          <div>Allowed Docs: {msg.responseMeta.access_info.current_user.permitted_classifications.join(', ')}</div>
                        </div>
                      </div>

                      {/* Content Accessibility by Role */}
                      <div>
                        <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-police-gold" />
                          Roles Permitted for this Content:
                        </div>
                        <div className="flex flex-wrap gap-1 pl-4">
                          {msg.responseMeta.access_info.content_access.roles_with_access.map((r, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/40">
                              ✓ {r}
                            </span>
                          ))}
                          {msg.responseMeta.access_info.content_access.roles_restricted.map((r, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/50 text-red-400 border border-red-800/40" title="Restricted: clearance below content ceiling">
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
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-slate-500 font-mono border-t border-slate-800/50">
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
                <div className="w-8 h-8 rounded-lg bg-police-accent text-white flex items-center justify-center shrink-0 shadow">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Live Loading Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/40 text-police-accent flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 shadow-md space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-police-accent animate-ping" />
                  <span>{loadingStep || 'Processing query...'}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {elapsedSeconds}s
                </span>
              </div>
              <div className="h-1 w-56 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-police-accent animate-indeterminate" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ─────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-b-xl p-3 sm:p-4 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI Bot about evidence... (Enter to send, Shift+Enter for new line)"
              disabled={loading}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-police-accent resize-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="flex items-center justify-center p-3 bg-police-accent hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 shrink-0 h-[48px] w-[48px]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-police-accent" />
            Zero-Trust Pre-Filtered Retrieval • Merkle Proof Gate • Grounded Citations
          </span>
          <span className="hidden sm:inline">Press Enter ↵ to send</span>
        </div>
      </div>
    </div>
  );
};
