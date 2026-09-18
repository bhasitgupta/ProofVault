import React from 'react';
import { Bot, Sparkles, Timer, Cpu } from 'lucide-react';
import { QueryResponse } from '../lib/types';
import { CitationChip } from './CitationChip';
import { TamperAlert } from './TamperAlert';

interface AnswerCardProps {
  response: QueryResponse;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ response }) => {
  if (response.tamper_detected) {
    return <TamperAlert message={response.message || 'Evidence tampering detected! Output blocked by zero-trust gate.'} />;
  }

  const timings = response.timings_ms || {};

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2 text-police-accent font-semibold text-sm">
          <Bot className="w-4 h-4" />
          <span>Verified Intelligence Assistant</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            <Sparkles className="w-3 h-3" />
            Integrity-Gated
          </span>
        </div>

        {timings.total_ms && (
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Timer className="w-3.5 h-3.5" />
            <span>{timings.total_ms} ms</span>
          </div>
        )}
      </div>

      <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
        {response.answer || 'No response generated.'}
      </div>

      {response.citations && response.citations.length > 0 && (
        <div className="pt-2 border-t border-slate-700/60">
          <div className="text-xs font-semibold text-slate-400 mb-2">Verified Ledger Citations:</div>
          <div className="flex flex-wrap gap-2">
            {response.citations.map((c, i) => (
              <CitationChip key={i} citation={c} />
            ))}
          </div>
        </div>
      )}

      {timings && Object.keys(timings).length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2 text-[10px] text-slate-500 border-t border-slate-700/40 font-mono">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Retrieval: {timings.retrieval_ms || 0}ms
          </span>
          <span>•</span>
          <span>Integrity Gate: {timings.integrity_gate_ms || 0}ms</span>
          <span>•</span>
          <span>LLM Generation: {timings.llm_ms || 0}ms</span>
        </div>
      )}
    </div>
  );
};
