import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface TamperAlertProps {
  message?: string;
  txId?: string;
}

export const TamperAlert: React.FC<TamperAlertProps> = ({
  message = 'INTEGRITY GATE BREACH: Cryptographic tampering detected on retrieved chunks.',
  txId,
}) => {
  return (
    <div className="p-4 bg-red-950/70 border-2 border-red-500 rounded-xl shadow-lg shadow-red-950/50 my-4 animate-pulse">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold tracking-wide uppercase text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Zero-Trust Gate Triggered — Output Withheld
          </h4>
          <p className="text-xs text-red-300/90 leading-relaxed font-mono">
            {message}
          </p>
          {txId && (
            <div className="pt-2 text-[11px] text-red-400/80 font-mono">
              TAMPER_ALERT On-Chain Event TX: <span className="font-bold underline">{txId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
