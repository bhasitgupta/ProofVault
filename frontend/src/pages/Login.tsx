import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, KeyRound, Sparkles, CheckCircle } from 'lucide-react';
import { login } from '../api/auth';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('investigator_gupta');
  const [password, setPassword] = useState('SecurePass@2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const demoRoles = [
    { name: 'Inspector Bhasit Gupta', username: 'investigator_gupta', role: 'Investigator', badge: 'badge-confidential' },
    { name: 'Dr. Ananya Iyer', username: 'forensic_ananya', role: 'Forensic Analyst', badge: 'badge-secret' },
    { name: 'SP Vikram Kapoor', username: 'supervisor_kapoor', role: 'Supervisor', badge: 'badge-secret' },
    { name: 'System Root Admin', username: 'admin_sys', role: 'Global Admin', badge: 'badge-secret' },
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
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (u: string) => {
    setUsername(u);
    setPassword('SecurePass@2026');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh-dark">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 shadow-2xl shadow-black/80 space-y-6 border border-slate-700/60 relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center space-y-2 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-950/80 border border-blue-500/50 mb-1 shadow-lg shadow-blue-500/20">
            <Shield className="w-8 h-8 text-blue-400 animate-pulse-glow" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">SDMS Evidentiary Portal</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Zero-Trust Chain of Custody & Evidence Intelligence
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-[10px] font-mono text-blue-300">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>MHA SIH26190 Specification</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Official Identifier</span>
              <span className="text-[10px] text-slate-500 font-mono">MSP-BOUND</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Passphrase</span>
              <span className="text-[10px] text-slate-500 font-mono">PBKDF2 HASHED</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 mt-1 cursor-pointer"
          >
            <span>{loading ? 'Verifying Credentials...' : 'Authenticate Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Role Picker */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <KeyRound className="w-3 h-3 text-cyan-400" /> Demo Personas
            </span>
            <span className="text-[10px] text-slate-500">Click to autofill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoRoles.map((r) => (
              <button
                key={r.username}
                type="button"
                onClick={() => selectRole(r.username)}
                className={`p-2 rounded-lg text-left transition-all border ${
                  username === r.username
                    ? 'bg-blue-950/70 border-blue-500/60 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-200 truncate flex items-center gap-1">
                  {username === r.username && <CheckCircle className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />}
                  <span className="truncate">{r.name}</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono">{r.role}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
          Authorized personnel only. All access transactions are logged immutably.
        </div>
      </div>
    </div>
  );
};
