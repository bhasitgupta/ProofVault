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
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';

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
              <span className="font-serif-judicial font-black tracking-wider text-stone-900 dark:text-white text-base block">
                Proof Vault
              </span>
              <span className="text-[10px] text-stone-600 dark:text-stone-400 font-mono tracking-wide block -mt-0.5 font-medium">
                Secure Evidence • Stronger Justice
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-stone-850 border border-slate-200 dark:border-stone-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 font-semibold">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Polygon Amoy Verified</span>
            </div>

            {user ? (
              <button
                onClick={() => navigate('/dossiers')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Enter Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-300 dark:text-indigo-600" />
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

        {/* Block Tagging & Provenance Stack */}
        <div id="pillars" className="space-y-6 pt-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>ON-CHAIN BLOCK TAGGING & VERIFICATION</span>
            </div>
            <h2 className="font-serif-judicial text-2xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
              Sovereign Evidence Block Stack
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans">
              Scroll down to inspect the cryptographic block sequence. Every evidence object traverses Merkle root generation, custody tagging, statutory freezes, and EVM finality.
            </p>
          </div>

          <ScrollStack
            useWindowScroll={true}
            itemDistance={36}
            itemScale={0.03}
            itemStackDistance={28}
            stackPosition="22%"
            scaleEndPosition="10%"
            baseScale={0.88}
            className="w-full"
          >
            {/* Block 01 */}
            <ScrollStackItem itemClassName="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl rounded-3xl p-6 sm:p-8 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shadow-xs">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                        BLOCK #01 • MERKLE-TAG-ROOT
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        ACTIVE ANCHOR
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold text-stone-900 dark:text-white mt-1">
                      Domain-Separated Merkle Tree Tagging
                    </h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                  <div>EVM Opcodes: SHA-256 + Keccak</div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold">Consensus Verified</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-4 font-sans">
                Evidence objects are decomposed into deterministic chunks with individual SHA-256 digests. Only the final Merkle root is anchored on-chain, proving complete document integrity and origin without disclosing private evidentiary records.
              </p>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Root Digest:</span>
                  <span className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">0x8f3ae920b...c94e0194</span>
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold">Zero-Knowledge Admissible</div>
              </div>
            </ScrollStackItem>

            {/* Block 02 */}
            <ScrollStackItem itemClassName="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl rounded-3xl p-6 sm:p-8 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-xs">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                        BLOCK #02 • CUSTODY-DID-CHAIN
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        STRICT CHRONOLOGY
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold text-stone-900 dark:text-white mt-1">
                      Immutable Chain-of-Custody Sequencing
                    </h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                  <div>ECDSA Secp256k1 Signed</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">Non-Repudiable Log</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-4 font-sans">
                Every forensic extraction, access grant, officer inspection, and custodial transfer records a cryptographically linked block with sovereign DID credentials. Any out-of-band manipulation breaks the hash sequence instantly.
              </p>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Custody DID:</span>
                  <span className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">did:key:z6MkuT9qV...police-hq</span>
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold">Sequence: Block #1042 Verified</div>
              </div>
            </ScrollStackItem>

            {/* Block 03 */}
            <ScrollStackItem itemClassName="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl rounded-3xl p-6 sm:p-8 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                        BLOCK #03 • STATUTORY-FREEZE-LOCK
                      </span>
                      <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        JUDICIAL SEAL
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold text-stone-900 dark:text-white mt-1">
                      Statutory Court Legal Hold Registry
                    </h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                  <div>Section 91 CrPC / BNSS §94</div>
                  <div className="text-amber-600 dark:text-amber-400 font-bold">Disposal Prohibited</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-4 font-sans">
                Court-mandated preservation orders freeze evidence across Police Stations, Forensic Science Laboratories, Public Prosecutors, and Judicial Benches, ensuring zero unauthorized purges or pre-trial tampering.
              </p>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Warrant Lock:</span>
                  <span className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">COURT-ORDER-HC/DL/2026/092</span>
                </div>
                <div className="text-amber-700 dark:text-amber-400 font-semibold">Judicial Quorum Enforced</div>
              </div>
            </ScrollStackItem>

            {/* Block 04 */}
            <ScrollStackItem itemClassName="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl rounded-3xl p-6 sm:p-8 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-700 dark:text-rose-400 shadow-xs">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
                        BLOCK #04 • CERT-BSA63-ADMISSIBLE
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        COURT ADMISSIBLE
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold text-stone-900 dark:text-white mt-1">
                      Automated BSA §63 & 65B Provenance Certificates
                    </h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                  <div>Bharatiya Sakshya Adhiniyam</div>
                  <div className="text-rose-600 dark:text-rose-400 font-bold">Cryptographically Sealed</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-4 font-sans">
                Generates legally binding electronic certificates detailing hardware hash consistency, device environment logs, and custodian signatures, satisfying the strict evidentiary standards of Indian and international jurisprudence.
              </p>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Cert Hash:</span>
                  <span className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">0x65b_bsa63_sha256_certified</span>
                </div>
                <div className="text-rose-700 dark:text-rose-400 font-semibold">Direct Evidence Admissibility</div>
              </div>
            </ScrollStackItem>

            {/* Block 05 */}
            <ScrollStackItem itemClassName="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl rounded-3xl p-6 sm:p-8 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shadow-xs">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700">
                        BLOCK #05 • CONSENSUS-POLYGON-80002
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        EVM ANCHOR
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold text-stone-900 dark:text-white mt-1">
                      Public Polygon Amoy Settlement & Audit
                    </h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                  <div>Chain ID: 80002 Amoy</div>
                  <div className="text-cyan-600 dark:text-cyan-400 font-bold">Tamper-Evident Ledger</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-4 font-sans">
                State commitments are settled onto the Polygon Amoy blockchain. Every citizen, attorney, or judicial officer can independently verify timestamps, merkle roots, and custody transitions without trusting intermediate parties.
              </p>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Contract:</span>
                  <span className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">0x619AE05f2c41793740D2c99a6136Ec56B690431B</span>
                </div>
                <div className="text-cyan-700 dark:text-cyan-400 font-semibold">Decentralized Finality</div>
              </div>
            </ScrollStackItem>
          </ScrollStack>
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
