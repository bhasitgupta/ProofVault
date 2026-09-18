import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { login } from '../api/auth';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('investigator_gupta');
  const [password, setPassword] = useState('SecurePass@2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-police-blue/30 border border-police-accent/40 mb-2">
            <Shield className="w-8 h-8 text-police-accent" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">SDMS Government Portal</h2>
          <p className="text-xs text-slate-400">
            Ministry of Home Affairs — Secure Digital Management System
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-police-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-police-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-police-accent hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Authorized personnel only. All access transactions are logged immutably.
        </div>
      </div>
    </div>
  );
};
