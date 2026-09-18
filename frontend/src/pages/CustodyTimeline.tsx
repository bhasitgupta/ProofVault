import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { History, Shield, ArrowLeft } from 'lucide-react';
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
      setError(err.message || 'Failed to load case custody timeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <History className="w-6 h-6 text-amber-400" />
          Immutable Chain of Custody
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically recorded ledger transactions on <strong className="text-slate-300">access-channel</strong> for Case <span className="font-mono text-police-accent">{caseId}</span>.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm italic py-8">Fetching ledger transactions...</div>
      ) : (
        <ChainOfCustody events={events} />
      )}
    </div>
  );
};
