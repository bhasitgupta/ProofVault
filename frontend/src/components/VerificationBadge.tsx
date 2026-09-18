import React from 'react';
import { ShieldCheck, ShieldX, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'VERIFIED' | 'FAILED' | 'PENDING';
  label?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, label }) => {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
        <ShieldCheck className="w-3.5 h-3.5" />
        {label || 'Cryptographically Verified'}
      </span>
    );
  }

  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-semibold">
        <ShieldX className="w-3.5 h-3.5" />
        {label || 'Verification Failed'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs">
      <Clock className="w-3.5 h-3.5" />
      {label || 'Pending Verification'}
    </span>
  );
};
