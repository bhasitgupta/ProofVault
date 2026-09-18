import { useState } from 'react';
import { askEvidence } from '../api/query';
import { QueryResponse } from '../lib/types';

export function useQueryStream() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = async (prompt: string, caseIds: string[] = []) => {
    setLoading(true);
    setError(null);
    try {
      const res = await askEvidence(prompt, caseIds);
      setResponse(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Evidence query failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { query, loading, response, error };
}
