import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Database, ShieldCheck, ArrowLeft, Lock, Radio } from 'lucide-react';
import { ConnectWallet } from '../components/ConnectWallet';

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub: string }> = ({ icon, label, value, sub }) => (
  <div
    className="p-4 rounded-xl space-y-1"
    style={{ background: 'rgba(255,251,244,0.8)', border: '1px solid #D8CFBC' }}
  >
    <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: '#a09d8f' }}>
      <span className="flex items-center gap-1.5">{icon}{label}</span>
      <span className="font-bold" style={{ color: '#11120D' }}>{value}</span>
    </div>
    <div className="text-[11px]" style={{ color: '#a09d8f' }}>{sub}</div>
  </div>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleWalletSuccess = (_address: string, _role: string) => {
    navigate('/dossiers');
  };

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center p-4 relative"
      style={{ background: '#FFFBF4' }}
    >
      {/* Sovereign ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(216,207,188,0.3) 0%, rgba(255,251,244,0) 70%)',
            filter: 'blur(45px)',
          }}
        />
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">

        {/* Left info column */}
        <div
          className="lg:col-span-5 hidden lg:flex flex-col justify-between p-8 rounded-3xl relative overflow-hidden h-[540px]"
          style={{ background: '#FFFFFF', border: '1px solid #D8CFBC', boxShadow: '0 2px 24px rgba(17,18,13,0.06)' }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg, #11120D 0%, #565449 50%, #D8CFBC 100%)' }}
          />

          <div className="space-y-5 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono transition-colors"
              style={{ color: '#a09d8f' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#11120D'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#a09d8f'; }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
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

            <h1 className="font-serif-judicial text-xl font-black tracking-tight leading-snug" style={{ color: '#11120D' }}>
              Sovereign Digital Evidence Management
            </h1>

            <p className="text-xs leading-relaxed font-sans" style={{ color: '#565449' }}>
              Cryptographically anchored document management platform engineered for electronic legal evidence, forensic custody trails, and judicial scrutiny under BSA §63.
            </p>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <InfoCard
              icon={<ShieldCheck className="w-3.5 h-3.5 mr-1" style={{ color: '#565449' }} />}
              label="ENVELOPE CIPHER"
              value="AES-256-GCM"
              sub="Per-document DEK with doc_id AAD"
            />
            <InfoCard
              icon={<Database className="w-3.5 h-3.5 mr-1" style={{ color: '#565449' }} />}
              label="TRUST ANCHOR"
              value="BLOCKCHAIN EVM"
              sub="Evidence Registry Smart Contract"
            />
            <InfoCard
              icon={<Scale className="w-3.5 h-3.5 mr-1" style={{ color: '#565449' }} />}
              label="COURT ADMISSIBILITY"
              value="BSA §63 / IEA §65B"
              sub="Statutory Certificate Generation"
            />
          </div>
        </div>

        {/* Right connect column */}
        <div
          className="lg:col-span-7 p-6 sm:p-10 rounded-3xl space-y-6 relative overflow-hidden"
          style={{ background: '#FFFFFF', border: '1px solid #D8CFBC', boxShadow: '0 2px 24px rgba(17,18,13,0.06)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg, #565449 0%, #D8CFBC 50%, #11120D 100%)' }}
          />

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#11120D' }}
              >
                <Lock className="w-4 h-4" style={{ color: '#D8CFBC' }} />
              </div>
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-wider" style={{ color: '#a09d8f' }}>
                  WEB3 INSTITUTIONAL AUTHENTICATION
                </div>
                <h2 className="font-serif-judicial text-xl font-bold" style={{ color: '#11120D' }}>
                  Connect Sovereign Wallet
                </h2>
              </div>
            </div>
            <p className="text-xs font-sans" style={{ color: '#565449' }}>
              Authenticate via your cryptographic Web3 hardware or software wallet. No passwords or OTPs required.
            </p>
          </div>

          <ConnectWallet onSuccess={handleWalletSuccess} />

          <div
            className="pt-4 flex items-center justify-between text-xs font-mono"
            style={{ borderTop: '1px solid #D8CFBC', color: '#a09d8f' }}
          >
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse" style={{ color: '#565449' }} />
              EIP-1193 · Polygon Amoy EVM 80002
            </span>
            <span className="text-[10px]" style={{ color: '#D8CFBC' }}>Zero-Trust Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
