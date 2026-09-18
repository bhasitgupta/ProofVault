import React from 'react';
import { FileText, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Citation } from '../lib/types';
import { truncateHash } from '../lib/format';

interface CitationChipProps {
  citation: Citation;
  onClick?: () => void;
}

export const CitationChip: React.FC<CitationChipProps> = ({ citation, onClick }) => {
  const isVerified = citation.verification_status === 'VERIFIED';

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
        isVerified
          ? 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-600 text-slate-200'
          : 'bg-red-950/80 border-red-500 text-red-300'
      }`}
    >
      <FileText className="w-3.5 h-3.5 text-police-accent" />
      <span className="font-semibold">
        [{truncateHash(citation.doc_id, 4, 4)}:c{citation.chunk_index}]
      </span>
      {citation.page_number && (
        <span className="text-[10px] text-slate-400">p.{citation.page_number}</span>
      )}
      {isVerified ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      ) : (
        <AlertOctagon className="w-3 h-3 text-red-400" />
      )}
    </button>
  );
};
