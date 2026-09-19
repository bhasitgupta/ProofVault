import React from 'react';
import { Shield, ArrowDown, User, Hash, Clock } from 'lucide-react';
import { AuditEvent } from '../lib/types';
import { LedgerTxLink } from './LedgerTxLink';

interface ChainOfCustodyProps {
  events: AuditEvent[];
}

export const ChainOfCustody: React.FC<ChainOfCustodyProps> = ({ events = [] }) => {
  if (events.length === 0) {
    return <div className="text-stone-500 text-xs italic py-4">No custody transactions recorded yet.</div>;
  }

  return (
    <div className="relative pl-6 border-l-2 border-stone-300 space-y-6 my-4">
      {events.map((evt, idx) => (
        <div key={idx} className="relative group">
          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-crimson-800 flex items-center justify-center shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-crimson-800" />
          </div>

          <div className="glass-ivory border border-stone-200 rounded-2xl p-4 space-y-2.5 hover:border-crimson-700/40 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-crimson-900 uppercase tracking-wider bg-crimson-50 border border-crimson-200 px-2.5 py-0.5 rounded-lg">
                {evt.action}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                evt.outcome === 'ALLOW' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {evt.outcome}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-700 font-medium">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span>{evt.actorId} ({evt.actorRole})</span>
              </div>
              {evt.timestamp && (
                <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(evt.timestamp).toLocaleString()}</span>
                </div>
              )}
            </div>

            {evt.reason && (
              <p className="text-xs text-stone-600 italic bg-parchment-50 p-2.5 rounded-xl border border-stone-200">
                {evt.reason}
              </p>
            )}

            <div className="pt-1.5 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-mono">Tx ID:</span>
              <LedgerTxLink txId={evt.eventId} contract="ProvenanceRegistry" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ChainOfCustody;
