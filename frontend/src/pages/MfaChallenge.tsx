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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-crimson-800 via-crimson-900 to-mahogany-900 mx-auto flex items-center justify-center shadow-lg shadow-crimson-950/20 text-white">
            <KeyRound className="w-8 h-8 text-amber-200 animate-seal-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold text-crimson-800 bg-crimson-50 border border-crimson-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
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
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping flex-shrink-0"></span>
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
              className="w-full text-center tracking-[0.45em] text-3xl font-mono py-4 bg-stone-50 border border-stone-200 rounded-2xl text-crimson-900 focus:outline-none focus:border-crimson-700 focus:ring-4 focus:ring-crimson-700/10 transition-all font-bold shadow-inner"
            />
          </div>

          {/* Rapid Demo Token Chips */}
          <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
            <span className="text-stone-400 text-[11px]">Bypass Keys:</span>
            <button
              type="button"
              onClick={() => setTotpCode('000000')}
              className="px-2.5 py-1 rounded-lg bg-crimson-50 hover:bg-crimson-100 text-crimson-800 border border-crimson-200 text-[11px] font-bold transition-all cursor-pointer"
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
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-[0.99] disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-red-950/20 hover:shadow-red-950/30 cursor-pointer group"
          >
            <span>{loading ? 'Validating Token Hash...' : 'Complete Phase 2 Verification'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
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
export default MfaChallenge;
