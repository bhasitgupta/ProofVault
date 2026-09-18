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
    <div className="p-4 sm:p-5 bg-rose-50 border-2 border-crimson-700 rounded-2xl shadow-md shadow-rose-900/10 my-4 animate-pulse">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-crimson-800 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h4 className="text-sm font-serif-judicial font-bold tracking-wide uppercase text-crimson-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-crimson-700" />
            Zero-Trust Gate Triggered — Output Withheld
          </h4>
          <p className="text-xs text-rose-800 leading-relaxed font-mono">
            {message}
          </p>
          {txId && (
            <div className="pt-2 text-[11px] text-crimson-900 font-mono">
              TAMPER_ALERT On-Chain Event TX: <span className="font-bold underline">{txId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TamperAlert;
