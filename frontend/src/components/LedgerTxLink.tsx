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
  if (!txId) return <span className="text-slate-500 italic text-xs">Pending ledger commit</span>;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-police-accent hover:border-police-accent/60 transition-colors">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span title={txId}>{truncateHash(txId, 8, 6)}</span>
      <span className="text-[10px] text-slate-500 uppercase">({channel})</span>
      <ExternalLink className="w-3 h-3 text-slate-500" />
    </div>
  );
};
