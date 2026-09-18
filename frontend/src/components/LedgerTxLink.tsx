import React from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { truncateHash } from '../lib/format';

interface LedgerTxLinkProps {
  txId?: string;
  channel?: 'dochash-channel' | 'access-channel';
}

export const LedgerTxLink: React.FC<LedgerTxLinkProps> = ({
  txId,
  channel = 'dochash-channel',
}) => {
  if (!txId) return <span className="text-stone-400 italic text-xs">Pending ledger commit</span>;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-parchment-100 border border-stone-200 rounded-lg font-mono text-xs text-crimson-800 hover:border-crimson-700/60 transition-colors shadow-sm">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span className="font-bold" title={txId}>{truncateHash(txId, 8, 6)}</span>
      <span className="text-[10px] text-stone-500 uppercase font-semibold">({channel})</span>
      <ExternalLink className="w-3 h-3 text-stone-400" />
    </div>
  );
};
export default LedgerTxLink;
