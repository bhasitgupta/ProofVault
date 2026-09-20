import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  Database,
  Lock,
  ArrowRight,
  User,
  KeyRound,
  CheckCircle2,
  FileCheck2,
  Fingerprint,
  Radio,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ConnectWallet } from '../components/ConnectWallet';
import { StrokeText } from '../components/StrokeText';
import { ThemeToggle } from '../components/ThemeToggle';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Login Modal State
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Theme reactive state for StrokeText
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('proofvault_theme') as 'light' | 'dark') || 'light';
  });

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark');
      setCurrentTheme(dark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-ambient text-slate-900 relative overflow-hidden flex flex-col justify-between selection:bg-indigo-500/10 selection:text-indigo-900">
      {/* Top Floating Glass Header */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 sm:px-6 w-full pointer-events-none">
        <div className="glass-panel rounded-2xl px-6 h-16 flex items-center justify-between shadow-sm pointer-events-auto transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md overflow-hidden p-1 border border-slate-700/50">
              <img src="/logo.png" alt="Proof Vault" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif-judicial font-black tracking-wider text-slate-900 text-base block">
                Proof Vault
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wide block -mt-0.5">
                Secure Evidence • Stronger Justice
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 text-[11px] font-mono text-slate-600">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Polygon Amoy Verified</span>
            </div>

            {user ? (
              <button
                onClick={() => navigate('/dossiers')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Enter Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-300" />
                <span>Institutional Login</span>
              </button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 lg:py-20 relative z-10 space-y-16">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-slate-700 text-xs font-medium border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Zero-Trust Electronic Evidence Architecture</span>
          </div>

          {/* StrokeText Animated Brand Name */}
          <div className="w-full max-w-xl mx-auto py-2">
            <StrokeText
              text="ProofVault"
              strokeColor="#F26A4B"
              fillColor={currentTheme === 'dark' ? '#EDE8DF' : '#18181B'}
              strokeWidth={1.8}
              drawDuration={1.8}
              fillDelay={0.25}
              stagger={0.06}
              ease="power2.out"
              trigger="mount"
              fillMode="wipe"
              fontSize={110}
              fontWeight={900}
              letterSpacing={-3}
              className="font-serif-judicial"
            />
          </div>

          <h1 className="font-serif-judicial text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Sovereign Digital Provenance & Evidence Vault
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
            High-assurance electronic document lifecycle system anchoring Merkle tree roots to Polygon EVM for tamper detection and courtroom admissibility.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
            >
              <span>Access Evidence Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/choose-crypto-wallet-login')}
              className="px-6 py-3.5 bg-crimson-800 hover:bg-crimson-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Choose Crypto Wallet Login</span>
            </button>

            <a
              href="#pillars"
              className="px-6 py-3.5 glass-card glass-card-hover font-semibold text-sm text-slate-700 rounded-xl transition-all flex items-center gap-2"
            >
              <span>Explore Architecture</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Live Trust Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="glass-card p-5 rounded-2xl text-center space-y-1">
            <div className="text-xs text-slate-500 font-mono font-medium">CRYPTOGRAPHIC CIPHER</div>
            <div className="text-lg font-bold text-slate-900 font-mono">AES-256-GCM</div>
            <div className="text-[11px] text-slate-500">Per-document DEK Envelope</div>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center space-y-1">
            <div className="text-xs text-slate-500 font-mono font-medium">TRUST ANCHOR</div>
            <div className="text-lg font-bold text-slate-900 font-mono">Polygon Amoy</div>
            <div className="text-[11px] text-slate-500">Chain ID 80002 EVM</div>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center space-y-1">
            <div className="text-xs text-slate-500 font-mono font-medium">LEGAL STANDARD</div>
            <div className="text-lg font-bold text-slate-900 font-mono">BSA §63 / IEA §65B</div>
            <div className="text-[11px] text-slate-500">Admissible Certificates</div>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center space-y-1">
            <div className="text-xs text-slate-500 font-mono font-medium">CUSTODY INTEGRITY</div>
            <div className="text-lg font-bold text-emerald-700 font-mono">Zero-Trust Log</div>
            <div className="text-[11px] text-slate-500">Sequential Hash Chaining</div>
          </div>
        </div>

        {/* 4 Core Architectural Pillars */}
        <div id="pillars" className="space-y-6 pt-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="font-serif-judicial text-2xl sm:text-3xl font-bold text-slate-900">
              Institutional Trust Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              Engineered to separate sensitive document payloads from the public consensus plane.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Domain-Separated Merkle Trees</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Evidence objects are decomposed into deterministic chunks with individual SHA-256 digests. Only the final Merkle root is anchored on-chain, proving document authenticity without disclosing confidential data.
              </p>
            </div>

            <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Immutable Chain-of-Custody</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every forensic extraction, access grant, and transfer records a cryptographically linked custody block. Modifications outside authorized judicial channels invalidate the sequence immediately.
              </p>
            </div>

            <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Statutory Legal Hold Registry</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Court-mandated preservation freezes prevent premature disposal or evidence modification. Enforced across Police, Forensics, Prosecution, and Judiciary boundaries.
              </p>
            </div>

            <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Automated Section 63 Certificates</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Generates signed cryptographic certificates affirming electronic evidence integrity, device provenance, and hash consistency compliant with Bharatiya Sakshya Adhiniyam standards.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Floating Modern Footer */}
      <footer className="border-t border-slate-200/80 py-6 bg-white/60 backdrop-blur-xl relative z-10 text-xs text-slate-500 font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Proof Vault" className="w-4 h-4 object-contain" />
            <span>Proof Vault • High-Assurance Electronic Evidence & Provenance Platform</span>
          </div>
          <div className="text-[11px] flex items-center gap-2">
            <span>Polygon Amoy Network</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Active Consensus</span>
          </div>
        </div>
      </footer>

      {/* Direct Institutional Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-8 sm:p-10 relative space-y-6">
            
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 pr-8">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-700 font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4" /> Web3 Institutional Gateway
              </div>
              <h2 className="font-serif-judicial text-2xl font-black text-slate-900 tracking-tight">
                Connect Sovereign Wallet
              </h2>
              <p className="text-xs text-slate-500">
                Authenticate with verified institutional Web3 wallet (MetaMask, Phantom, or Coinbase Wallet).
              </p>
            </div>

            <ConnectWallet onSuccess={() => { setIsLoginOpen(false); navigate('/dossiers'); }} />

          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
