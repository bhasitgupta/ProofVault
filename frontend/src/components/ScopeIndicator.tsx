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
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs">
      <div className="flex items-center gap-1.5 text-slate-300">
        <Lock className="w-3.5 h-3.5 text-police-accent" />
        <span>Role: <strong className="text-white">{role}</strong></span>
      </div>
      <div className="h-3 w-px bg-slate-700" />
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className={`px-2 py-0.5 rounded border font-semibold ${badge.bg} ${badge.text}`}>
          {clearance} CEILING
        </span>
      </div>
      <div className="h-3 w-px bg-slate-700" />
      <div className="text-slate-400">
        Scope: <span className="text-slate-200">{caseIds.length ? caseIds.join(', ') : 'No assigned cases'}</span>
      </div>
    </div>
  );
};
