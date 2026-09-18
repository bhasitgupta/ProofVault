import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, KeyRound, CheckCircle, Scale, Database, ShieldCheck, ArrowLeft } from 'lucide-react';
import { login } from '../api/auth';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('investigator_gupta');
  const [password, setPassword] = useState('SecurePass@2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const demoRoles = [
    { name: 'Inspector Bhasit Gupta', username: 'investigator_gupta', role: 'Chief Investigator', badge: 'Police Division' },
    { name: 'Dr. Ananya Iyer', username: 'forensic_ananya', role: 'Forensic Director', badge: 'Forensic Lab' },
    { name: 'SP Vikram Kapoor', username: 'supervisor_kapoor', role: 'Supervisory Command', badge: 'Judicial Oversight' },
    { name: 'Root System Admin', username: 'admin_sys', role: 'Security Controller', badge: 'Infrastructure' },
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
      } else {
        navigate('/dossiers');
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
        
        {/* Left Information Column */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-8 rounded-3xl glass-panel shadow-sm relative overflow-hidden h-[540px]">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-mono">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono border border-slate-200">
              <Scale className="w-3.5 h-3.5 text-slate-700" />
              <span>INSTITUTIONAL GATEWAY</span>
            </div>

            <h1 className="font-serif-judicial text-3xl font-black text-slate-900 tracking-tight leading-snug">
              Sovereign Evidence Provenance Vault
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Cryptographically anchored document management platform engineered for legal evidence, forensic custody trails, and judicial scrutiny.
            </p>
          </div>

          {/* Telemetry Cards */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-700 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> ENVELOPE CIPHER</span>
                <span className="text-slate-900 font-bold">AES-256-GCM</span>
              </div>
              <div className="text-[11px] text-slate-500 font-sans">Per-document DEK with doc_id AAD</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-700 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-emerald-600" /> TRUST NETWORK</span>
                <span className="text-slate-900 font-bold">POLYGON AMOY</span>
              </div>
              <div className="text-[11px] text-slate-500 font-sans">Chain ID 80002 Merkle Anchoring</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-700 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-amber-600" /> COURT ADMISSIBILITY</span>
                <span className="text-slate-900 font-bold">BSA §63 / IEA §65B</span>
              </div>
              <div className="text-[11px] text-slate-500 font-sans">Cryptographic Certificate Generation</div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-200/80 pt-3">
            <span>TERMINAL ID: NYAYA-01</span>
            <span className="text-emerald-600 font-bold">● ACTIVE CONSENSUS</span>
          </div>
        </div>

        {/* Right Authentication Column */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 relative overflow-hidden bg-white/95">
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-700 font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4 text-indigo-700" /> Institutional Verification
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                ZERO-TRUST MFA
              </span>
            </div>
            <h2 className="font-serif-judicial text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Access NYAYA-VAULT
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Provide institutional credentials to challenge security clearance.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping flex-shrink-0"></span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between font-mono">
                <span>OFFICIAL IDENTIFIER</span>
                <span className="text-[10px] text-slate-400 font-normal">INSTITUTIONAL ID</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. investigator_gupta"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between font-mono">
                <span>PASSPHRASE</span>
                <span className="text-[10px] text-slate-400 font-normal">PBKDF2 ENCRYPTED</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all shadow-sm hover:shadow mt-2 cursor-pointer group"
            >
              <span>{loading ? 'Authenticating Security Gate...' : 'Authenticate Institutional Session'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
            </button>
          </form>

          {/* Quick Demo Persona Switcher */}
          <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-bold font-mono text-slate-700">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> PRE-LOADED PERSONAS
              </span>
              <span className="text-[10px]">Tap to populate</span>
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
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold truncate flex items-center gap-1">
                        {isSelected && <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                        <span className="truncate">{r.name}</span>
                      </div>
                    </div>
                    <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{r.badge}</div>
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

export default Login;
