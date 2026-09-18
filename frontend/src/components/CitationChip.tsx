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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
        isVerified
          ? 'bg-white hover:bg-parchment-100 border-stone-200 text-stone-800 shadow-sm hover:border-crimson-700/40'
          : 'bg-rose-50 border-rose-300 text-rose-800'
      }`}
    >
      <FileText className="w-3.5 h-3.5 text-crimson-800" />
      <span className="font-semibold">
        [{truncateHash(citation.doc_id, 4, 4)}:c{citation.chunk_index}]
      </span>
      {citation.page_number && (
        <span className="text-[10px] text-stone-500">p.{citation.page_number}</span>
      )}
      {isVerified ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      ) : (
        <AlertOctagon className="w-3 h-3 text-rose-600" />
      )}
    </button>
  );
};
export default CitationChip;
