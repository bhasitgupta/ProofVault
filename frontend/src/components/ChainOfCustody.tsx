import React from 'react';
import { Shield, ArrowDown, User, Hash, Clock } from 'lucide-react';
import { AuditEvent } from '../lib/types';
import { LedgerTxLink } from './LedgerTxLink';

interface ChainOfCustodyProps {
  events: AuditEvent[];
}

export const ChainOfCustody: React.FC<ChainOfCustodyProps> = ({ events = [] }) => {
  if (events.length === 0) {
    return <div className="text-slate-400 text-xs italic py-4">No custody transactions recorded yet.</div>;
  }

  return (
    <div className="relative pl-6 border-l border-slate-700 space-y-6 my-4">
      {events.map((evt, idx) => (
        <div key={idx} className="relative group">
          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-police-accent flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-police-accent" />
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-lg p-3.5 space-y-2 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white uppercase tracking-wider bg-slate-700/50 px-2 py-0.5 rounded">
                {evt.action}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                evt.outcome === 'ALLOW' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
              }`}>
                {evt.outcome}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{evt.actorId} ({evt.actorRole})</span>
              </div>
              {evt.timestamp && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(evt.timestamp).toLocaleString()}</span>
                </div>
              )}
            </div>

            {evt.reason && (
              <p className="text-xs text-slate-400 italic bg-slate-900/50 p-2 rounded">
                {evt.reason}
              </p>
            )}

            <div className="pt-1">
              <LedgerTxLink txId={evt.eventId} channel="access-channel" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
