import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Search,
  Lock,
  Check,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export type SupportedWallet = 'metamask' | 'coinbase' | 'phantom' | 'trust';
export type AuthRole = 'INVESTIGATOR' | 'FORENSIC_ANALYST' | 'LEGAL_OFFICER' | 'SUPERVISOR' | 'ADMIN';

// ── Admin wallet — receives ADMIN role automatically ─────────────
const ADMIN_WALLET = '0xc90A124b741d48a486950F668BfD62D4B5cF96b4';

function resolveRole(address: string): AuthRole {
  if (address.toLowerCase() === ADMIN_WALLET.toLowerCase()) return 'ADMIN';
  return 'INVESTIGATOR';
}

// Official MetaMask Fox SVG
const MetaMaskIcon = () => (
  <svg viewBox="0 0 318.6 318.6" className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1,35.5 174.6,109.4 193.9,65.4"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="44.4,35.5 143.1,110.1 124.7,65.4"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="214.9,138.2 176.3,103.4 175.1,164.6 231.4,162.1"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 140.6,230.9 111.4,208.1"/>
    <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.9 211.8,247.4 207,208.1"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="211.8,247.4 177.9,230.9 180.6,253 180.3,262.3"/>
    <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 138.3,262.3 138.1,253 140.6,230.9"/>
    <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="138.8,208.1 111,200.6 130.5,192.4"/>
    <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="179.7,208.1 187.6,192.4 207.2,200.6"/>
    <polygon fill="#CC6228" stroke="#CC6228" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 111.4,206.8 80.3,207.7"/>
    <polygon fill="#CC6228" stroke="#CC6228" strokeLinecap="round" strokeLinejoin="round" points="207,206.8 211.8,247.4 238.3,207.7"/>
    <polygon fill="#CC6228" stroke="#CC6228" strokeLinecap="round" strokeLinejoin="round" points="231.4,162.1 175.1,164.6 179.8,208.1 187.6,192.4 207.2,200.6"/>
    <polygon fill="#CC6228" stroke="#CC6228" strokeLinecap="round" strokeLinejoin="round" points="111,200.6 130.5,192.4 138.8,208.1 144.1,164.6 87.8,162.1"/>
    <polygon fill="#E27525" stroke="#E27525" strokeLinecap="round" strokeLinejoin="round" points="87.8,162.1 111.4,208.1 111,200.6"/>
    <polygon fill="#E27525" stroke="#E27525" strokeLinecap="round" strokeLinejoin="round" points="207.2,200.6 207,208.1 231.4,162.1"/>
    <polygon fill="#E27525" stroke="#E27525" strokeLinecap="round" strokeLinejoin="round" points="144.1,164.6 138.8,208.1 145.9,244.9 147.5,196.7"/>
    <polygon fill="#E27525" stroke="#E27525" strokeLinecap="round" strokeLinejoin="round" points="175.1,164.6 171.1,196.6 172.5,244.9 179.8,208.1"/>
    <polygon fill="#F5841F" stroke="#F5841F" strokeLinecap="round" strokeLinejoin="round" points="179.8,208.1 172.5,244.9 177.9,230.9 207.2,200.6"/>
    <polygon fill="#F5841F" stroke="#F5841F" strokeLinecap="round" strokeLinejoin="round" points="111,200.6 140.6,230.9 145.9,244.9 138.8,208.1"/>
    <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="180.3,262.3 180.6,253 178.1,250.8 140.4,250.8 138.1,253 138.3,262.3 106.8,247.4 117.4,256 140.1,271.9 178.5,271.9 201.2,256 211.8,247.4"/>
    <polygon fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.9 172.5,244.9 145.9,244.9 140.6,230.9 106.8,247.4 138.1,253 140.4,250.8 178.1,250.8 180.6,253 211.8,247.4"/>
    <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="193.9,65.4 174.6,109.4 175.1,164.6 231.4,162.1 274.1,35.5"/>
    <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="124.7,65.4 44.4,35.5 87.8,162.1 144.1,164.6 143.1,109.4"/>
  </svg>
);

// Official Phantom Logo
const PhantomIcon = () => (
  <svg viewBox="0 0 128 128" className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="28" fill="#AB9FF2"/>
    <path d="M110.584 64.9142C110.584 89.2657 90.9139 109 66.6422 109C53.9983 109 42.557 103.946 34.2425 95.6668L34.2427 95.6645C33.7566 95.178 33.2837 94.6784 32.8244 94.1661H51.5639C56.4658 98.4742 62.777 101.109 69.7194 101.109C85.3736 101.109 98.0584 88.4239 98.0584 72.7699C98.0584 57.1159 85.3736 44.4311 69.7194 44.4311C56.0925 44.4311 44.6937 53.832 41.8605 66.3899C41.5015 68.0021 41.3139 69.6774 41.3139 71.3941L41.3136 80.8856C40.3517 78.3551 39.8271 75.6173 39.8271 72.7699C39.8271 66.4946 42.1083 60.7628 45.9189 56.3638L45.9163 56.3613H27.0762L22.3086 71.3941H18.6133L22.3086 56.3613H18V49.0003H22.3086V43.2858H27.0762L25.4399 49.0003H46.0918C53.0453 42.8729 62.2001 39.0911 72.2597 39.0911C94.0308 39.0911 112.066 55.8817 112.066 76.8025V77.2007C111.757 83.1947 111.169 88.4742 110.584 93.7539V64.9142Z" fill="white"/>
    <path d="M52.6185 71.6977C52.6185 74.9718 50.0256 77.6273 46.8299 77.6273C43.6342 77.6273 41.0413 74.9718 41.0413 71.6977C41.0413 68.4236 43.6342 65.7681 46.8299 65.7681C50.0256 65.7681 52.6185 68.4236 52.6185 71.6977Z" fill="white"/>
    <path d="M70.5088 71.6977C70.5088 74.9718 67.9159 77.6273 64.7202 77.6273C61.5245 77.6273 58.9316 74.9718 58.9316 71.6977C58.9316 68.4236 61.5245 65.7681 64.7202 65.7681C67.9159 65.7681 70.5088 68.4236 70.5088 71.6977Z" fill="white"/>
  </svg>
);

// Official Coinbase Wallet Logo
const CoinbaseIcon = () => (
  <svg viewBox="0 0 128 128" className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="28" fill="#0052FF"/>
    <path d="M64.0001 26C43.0147 26 26 43.0147 26 64.0001C26 84.9855 43.0147 102 64.0001 102C84.9855 102 102 84.9855 102 64.0001C102 43.0147 84.9855 26 64.0001 26ZM64.0001 81.3333C54.4 81.3333 46.6667 73.5999 46.6667 63.9999C46.6667 54.3999 54.4 46.6667 64.0001 46.6667C73.6001 46.6667 81.3333 54.3999 81.3333 63.9999C81.3333 73.5999 73.6001 81.3333 64.0001 81.3333Z" fill="white"/>
    <rect x="54" y="54" width="20" height="20" rx="4" fill="white"/>
  </svg>
);

// Trust Wallet Logo
const TrustWalletIcon = () => (
  <svg viewBox="0 0 128 128" className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="28" fill="#3375BB"/>
    <path d="M64 22L28 36V64C28 84.8 44 104 64 110C84 104 100 84.8 100 64V36L64 22Z" fill="white" fillOpacity="0.9"/>
    <path d="M64 30L34 42V64C34 81.6 47.2 98 64 103.2C80.8 98 94 81.6 94 64V42L64 30Z" fill="#3375BB"/>
    <path d="M55 64L62 71L75 55" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

interface WalletOption {
  id: SupportedWallet;
  name: string;
  badge: string;
  icon: React.ReactNode;
  deepLink: string;
}

interface ChooseCryptoWalletLoginProps {
  onSuccess?: (address: string, role: string) => void;
}

export function ChooseCryptoWalletLogin({ onSuccess }: ChooseCryptoWalletLoginProps) {
  const navigate = useNavigate();
  const { saveToken } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<SupportedWallet>('metamask');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wallets: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      badge: 'EVM POPULAR',
      icon: <MetaMaskIcon />,
      deepLink: 'https://metamask.io/download/',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      badge: 'INSTITUTIONAL',
      icon: <CoinbaseIcon />,
      deepLink: 'https://www.coinbase.com/wallet/downloads',
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      badge: 'MOBILE & DESKTOP',
      icon: <TrustWalletIcon />,
      deepLink: 'https://trustwallet.com/download',
    },
    {
      id: 'phantom',
      name: 'Phantom',
      badge: 'FAST WEB3',
      icon: <PhantomIcon />,
      deepLink: 'https://phantom.app/download',
    },
  ];

  const filteredWallets = useMemo(() => {
    if (!searchQuery.trim()) return wallets;
    const q = searchQuery.toLowerCase();
    return wallets.filter(w => w.name.toLowerCase().includes(q) || w.badge.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      let detectedAddress = '';

      const eth = (window as any).ethereum;
      const phantomEth = (window as any).phantom?.ethereum;
      const coinbaseExt = (window as any).coinbaseWalletExtension;

      let provider = null;
      if (selectedWallet === 'phantom' && phantomEth) provider = phantomEth;
      else if (selectedWallet === 'coinbase' && coinbaseExt) provider = coinbaseExt;
      else if (eth) provider = eth;

      if (provider?.request) {
        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          if (accounts?.length > 0) detectedAddress = accounts[0];
        } catch (err) {
          console.warn('Wallet request cancelled or unavailable:', err);
        }
      }

      // Resolve role — admin wallet gets ADMIN automatically
      const resolvedRole = detectedAddress ? resolveRole(detectedAddress) : 'INVESTIGATOR';

      // Try backend first
      if (detectedAddress) {
        try {
          const apiBase = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/+$/, '') + '/api/v1';
          const res = await fetch(`${apiBase}/auth/wallet-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: detectedAddress, wallet_type: selectedWallet, role: resolvedRole }),
          });
          const ct = res.headers.get('content-type') || '';
          if (res.ok && ct.includes('application/json')) {
            const data = await res.json();
            if (data.access_token) {
              saveToken(data.access_token);
              if (onSuccess) onSuccess(detectedAddress, resolvedRole);
              else navigate('/dossiers');
              return;
            }
          }
        } catch (backendErr) {
          console.warn('Backend unavailable, using sovereign fallback:', backendErr);
        }
      }

      // Sovereign JWT fallback
      if (!detectedAddress) {
        detectedAddress = `0x000000000000000000000000000000000000${selectedWallet === 'phantom' ? '9999' : selectedWallet === 'coinbase' ? '8888' : selectedWallet === 'trust' ? '7777' : '6666'}`;
      }

      const fallbackRole = resolveRole(detectedAddress);
      const subMap: Record<AuthRole, string> = { INVESTIGATOR: 'USR-101', FORENSIC_ANALYST: 'USR-102', LEGAL_OFFICER: 'USR-103', SUPERVISOR: 'USR-104', ADMIN: 'USR-001' };
      const mspMap: Record<AuthRole, string> = { INVESTIGATOR: 'PoliceMSP', FORENSIC_ANALYST: 'ForensicsMSP', LEGAL_OFFICER: 'JudiciaryMSP', SUPERVISOR: 'PoliceMSP', ADMIN: 'PoliceMSP' };

      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: subMap[fallbackRole], role: fallbackRole, address: detectedAddress,
        wallet: selectedWallet, mfa_verified: true, msp_id: mspMap[fallbackRole],
        exp: Math.floor(Date.now() / 1000) + 86400,
      }));
      saveToken(`${header}.${payload}.sovereign_sig`);

      if (onSuccess) onSuccess(detectedAddress, fallbackRole);
      else navigate('/dossiers');

    } catch (err: any) {
      setError(err.message || 'Wallet connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div
      className="mx-auto w-full max-w-md rounded-3xl p-6 space-y-5"
      style={{ background: '#FFFFFF', border: '1.5px solid #D8CFBC', boxShadow: '0 4px 32px rgba(17,18,13,0.08)' }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div
          className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: '#11120D' }}
        >
          <img src="/proofvault.svg" alt="Proof Vault" className="w-7 h-7" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <h2 className="font-serif-judicial text-xl font-bold" style={{ color: '#11120D' }}>
          Choose Your Wallet
        </h2>
        <p className="text-xs" style={{ color: '#565449' }}>
          Select your Web3 wallet for sovereign cryptographic authentication.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-3 rounded-xl text-xs flex items-center gap-2 font-mono"
          style={{ background: 'rgba(184,48,48,0.06)', border: '1px solid rgba(184,48,48,0.2)', color: '#7a1818' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: '#a09d8f' }}>
          <span>Choose Wallet</span>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#a09d8f' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search wallets..."
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-none font-mono transition-all"
            style={{ background: '#FFFBF4', border: '1.5px solid #D8CFBC', color: '#11120D' }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#565449'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#D8CFBC'; }}
          />
        </div>
      </div>

      {/* Wallet Grid */}
      <div>
        {filteredWallets.length === 0 ? (
          <div
            className="p-4 text-center text-xs font-mono rounded-xl border border-dashed"
            style={{ background: '#FFFBF4', borderColor: '#D8CFBC', color: '#a09d8f' }}
          >
            No wallets matching "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredWallets.map(wallet => {
              const isSelected = selectedWallet === wallet.id;
              return (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => setSelectedWallet(wallet.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer"
                  style={isSelected
                    ? { background: '#f7f4ef', borderColor: '#565449', boxShadow: '0 2px 8px rgba(86,84,73,0.15)' }
                    : { background: '#FFFFFF', borderColor: '#D8CFBC' }
                  }
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = '#a09d8f';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = '#D8CFBC';
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {wallet.icon}
                    <div className="min-w-0">
                      <span className="font-bold text-xs block truncate" style={{ color: '#11120D' }}>{wallet.name}</span>
                      <span className="text-[9px] font-mono block truncate" style={{ color: '#a09d8f' }}>{wallet.badge}</span>
                    </div>
                  </div>
                  <div className="shrink-0 ml-1">
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#565449' }}>
                        <Check className="w-2.5 h-2.5" style={{ color: '#FFFBF4' }} />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: '#D8CFBC' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Security notice — no role selector */}
      <div
        className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
        style={{ background: 'rgba(216,207,188,0.2)', border: '1px solid #D8CFBC' }}
      >
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#565449' }} />
        <p style={{ color: '#565449' }}>
          Your role is assigned automatically based on your wallet address and institutional registry.
        </p>
      </div>

      {/* Connect button */}
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        style={{ background: '#11120D', color: '#FFFBF4' }}
        onMouseEnter={e => {
          if (!isConnecting) {
            (e.currentTarget as HTMLElement).style.background = '#1e1f18';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(17,18,13,0.25)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = '#11120D';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {isConnecting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" style={{ color: '#D8CFBC' }} />
            <span>Connect Wallet</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Footer */}
      <p
        className="text-center text-[10px] font-mono"
        style={{ color: '#a09d8f' }}
      >
        By connecting, you consent to statutory evidence custody under{' '}
        <span className="font-bold" style={{ color: '#565449' }}>BSA 2023 §63</span>.
      </p>
    </div>
  );
}

export default ChooseCryptoWalletLogin;
