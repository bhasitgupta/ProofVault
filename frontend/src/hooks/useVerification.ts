import { useState } from 'react';
import { verifyDocument } from '../api/documents';

export function useVerification() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const verify = async (docId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await verifyDocument(docId);
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Verification request failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { verify, loading, result, error };
}
