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
      setError(err.response?.data?.detail || err.message || 'Failed to load security incident reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-ivory border-crimson-gold rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-judicial font-bold tracking-tight text-stone-900 flex items-center gap-2">
              Security Incident Logs
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              Zero-Trust TAMPER_ALERT telemetry and on-chain blockchain audit trail records.
            </p>
          </div>
        </div>

        <button
          onClick={loadIncidents}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-parchment-100 text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-crimson-800" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-6 h-6 text-crimson-700 animate-spin" />
          <span className="text-stone-500 text-xs font-mono">Fetching security incidents and integrity records...</span>
        </div>
      ) : incidents.length === 0 ? (
        <div className="glass-ivory border border-stone-200 rounded-2xl p-10 text-center space-y-2.5 shadow-sm">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-serif-judicial font-bold text-stone-900">Cryptographic Integrity Clean</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Zero tamper alerts recorded. All evidentiary hashes match on-chain Merkle roots.
          </p>
        </div>
      ) : (
        <div className="glass-ivory border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-parchment-200/80 border-b border-stone-200 text-stone-600 text-[11px] uppercase font-semibold">
              <tr>
                <th className="p-3.5">Incident ID</th>
                <th className="p-3.5">Failing Check</th>
                <th className="p-3.5">Target Document</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">EVM Proof TX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-parchment-100/60 transition-colors">
                  <td className="p-3.5 text-stone-900 font-bold">{inc.id.slice(0, 8)}...</td>
                  <td className="p-3.5 text-rose-700 font-bold">{inc.failing_check}</td>
                  <td className="p-3.5 text-stone-700">{inc.doc_id.slice(0, 12)}...</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                      {inc.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-crimson-800 font-semibold">{inc.ledger_tx_id || 'CONFIRMED'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AuditLogPage;
