import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { formatClassificationBadge } from '../lib/format';

interface ScopeIndicatorProps {
  role?: string;
  caseIds?: string[];
  clearance?: string;
}

export const ScopeIndicator: React.FC<ScopeIndicatorProps> = ({
  role = 'INVESTIGATOR',
  caseIds = [],
  clearance = 'CONFIDENTIAL',
}) => {
  const badge = formatClassificationBadge(clearance);

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-white/90 border border-stone-200 rounded-xl text-xs shadow-sm">
      <div className="flex items-center gap-1.5 text-stone-700">
        <Lock className="w-3.5 h-3.5 text-crimson-800" />
        <span>Role: <strong className="text-stone-900">{role}</strong></span>
      </div>
      <div className="h-3 w-px bg-stone-300" />
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span className={`px-2 py-0.5 rounded-lg border font-semibold ${badge.bg} ${badge.text}`}>
          {clearance} CEILING
        </span>
      </div>
      <div className="h-3 w-px bg-stone-300" />
      <div className="text-stone-500 font-mono text-[11px]">
        Scope: <span className="text-stone-800 font-semibold">{caseIds.length ? caseIds.join(', ') : 'No assigned cases'}</span>
      </div>
    </div>
  );
};
export default ScopeIndicator;
