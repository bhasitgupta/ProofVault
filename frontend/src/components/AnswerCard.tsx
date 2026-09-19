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
    <div className="glass-ivory border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 text-crimson-800 font-serif-judicial font-bold text-sm">
          <Bot className="w-4 h-4" />
          <span>Verified Intelligence Assistant</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-sans font-semibold">
            <Sparkles className="w-3 h-3" />
            Integrity-Gated
          </span>
        </div>

        {timings.total_ms && (
          <div className="flex items-center gap-1 text-stone-500 text-xs font-mono">
            <Timer className="w-3.5 h-3.5" />
            <span>{timings.total_ms} ms</span>
          </div>
        )}
      </div>

      <div className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {response.answer || 'No response generated.'}
      </div>

      {response.citations && response.citations.length > 0 && (
        <div className="pt-2 border-t border-stone-200">
          <div className="text-xs font-semibold text-stone-600 mb-2 font-mono">Verified Evidentiary Citations:</div>
          <div className="flex flex-wrap gap-2">
            {response.citations.map((c, i) => (
              <CitationChip key={i} citation={c} />
            ))}
          </div>
        </div>
      )}

      {timings && Object.keys(timings).length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2 text-[10px] text-stone-400 border-t border-stone-200 font-mono">
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
export default AnswerCard;
