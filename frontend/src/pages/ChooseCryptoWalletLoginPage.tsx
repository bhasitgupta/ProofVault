import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Database, ShieldCheck, ArrowLeft, Landmark } from 'lucide-react';
import { ChooseCryptoWalletLogin } from '../components/creative-tim/blocks/choose-crypto-wallet-login';

export const ChooseCryptoWalletLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleWalletSuccess = (_address: string, _role: string) => {
    navigate('/dossiers');
  };

  return (
    <div
      className="h-screen max-h-screen w-full overflow-hidden flex flex-col justify-center items-center p-3 sm:p-4 relative"
      style={{ background: '#FFFBF4' }}
    >
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(216,207,188,0.35) 0%, rgba(255,251,244,0) 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">

        {/* Left info column */}
        <div
          className="lg:col-span-5 hidden lg:flex flex-col justify-between p-6 rounded-3xl relative overflow-hidden h-[490px]"
          style={{ background: '#FFFFFF', border: '1px solid #D8CFBC', boxShadow: '0 2px 24px rgba(17,18,13,0.06)' }}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg, #11120D 0%, #565449 50%, #D8CFBC 100%)' }}
          />

          <div className="space-y-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono transition-colors"
              style={{ color: '#a09d8f' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#11120D'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#a09d8f'; }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div
                className="h-11 px-2.5 rounded-xl flex items-center justify-center shrink-0 border bg-white shadow-xs"
                style={{ borderColor: '#D8CFBC' }}
              >
                <img src="/proofvault-logo.png" alt="Proof Vault" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <div className="font-serif-judicial font-black text-lg leading-tight" style={{ color: '#11120D' }}>Proof Vault</div>
                <div className="text-[10px] font-mono" style={{ color: '#565449' }}>Secure Evidence · Stronger Justice</div>
              </div>
            </div>

            <h1 className="font-serif-judicial text-2xl font-black tracking-tight leading-snug" style={{ color: '#11120D' }}>
              Web3 Crypto Wallet Authentication
            </h1>

            <p className="text-xs leading-relaxed font-sans" style={{ color: '#565449' }}>
              Choose your preferred Web3 crypto wallet to access sovereign evidence records anchored on Polygon Amoy.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {[
              { icon: <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#565449' }} />, label: 'ENVELOPE CIPHER', value: 'AES-256-GCM', sub: 'Per-document DEK with doc_id AAD' },
              { icon: <Database className="w-3.5 h-3.5" style={{ color: '#565449' }} />, label: 'TRUST ANCHOR', value: 'BLOCKCHAIN EVM', sub: 'Evidence Registry Smart Contract' },
              { icon: <Scale className="w-3.5 h-3.5" style={{ color: '#565449' }} />, label: 'COURT ADMISSIBILITY', value: 'BSA §63 / IEA §65B', sub: 'Statutory Certificate Generation' },
            ].map((card, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl space-y-0.5"
                style={{ background: 'rgba(255,251,244,0.8)', border: '1px solid #D8CFBC' }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: '#a09d8f' }}>
                  <span className="flex items-center gap-1.5">{card.icon} {card.label}</span>
                  <span className="font-bold" style={{ color: '#11120D' }}>{card.value}</span>
                </div>
                <div className="text-[10px]" style={{ color: '#a09d8f' }}>{card.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right creative tim block */}
        <div className="lg:col-span-7">
          <ChooseCryptoWalletLogin onSuccess={handleWalletSuccess} />
        </div>

      </div>
    </div>
  );
};

export default ChooseCryptoWalletLoginPage;
