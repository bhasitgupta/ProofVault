import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowRight, Sparkles, Terminal, Scale } from 'lucide-react';
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
      <div className="max-w-md w-full glass-ivory border-crimson-gold rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden bg-white/95">
        
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-800 to-amber-900 mx-auto flex items-center justify-center shadow-lg shadow-red-950/20 text-white">
            <KeyRound className="w-8 h-8 text-amber-200 animate-seal-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold text-red-800 bg-red-50 border border-red-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Zero-Trust Phase 2 MFA
            </span>
            <h2 className="font-serif-judicial text-2xl font-black tracking-tight text-stone-900 mt-2">
              Time-Based Key Challenge
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Supply the rotating 6-digit TOTP key bound to <strong className="text-stone-900">{state.username}</strong>.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping flex-shrink-0"></span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-center">
            <label className="block text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">
              6-Digit Authenticator Token
            </label>
            <input
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              className="w-full text-center tracking-[0.45em] text-3xl font-mono py-4 bg-stone-50 border border-stone-200 rounded-2xl text-red-900 focus:outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/10 transition-all font-bold shadow-inner"
            />
          </div>

          {/* Rapid Demo Token Chips */}
          <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
            <span className="text-stone-400 text-[11px]">Bypass Keys:</span>
            <button
              type="button"
              onClick={() => setTotpCode('000000')}
              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold transition-all cursor-pointer"
            >
              000000 (Universal)
            </button>
            <button
              type="button"
              onClick={() => setTotpCode('123456')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition-all cursor-pointer"
            >
              123456
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || totpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-red-800 via-red-700 to-amber-900 hover:from-red-900 hover:via-red-800 hover:to-amber-950 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/30 cursor-pointer"
          >
            <span>{loading ? 'Validating Token Hash...' : 'Complete Phase 2 Verification'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-stone-500 hover:text-stone-700 font-mono transition-colors"
          >
            Cancel & Abort Session
          </button>
        </div>

      </div>
    </div>
  );
};
