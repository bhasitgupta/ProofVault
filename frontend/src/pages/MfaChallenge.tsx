import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowRight, Sparkles, Terminal } from 'lucide-react';
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
      setError(err.message || 'Cryptographic verification failed for provided TOTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      <div className="max-w-md w-full glass-obsidian border-iridescent rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/90 space-y-6 relative overflow-hidden">
        
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <KeyRound className="w-8 h-8 text-emerald-400 animate-cyber-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Zero-Trust Phase 2 MFA
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white mt-2">
              Time-Based Key Challenge
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Supply the rotating 6-digit TOTP key bound to <strong className="text-white">{state.username}</strong>.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping flex-shrink-0"></span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-center">
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              6-Digit Authenticator Token
            </label>
            <input
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              className="w-full text-center tracking-[0.45em] text-3xl font-mono py-4 bg-black/60 border border-emerald-500/40 rounded-2xl text-emerald-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-inner font-bold"
            />
          </div>

          {/* Rapid Demo Token Chips */}
          <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
            <span className="text-slate-500 text-[11px]">Bypass Keys:</span>
            <button
              type="button"
              onClick={() => setTotpCode('000000')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
            >
              000000 (Universal)
            </button>
            <button
              type="button"
              onClick={() => setTotpCode('123456')}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-all cursor-pointer"
            >
              123456
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || totpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/40 cursor-pointer"
          >
            <span>{loading ? 'Validating Token Hash...' : 'Complete Phase 2 Verification'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors"
          >
            Cancel & Abort Session
          </button>
        </div>

      </div>
    </div>
  );
};
