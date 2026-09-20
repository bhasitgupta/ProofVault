import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Database, ShieldCheck, ArrowLeft, ArrowRight, Landmark, Gavel, Lock } from 'lucide-react';
import { ConnectWallet } from '../components/ConnectWallet';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleWalletSuccess = (address: string, role: string) => {
    navigate('/dossiers');
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
              Cryptographically anchored document management platform engineered for electronic legal evidence, forensic custody trails, and judicial scrutiny under BSA §63.
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
              <div className="text-[11px] text-slate-500 font-sans">EVM Chain 80002 EvidenceRegistry</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
              <div className="text-[10px] text-slate-700 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-amber-600" /> COURT ADMISSIBILITY</span>
                <span className="text-slate-900 font-bold">BSA §63 / IEA §65B</span>
              </div>
              <div className="text-[11px] text-slate-500 font-sans">Statutory Certificate Generation</div>
            </div>
          </div>
        </div>

        {/* Right Connect Wallet Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl glass-card shadow-sm border border-slate-200/90 space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-slate-700" />
                WEB3 INSTITUTIONAL AUTHENTICATION
              </span>
              <Link
                to="/choose-crypto-wallet-login"
                className="px-2.5 py-1 rounded-lg bg-crimson-50 hover:bg-crimson-100 text-crimson-800 border border-crimson-200 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Creative Tim Block</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <h2 className="font-serif-judicial text-2xl font-bold text-slate-900">
              Connect Sovereign Wallet
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              Authenticate via your cryptographic Web3 hardware or software wallet. No passwords or OTPs required.
            </p>
          </div>

          <ConnectWallet onSuccess={handleWalletSuccess} />

          <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Need search &amp; catalog wallet selection?</span>
            <Link
              to="/choose-crypto-wallet-login"
              className="inline-flex items-center gap-1.5 text-crimson-800 hover:text-crimson-900 font-bold hover:underline"
            >
              <span>Launch Choose Crypto Wallet Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
