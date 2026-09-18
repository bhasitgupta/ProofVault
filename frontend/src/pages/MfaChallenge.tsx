import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh-dark">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 shadow-2xl shadow-black/80 space-y-6 border border-slate-700/60 relative overflow-hidden">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 mb-1 shadow-lg shadow-emerald-500/20">
            <KeyRound className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">MFA Authentication (Phase 2)</h2>
          <p className="text-xs text-slate-400">
            Enter the 6-digit TOTP code from your registered device.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Identity: {state.username}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center flex items-center justify-center gap-1">
              <span>6-Digit Authenticator Code</span>
            </label>
            <input
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              className="w-full text-center tracking-[0.4em] text-3xl font-mono py-3.5 bg-slate-950/90 border border-emerald-500/40 rounded-xl text-emerald-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
            />
          </div>

          {/* Quick Demo Bypass Tokens */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500">Quick Tokens:</span>
            <button
              type="button"
              onClick={() => setTotpCode('000000')}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] font-mono text-emerald-400 border border-slate-700"
            >
              000000
            </button>
            <button
              type="button"
              onClick={() => setTotpCode('123456')}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] font-mono text-cyan-400 border border-slate-700"
            >
              123456
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || totpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 mt-2 cursor-pointer"
          >
            <span>{loading ? 'Verifying...' : 'Verify Token & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-slate-500 hover:text-slate-400 font-mono transition-colors"
          >
            Cancel & Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};
