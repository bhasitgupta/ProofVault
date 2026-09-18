import React from 'react';
import { ShieldCheck, ShieldX, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'VERIFIED' | 'FAILED' | 'PENDING';
  label?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, label }) => {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-semibold shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>{label || 'Cryptographically Verified'}</span>
      </span>
    );
  }

  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold shadow-sm">
        <ShieldX className="w-3.5 h-3.5 text-rose-600" />
        <span>{label || 'Verification Failed'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs shadow-sm">
      <Clock className="w-3.5 h-3.5 text-stone-400" />
      <span>{label || 'Pending Verification'}</span>
    </span>
  );
};
export default VerificationBadge;
