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
  if (!txId || txId === 'OFF_CHAIN') return <span className="text-stone-400 italic text-xs">Local Cryptographic Proof</span>;

  const normalizedTx = txId.startsWith('0x') ? txId : `0x${txId}`;
  const explorerUrl = `https://amoy.polygonscan.com/tx/${normalizedTx}`;

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg font-mono text-xs text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors shadow-xs"
      title={`EVM Transaction: ${normalizedTx}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      <span className="font-bold">{truncateHash(normalizedTx, 8, 6)}</span>
      <span className="text-[10px] text-stone-500 font-semibold">({contract})</span>
      <ExternalLink className="w-3 h-3 text-stone-400" />
    </a>
  );
};

// Backward-compatibility export
export const LedgerTxLink = PolygonTxLink;
export default PolygonTxLink;
