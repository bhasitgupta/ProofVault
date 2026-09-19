import React from 'react';
import { ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';
import { truncateHash } from '../lib/format';

interface TxLinkProps {
  txId?: string;
  contract?: 'EvidenceRegistry' | 'ProvenanceRegistry' | string;
}

export const PolygonTxLink: React.FC<TxLinkProps> = ({
  txId,
  contract = 'EvidenceRegistry',
}) => {
  if (!txId) return <span className="text-slate-400 italic text-xs">Pending EVM Anchor</span>;

  const isPolygonTx = txId.startsWith('0x');
  const explorerUrl = isPolygonTx ? `https://amoy.polygonscan.com/tx/${txId}` : '#';

  return (
    <a
      href={explorerUrl}
      target={isPolygonTx ? '_blank' : undefined}
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors shadow-xs"
      title={`EVM Transaction: ${txId}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      <span className="font-bold">{truncateHash(txId, 8, 6)}</span>
      <span className="text-[10px] text-slate-500 font-semibold">({contract})</span>
      <ExternalLink className="w-3 h-3 text-slate-400" />
    </a>
  );
};

// Backward-compatibility export
export const LedgerTxLink = PolygonTxLink;
export default PolygonTxLink;
