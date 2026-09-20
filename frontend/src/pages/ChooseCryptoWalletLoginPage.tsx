import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Database, ShieldCheck, ArrowLeft, Landmark } from 'lucide-react';
import { ChooseCryptoWalletLogin } from '../components/creative-tim/blocks/choose-crypto-wallet-login';

export const ChooseCryptoWalletLoginPage: React.FC = () => {
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
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors font-mono">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Classic Login</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-50 text-crimson-800 text-xs font-mono border border-crimson-200/80">
              <Landmark className="w-3.5 h-3.5 text-crimson-800" />
              <span>CREATIVE TIM ARCHITECTURE</span>
            </div>

            <h1 className="font-serif-judicial text-3xl font-black text-stone-900 tracking-tight leading-snug">
              Web3 Crypto Wallet Authentication
            </h1>

            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Choose your preferred Web3 crypto wallet from the curated provider catalog to access sovereign evidence records anchored on Polygon Amoy.
            </p>
          </div>

          {/* Telemetry Cards */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-white/70 border border-stone-200/80 space-y-1">
              <div className="text-[10px] text-stone-700 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> ENVELOPE CIPHER</span>
                <span className="text-stone-900 font-bold">AES-256-GCM</span>
              </div>
              <div className="text-[11px] text-stone-500 font-sans">Per-document DEK with doc_id AAD</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-stone-200/80 space-y-1">
              <div className="text-[10px] text-stone-700 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-emerald-600" /> TRUST NETWORK</span>
                <span className="text-stone-900 font-bold">POLYGON AMOY</span>
              </div>
              <div className="text-[11px] text-stone-500 font-sans">EVM Chain 80002 EvidenceRegistry</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-stone-200/80 space-y-1">
              <div className="text-[10px] text-stone-700 font-bold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-amber-600" /> COURT ADMISSIBILITY</span>
                <span className="text-stone-900 font-bold">BSA §63 / IEA §65B</span>
              </div>
              <div className="text-[11px] text-stone-500 font-sans">Statutory Certificate Generation</div>
            </div>
          </div>
        </div>

        {/* Right Creative Tim Block Column */}
        <div className="lg:col-span-7">
          <ChooseCryptoWalletLogin onSuccess={handleWalletSuccess} />
        </div>

      </div>
    </div>
  );
};

export default ChooseCryptoWalletLoginPage;
