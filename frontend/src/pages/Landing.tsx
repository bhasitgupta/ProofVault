import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  Database,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Fingerprint,
  Radio,
  FileText,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  X,
  Gavel,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ConnectWallet } from '../components/ConnectWallet';
import { StrokeText } from '../components/StrokeText';
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';

/* ── Animated background orb component ─────────────────────── */
const Orb: React.FC<{
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  color: string;
  delay?: string;
  duration?: string;
}> = ({ size, top, left, right, bottom, color, delay = '0s', duration = '18s' }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      top,
      left,
      right,
      bottom,
      background: color,
      filter: 'blur(80px)',
      opacity: 0.45,
      animation: `drift-1 ${duration} ease-in-out infinite`,
      animationDelay: delay,
    }}
  />
);

const METRICS = [
  { label: 'CRYPTOGRAPHIC CIPHER', value: 'AES-256-GCM', sub: 'Per-document DEK Envelope' },
  { label: 'TRUST ANCHOR', value: 'Polygon Amoy', sub: 'Chain ID 80002 EVM' },
  { label: 'LEGAL STANDARD', value: 'BSA §63 / IEA §65B', sub: 'Admissible Certificates' },
  { label: 'CUSTODY INTEGRITY', value: 'Zero-Trust Log', sub: 'Sequential Hash Chaining', highlight: true },
];

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const headerOpacity = Math.min(scrollY / 80, 1);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#FFFBF4', color: '#11120D' }}
    >
      {/* ── Animated Mesh Background ──────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Orb size={700} top="-15%" right="-10%" color="rgba(216,207,188,0.5)" duration="22s" />
        <Orb size={500} bottom="10%" left="-8%" color="rgba(86,84,73,0.12)" duration="28s" delay="4s" />
        <Orb size={350} top="40%" left="40%" color="rgba(216,207,188,0.3)" duration="18s" delay="2s" />
        {/* Fine grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(#11120D 1px, transparent 1px), linear-gradient(90deg, #11120D 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Top Floating Header ───────────────────────────────────── */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 sm:px-6 w-full pointer-events-none">
        <div
          className="glass-nav-obsidian px-6 h-16 flex items-center justify-between pointer-events-auto transition-all"
          style={{
            boxShadow: `0 ${2 + headerOpacity * 10}px ${8 + headerOpacity * 24}px rgba(17,18,13,${0.04 + headerOpacity * 0.1})`,
          }}
        >
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden p-1"
              style={{ background: '#11120D', border: '1px solid rgba(216,207,188,0.2)' }}
            >
              <img src="/proofvault-logo.png" alt="Proof Vault" className="w-full h-full object-contain" />
            </div>
            <div className="shrink-0">
              <div className="font-serif-judicial font-black tracking-wider text-base block" style={{ color: '#11120D' }}>
                Proof Vault
              </div>
              <div className="text-[10px] font-mono font-semibold tracking-wide -mt-0.5" style={{ color: '#565449' }}>
                Secure Evidence · Stronger Justice
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <button
                onClick={() => navigate('/dossiers')}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                style={{ background: '#11120D', color: '#FFFBF4' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1e1f18'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#11120D'; }}
              >
                <span>Enter Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                style={{ background: '#11120D', color: '#FFFBF4' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = '#1e1f18';
                  el.style.transform = 'translateY(-1px)';
                  el.style.boxShadow = '0 6px 20px rgba(17,18,13,0.25)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = '#11120D';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                <Lock className="w-3.5 h-3.5" style={{ color: '#D8CFBC' }} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 lg:py-20 relative z-10 space-y-20">
        
        <div className="text-center max-w-3xl mx-auto space-y-8 pt-4">
          {/* Status pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border"
            style={{ background: 'rgba(216,207,188,0.25)', borderColor: '#D8CFBC', color: '#565449' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#565449' }}></span>
            <span>Zero-Trust Electronic Evidence Architecture</span>
          </div>

          {/* Brand name */}
          <div className="w-full max-w-xl mx-auto py-2">
            <StrokeText
              text="ProofVault"
              strokeColor="#565449"
              fillColor="#11120D"
              strokeWidth={1.5}
              drawDuration={1.8}
              fillDelay={0.3}
              stagger={0.06}
              ease="power2.out"
              trigger="mount"
              fillMode="wipe"
              fontSize={105}
              fontWeight={900}
              letterSpacing={-3}
              className="font-serif-judicial"
            />
          </div>

          <h1 className="font-serif-judicial text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]" style={{ color: '#11120D' }}>
            Sovereign Digital Provenance &amp; Evidence Vault
          </h1>

          <p className="text-base sm:text-lg leading-relaxed font-sans max-w-2xl mx-auto" style={{ color: '#565449' }}>
            High-assurance electronic document lifecycle system anchoring Merkle tree roots to Polygon EVM for tamper detection and courtroom admissibility.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-7 py-3.5 font-bold text-sm rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
              style={{ background: '#11120D', color: '#FFFBF4' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = '#1e1f18';
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 8px 28px rgba(17,18,13,0.28)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = '#11120D';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <Shield className="w-4 h-4" style={{ color: '#D8CFBC' }} />
              <span>Connect Wallet</span>
            </button>

            <a
              href="#pillars"
              className="px-7 py-3.5 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 border"
              style={{
                background: '#FFFFFF',
                borderColor: '#D8CFBC',
                color: '#565449',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '#565449';
                el.style.transform = 'translateY(-1px)';
                el.style.boxShadow = '0 4px 16px rgba(17,18,13,0.07)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '#D8CFBC';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <span>Explore Architecture</span>
              <ChevronRight className="w-4 h-4" style={{ color: '#D8CFBC' }} />
            </a>
          </div>
        </div>

        {/* ── Metrics Bar ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'CRYPTOGRAPHIC CIPHER', value: 'AES-256-GCM', sub: 'Per-document DEK Envelope' },
            { label: 'TRUST ANCHOR', value: 'Blockchain EVM', sub: 'Evidence Registry Smart Contract' },
            { label: 'LEGAL STANDARD', value: 'BSA §63 / IEA §65B', sub: 'Admissible Certificates' },
            { label: 'CUSTODY INTEGRITY', value: 'Zero-Trust Log', sub: 'Sequential Hash Chaining', highlight: true },
          ].map((m, i) => (
            <div
              key={i}
              className="metric-card p-5 rounded-2xl text-center space-y-1.5"
              style={m.highlight ? { borderColor: '#565449' } : {}}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: '#a09d8f' }}>
                {m.label}
              </div>
              <div className="text-base font-bold font-mono leading-tight" style={{ color: m.highlight ? '#565449' : '#11120D' }}>
                {m.value}
              </div>
              <div className="text-[11px]" style={{ color: '#a09d8f' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Evidence Block Stack ─────────────────────────────────── */}
        <div id="pillars" className="space-y-8 pt-4">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border"
              style={{ background: 'rgba(86,84,73,0.08)', borderColor: 'rgba(86,84,73,0.2)', color: '#565449' }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ON-CHAIN BLOCK TAGGING &amp; VERIFICATION</span>
            </div>
            <h2 className="font-serif-judicial text-2xl sm:text-4xl font-bold tracking-tight" style={{ color: '#11120D' }}>
              Sovereign Evidence Block Stack
            </h2>
            <p className="text-sm" style={{ color: '#565449' }}>
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
            <ScrollStackItem itemClassName="border bg-white shadow-xl rounded-3xl p-6 sm:p-8 transition-colors" style={{ borderColor: '#D8CFBC' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid #e8e0d1' }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(86,84,73,0.08)', border: '1px solid rgba(86,84,73,0.2)' }}>
                    <Layers className="w-6 h-6" style={{ color: '#565449' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold" style={{ background: '#D8CFBC', color: '#11120D' }}>
                        BLOCK #01 · MERKLE-TAG-ROOT
                      </span>
                      <span className="text-[11px] font-mono font-semibold flex items-center gap-1" style={{ color: '#565449' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#565449' }}></span>
                        ACTIVE ANCHOR
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold mt-1" style={{ color: '#11120D' }}>Domain-Separated Merkle Tree Tagging</h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] hidden sm:block" style={{ color: '#a09d8f' }}>
                  <div>EVM Opcodes: SHA-256 + Keccak</div>
                  <div className="font-bold" style={{ color: '#565449' }}>Consensus Verified</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-4 font-sans" style={{ color: '#565449' }}>
                Evidence objects are decomposed into deterministic chunks with individual SHA-256 digests. Only the final Merkle root is anchored on-chain, proving complete document integrity and origin without disclosing private evidentiary records.
              </p>
              <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono" style={{ borderTop: '1px solid #f2ede4' }}>
                <div className="flex items-center gap-2" style={{ color: '#a09d8f' }}>
                  <span className="font-semibold" style={{ color: '#565449' }}>Root Digest:</span>
                  <span className="px-2 py-1 rounded" style={{ background: '#f2ede4', color: '#11120D' }}>0x8f3ae920b...c94e0194</span>
                </div>
                <div className="font-semibold" style={{ color: '#565449' }}>Zero-Knowledge Admissible</div>
              </div>
            </ScrollStackItem>

            {/* Block 02 */}
            <ScrollStackItem itemClassName="border bg-white shadow-xl rounded-3xl p-6 sm:p-8 transition-colors" style={{ borderColor: '#D8CFBC' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid #e8e0d1' }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(17,18,13,0.06)', border: '1px solid rgba(17,18,13,0.12)' }}>
                    <Fingerprint className="w-6 h-6" style={{ color: '#11120D' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold" style={{ background: '#11120D', color: '#FFFBF4' }}>
                        BLOCK #02 · CUSTODY-DID-CHAIN
                      </span>
                      <span className="text-[11px] font-mono font-semibold flex items-center gap-1" style={{ color: '#565449' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#565449' }}></span>
                        STRICT CHRONOLOGY
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold mt-1" style={{ color: '#11120D' }}>Immutable Chain-of-Custody Sequencing</h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] hidden sm:block" style={{ color: '#a09d8f' }}>
                  <div>ECDSA Secp256k1 Signed</div>
                  <div className="font-bold" style={{ color: '#11120D' }}>Non-Repudiable Log</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-4 font-sans" style={{ color: '#565449' }}>
                Every forensic extraction, access grant, officer inspection, and custodial transfer records a cryptographically linked block with sovereign DID credentials. Any out-of-band manipulation breaks the hash sequence instantly.
              </p>
              <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono" style={{ borderTop: '1px solid #f2ede4' }}>
                <div className="flex items-center gap-2" style={{ color: '#a09d8f' }}>
                  <span className="font-semibold" style={{ color: '#565449' }}>Custody DID:</span>
                  <span className="px-2 py-1 rounded" style={{ background: '#f2ede4', color: '#11120D' }}>did:key:z6MkuT9qV...police-hq</span>
                </div>
                <div className="font-semibold" style={{ color: '#11120D' }}>Sequence: Block #1042 Verified</div>
              </div>
            </ScrollStackItem>

            {/* Block 03 */}
            <ScrollStackItem itemClassName="border bg-white shadow-xl rounded-3xl p-6 sm:p-8 transition-colors" style={{ borderColor: '#D8CFBC' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid #e8e0d1' }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(216,207,188,0.4)', border: '1px solid rgba(216,207,188,0.8)' }}>
                    <ShieldCheck className="w-6 h-6" style={{ color: '#565449' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold" style={{ background: '#565449', color: '#FFFBF4' }}>
                        BLOCK #03 · STATUTORY-FREEZE-LOCK
                      </span>
                      <span className="text-[11px] font-mono font-semibold flex items-center gap-1" style={{ color: '#565449' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#D8CFBC' }}></span>
                        JUDICIAL SEAL
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold mt-1" style={{ color: '#11120D' }}>Statutory Court Legal Hold Registry</h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] hidden sm:block" style={{ color: '#a09d8f' }}>
                  <div>Section 91 CrPC / BNSS §94</div>
                  <div className="font-bold" style={{ color: '#565449' }}>Disposal Prohibited</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-4 font-sans" style={{ color: '#565449' }}>
                Court-mandated preservation orders freeze evidence across Police Stations, Forensic Science Laboratories, Public Prosecutors, and Judicial Benches, ensuring zero unauthorized purges or pre-trial tampering.
              </p>
              <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono" style={{ borderTop: '1px solid #f2ede4' }}>
                <div className="flex items-center gap-2" style={{ color: '#a09d8f' }}>
                  <span className="font-semibold" style={{ color: '#565449' }}>Warrant Lock:</span>
                  <span className="px-2 py-1 rounded" style={{ background: '#f2ede4', color: '#11120D' }}>COURT-ORDER-HC/DL/2026/092</span>
                </div>
                <div className="font-semibold" style={{ color: '#565449' }}>Judicial Quorum Enforced</div>
              </div>
            </ScrollStackItem>

            {/* Block 04 */}
            <ScrollStackItem itemClassName="border bg-white shadow-xl rounded-3xl p-6 sm:p-8 transition-colors" style={{ borderColor: '#D8CFBC' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid #e8e0d1' }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(17,18,13,0.05)', border: '1px solid rgba(17,18,13,0.1)' }}>
                    <FileCheck2 className="w-6 h-6" style={{ color: '#11120D' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold" style={{ background: '#D8CFBC', color: '#11120D' }}>
                        BLOCK #04 · CERT-BSA63-ADMISSIBLE
                      </span>
                      <span className="text-[11px] font-mono font-semibold flex items-center gap-1" style={{ color: '#565449' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#565449' }}></span>
                        COURT ADMISSIBLE
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold mt-1" style={{ color: '#11120D' }}>Automated BSA §63 &amp; 65B Provenance Certificates</h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] hidden sm:block" style={{ color: '#a09d8f' }}>
                  <div>Bharatiya Sakshya Adhiniyam</div>
                  <div className="font-bold" style={{ color: '#11120D' }}>Cryptographically Sealed</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-4 font-sans" style={{ color: '#565449' }}>
                Generates legally binding electronic certificates detailing hardware hash consistency, device environment logs, and custodian signatures, satisfying the strict evidentiary standards of Indian and international jurisprudence.
              </p>
              <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono" style={{ borderTop: '1px solid #f2ede4' }}>
                <div className="flex items-center gap-2" style={{ color: '#a09d8f' }}>
                  <span className="font-semibold" style={{ color: '#565449' }}>Cert Hash:</span>
                  <span className="px-2 py-1 rounded" style={{ background: '#f2ede4', color: '#11120D' }}>0x65b_bsa63_sha256_certified</span>
                </div>
                <div className="font-semibold" style={{ color: '#11120D' }}>Direct Evidence Admissibility</div>
              </div>
            </ScrollStackItem>

            {/* Block 05 */}
            <ScrollStackItem itemClassName="border bg-white shadow-xl rounded-3xl p-6 sm:p-8 transition-colors" style={{ borderColor: '#D8CFBC' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5" style={{ borderBottom: '1px solid #e8e0d1' }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: '#11120D' }}>
                    <Radio className="w-6 h-6" style={{ color: '#D8CFBC' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold" style={{ background: '#11120D', color: '#D8CFBC' }}>
                        BLOCK #05 · CONSENSUS-POLYGON-80002
                      </span>
                      <span className="text-[11px] font-mono font-semibold flex items-center gap-1" style={{ color: '#565449' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#565449' }}></span>
                        EVM ANCHOR
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-judicial font-bold mt-1" style={{ color: '#11120D' }}>Public Polygon Amoy Settlement &amp; Audit</h3>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] hidden sm:block" style={{ color: '#a09d8f' }}>
                  <div>Chain ID: 80002 Amoy</div>
                  <div className="font-bold" style={{ color: '#565449' }}>Tamper-Evident Ledger</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-4 font-sans" style={{ color: '#565449' }}>
                State commitments are settled onto the Polygon Amoy blockchain. Every citizen, attorney, or judicial officer can independently verify timestamps, Merkle roots, and custody transitions without trusting intermediate parties.
              </p>
              <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono" style={{ borderTop: '1px solid #f2ede4' }}>
                <div className="flex items-center gap-2" style={{ color: '#a09d8f' }}>
                  <span className="font-semibold" style={{ color: '#565449' }}>Contract:</span>
                  <span className="px-2 py-1 rounded" style={{ background: '#f2ede4', color: '#11120D' }}>0x619AE05f2c41793740D2c99a6136Ec56B690431B</span>
                </div>
                <div className="font-semibold" style={{ color: '#11120D' }}>Decentralized Finality</div>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        className="py-6 relative z-10 text-xs font-mono"
        style={{ borderTop: '1px solid #D8CFBC', background: 'rgba(255,251,244,0.9)', color: '#565449' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ background: '#11120D' }}>
              <Scale className="w-3 h-3" style={{ color: '#D8CFBC' }} />
            </div>
            <span>Proof Vault · High-Assurance Electronic Evidence &amp; Provenance Platform</span>
          </div>
          <div className="text-[11px] flex items-center gap-2">
            <span>Polygon Amoy Network</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#565449' }}></span>
            <span>Active Consensus</span>
          </div>
        </div>
      </footer>

      {/* ── Connect Wallet Modal ─────────────────────────────────── */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ background: 'rgba(17,18,13,0.4)' }}
        >
          <div
            className="max-w-lg w-full rounded-3xl p-6 sm:p-8 relative space-y-5 animate-scale-in"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #D8CFBC',
              boxShadow: '0 24px 60px rgba(17,18,13,0.18)',
            }}
          >
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl transition-all cursor-pointer hover:bg-stone-100"
              style={{ color: '#565449' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 pr-8">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center p-1.5 shrink-0"
                style={{ background: '#11120D' }}
              >
                <img src="/proofvault-logo.png" alt="Proof Vault" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: '#565449' }}>
                  <Shield className="w-3 h-3" /> Web3 Sovereign Auth · Polygon Amoy
                </div>
                <h2 className="font-serif-judicial text-xl font-bold tracking-tight" style={{ color: '#11120D' }}>
                  Connect Sovereign Wallet
                </h2>
              </div>
            </div>

            <ConnectWallet onSuccess={() => { setIsLoginOpen(false); navigate('/dossiers'); }} />

            <div className="text-center pt-2 border-t border-stone-200">
              <Link
                to="/choose-crypto-wallet-login"
                onClick={() => setIsLoginOpen(false)}
                className="text-xs font-mono font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Open dedicated multi-wallet selector page →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
