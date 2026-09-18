import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { getIncidents } from '../api/audit';

export const AuditLogPage: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await getIncidents();
      setIncidents(res.incidents || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load security incident reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            Security Incident Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            TAMPER_ALERT events committed to Hyperledger Fabric and recorded in the audit trail.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-police-accent" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm italic py-8">Fetching security incidents...</div>
      ) : incidents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">System Integrity Clean</h3>
          <p className="text-xs text-slate-400">Zero tamper alerts recorded on-chain.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="p-3.5">Incident ID</th>
                <th className="p-3.5">Failing Check</th>
                <th className="p-3.5">Target Document</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Ledger TX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 text-white font-bold">{inc.id.slice(0, 8)}...</td>
                  <td className="p-3.5 text-red-400 font-bold">{inc.failing_check}</td>
                  <td className="p-3.5 text-slate-300">{inc.doc_id.slice(0, 12)}...</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 text-[10px] font-bold">
                      {inc.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-police-accent">{inc.ledger_tx_id || 'PENDING'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
