import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { History, Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { getCaseTimeline } from '../api/audit';
import { AuditEvent } from '../lib/types';
import { ChainOfCustody } from '../components/ChainOfCustody';

export const CustodyTimelinePage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (caseId) {
      loadTimeline(caseId);
    }
  }, [caseId]);

  const loadTimeline = async (id: string) => {
    try {
      const res = await getCaseTimeline(id);
      setEvents(res.events || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load case custody timeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Case Dossiers</span>
      </button>

      <div className="glass-ivory border-crimson-gold rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 shadow-sm">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-judicial font-bold tracking-tight text-stone-900 flex items-center gap-2">
              Immutable Chain of Custody
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Cryptographically recorded ledger transactions on <strong className="text-stone-800">access-channel</strong> for Case <span className="font-mono text-crimson-800 font-bold">{caseId}</span>.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-6 h-6 text-crimson-700 animate-spin" />
          <span className="text-stone-500 text-xs font-mono">Fetching verifiable ledger transactions...</span>
        </div>
      ) : (
        <ChainOfCustody events={events} />
      )}
    </div>
  );
};
export default CustodyTimelinePage;
