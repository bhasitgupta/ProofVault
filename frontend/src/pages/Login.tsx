import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, KeyRound, Sparkles, CheckCircle, Scale, Database, ShieldCheck, Landmark } from 'lucide-react';
import { login } from '../api/auth';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('investigator_gupta');
  const [password, setPassword] = useState('SecurePass@2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const demoRoles = [
    { name: 'Inspector Bhasit Gupta', username: 'investigator_gupta', role: 'Chief Investigator', badge: 'badge-confidential', msp: 'PoliceMSP' },
    { name: 'Dr. Ananya Iyer', username: 'forensic_ananya', role: 'Forensic Director', badge: 'badge-secret', msp: 'ForensicsMSP' },
    { name: 'SP Vikram Kapoor', username: 'supervisor_kapoor', role: 'Supervisory Command', badge: 'badge-secret', msp: 'PoliceMSP' },
    { name: 'Root System Admin', username: 'admin_sys', role: 'Security Controller', badge: 'badge-secret', msp: 'PoliceMSP' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.mfa_required) {
        navigate('/mfa', {
          state: {
            partial_token: res.partial_token,
            totp_uri: res.totp_uri,
            username,
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication rejected by security gate.');
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (u: string) => {
    setUsername(u);
    setPassword('SecurePass@2026');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Telemetry Column (Sovereign Judicial Dossier) */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-8 rounded-3xl glass-ivory border border-amber-900/15 shadow-xl relative overflow-hidden h-[540px]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-mono border border-red-200">
              <Landmark className="w-3.5 h-3.5 text-amber-700" />
              <span>MINISTRY OF HOME AFFAIRS</span>
            </div>

            <h1 className="font-serif-judicial text-3xl font-black text-stone-900 tracking-tight leading-snug">
              Sovereign Evidence Provenance Vault
            </h1>

            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Cryptographically anchored document management platform engineered for Indian law enforcement, forensic laboratories, and judiciary workflows.
            </p>
          </div>

          {/* Legal Telemetry Badges */}
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 space-y-1">
              <div className="text-[10px] text-amber-900 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-red-700" /> ENVELOPE CIPHER</span>
                <span className="text-red-800 font-black">AES-256-GCM</span>
              </div>
              <div className="text-[11px] text-stone-600 font-sans">Per-document DEK with doc_id AAD</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 space-y-1">
              <div className="text-[10px] text-amber-900 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-amber-700" /> TRUST NETWORK</span>
                <span className="text-red-800 font-black">POLYGON AMOY</span>
              </div>
              <div className="text-[11px] text-stone-600 font-sans">Immutable cryptographic anchor root</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 space-y-1">
              <div className="text-[10px] text-amber-900 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-red-700" /> COURT ADMISSIBILITY</span>
                <span className="text-red-800 font-black">BSA §63 / IEA §65B</span>
              </div>
              <div className="text-[11px] text-stone-600 font-sans">Signed electronic certificate generation</div>
            </div>
          </div>

          <div className="text-[10px] text-stone-500 font-mono flex items-center justify-between border-t border-stone-200 pt-3">
            <span>TERMINAL ID: NYAYA-01</span>
            <span className="text-emerald-700 font-bold">● ACTIVE AUDIT CORE</span>
          </div>
        </div>

        {/* Right Authentication Column */}
        <div className="lg:col-span-7 glass-ivory border-crimson-gold rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden bg-white/95">
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-red-800 font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-red-700" /> Institutional Verification
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                ZERO-TRUST MFA
              </span>
            </div>
            <h2 className="font-serif-judicial text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              Access NYAYA-VAULT
            </h2>
            <p className="text-xs text-stone-500">
              Provide institutional credentials to challenge security clearance.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping flex-shrink-0"></span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between font-mono">
                <span>OFFICIAL IDENTIFIER</span>
                <span className="text-[10px] text-red-800">MSP BOUND</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. investigator_gupta"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between font-mono">
                <span>PASSPHRASE</span>
                <span className="text-[10px] text-red-800">PBKDF2 CHALLENGE</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-red-800 via-red-700 to-amber-900 hover:from-red-900 hover:via-red-800 hover:to-amber-950 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/30 mt-2 cursor-pointer group"
            >
              <span>{loading ? 'Authenticating Security Gate...' : 'Authenticate Institutional Session'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Persona Switcher */}
          <div className="pt-4 border-t border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="flex items-center gap-1.5 font-bold font-mono text-stone-800">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" /> PRE-LOADED PERSONAS
              </span>
              <span className="text-[10px] text-stone-500">Tap to populate</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoRoles.map((r) => {
                const isSelected = username === r.username;
                return (
                  <button
                    key={r.username}
                    type="button"
                    onClick={() => selectRole(r.username)}
                    className={`p-2.5 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-red-50 border-red-300 shadow-sm'
                        : 'bg-stone-50/80 border-stone-200 hover:bg-stone-100/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-stone-900 truncate flex items-center gap-1">
                        {isSelected && <CheckCircle className="w-3 h-3 text-red-700 flex-shrink-0" />}
                        <span className="truncate">{r.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-stone-500 font-bold">{r.msp}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono mt-0.5">{r.role}</div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
