import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, KeyRound, Sparkles, CheckCircle, Terminal, Layers, Database, ShieldCheck } from 'lucide-react';
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
        
        {/* Left Telemetry Column (Holographic Status Console) */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-8 rounded-3xl glass-obsidian border border-white/10 shadow-2xl relative overflow-hidden h-[540px]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIH26190 TRUST PROTOCOL</span>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              Sovereign Legal Evidence Provenance
            </h1>

            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographically anchored document custody, Merkle tree verification, and BSA §63 legal evidence certificates.
            </p>
          </div>

          {/* Security Telemetry Readouts */}
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-400" /> ENVELOPE CIPHER</span>
                <span className="text-emerald-400 font-bold">AES-256-GCM</span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">AAD Bound Per Document DEK</div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Database className="w-3 h-3 text-indigo-400" /> BLOCKCHAIN TRUST</span>
                <span className="text-indigo-400 font-bold">POLYGON DLT</span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">Dual Channel Proof Ledger</div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-cyan-400" /> MERKLE TREE</span>
                <span className="text-cyan-400 font-bold">DOMAIN SEPARATED</span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">Preimage Attack Resistant</div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-white/5 pt-3">
            <span>TERMINAL ID: NYAYA-SEC-01</span>
            <span className="text-emerald-400">● LIVE PING</span>
          </div>
        </div>

        {/* Right Authentication Column */}
        <div className="lg:col-span-7 glass-obsidian border-iridescent rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/90 space-y-6 relative overflow-hidden">
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" /> Phase 1 Credentials
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                SYSTEM ONLINE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Access NYAYA-VAULT
            </h2>
            <p className="text-xs text-slate-400">
              Provide authorized institutional credentials to initialize zero-trust challenge.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-xs text-rose-300 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping flex-shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between font-mono">
                <span>OFFICIAL IDENTIFIER</span>
                <span className="text-[10px] text-indigo-400">MSP BOUND</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. investigator_gupta"
                  className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between font-mono">
                <span>PASSPHRASE</span>
                <span className="text-[10px] text-indigo-400">PBKDF2 CHALLENGE</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 mt-2 cursor-pointer group"
            >
              <span>{loading ? 'Validating Cryptographic Gate...' : 'Authenticate Institutional Session'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Persona Switcher */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold font-mono text-indigo-300">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> PRE-LOADED PERSONAS
              </span>
              <span className="text-[10px] text-slate-500">Tap to populate</span>
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
                        ? 'bg-indigo-950/70 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                        : 'bg-black/30 border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {isSelected && <CheckCircle className="w-3 h-3 text-indigo-400 flex-shrink-0" />}
                        <span className="truncate">{r.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-indigo-400">{r.msp}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{r.role}</div>
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
