import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';
import { verifyMfa } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export const MfaChallenge: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveToken } = useAuth();

  const state = location.state as { partial_token: string; totp_uri?: string; username: string } | undefined;
  const [totpCode, setTotpCode] = useState('000000');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!state?.partial_token) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await verifyMfa(state.partial_token, totpCode);
      saveToken(res.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid TOTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 mb-2">
            <KeyRound className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">MFA Authentication (Phase 2)</h2>
          <p className="text-xs text-slate-400">
            Enter the 6-digit TOTP code from your Google Authenticator or hardware token.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
              6-Digit Authenticator Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-slate-950 border border-slate-700/80 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || totpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-600/20 mt-2"
          >
            <span>{loading ? 'Verifying...' : 'Verify Token & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-slate-500 hover:text-slate-400"
          >
            Cancel & Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};
