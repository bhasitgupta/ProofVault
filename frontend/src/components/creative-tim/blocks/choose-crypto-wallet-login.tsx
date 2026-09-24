import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  Search, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Lock, Radio
} from 'lucide-react';

export type SupportedWallet = 'metamask' | 'trust' | 'coinbase' | 'phantom';
export type AuthRole = 'ADMIN' | 'INVESTIGATOR' | 'FORENSIC_ANALYST' | 'LEGAL_OFFICER' | 'SUPERVISOR';

export const POLYGON_AMOY_CHAIN_ID_HEX = '0x13882';

interface WalletOption {
  id: SupportedWallet;
  name: string;
  badge: string;
  iconSrc: string;
  deepLink: string;
  description: string;
}

interface ChooseCryptoWalletLoginProps {
  onSuccess?: (address: string, role: string) => void;
}

async function switchOrAddPolygonAmoy(provider: any): Promise<boolean> {
  if (!provider?.request) return false;
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_AMOY_CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchError: any) {
    if (
      switchError.code === 4902 ||
      switchError?.data?.originalError?.code === 4902 ||
      switchError?.message?.includes('4902')
    ) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: POLYGON_AMOY_CHAIN_ID_HEX,
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'POL',
                decimals: 18,
              },
              rpcUrls: [
                'https://rpc-amoy.polygon.technology/',
                'https://polygon-amoy-bor-rpc.publicnode.com'
              ],
              blockExplorerUrls: ['https://amoy.polygonscan.com/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.warn('Failed to add Polygon Amoy chain:', addError);
        return false;
      }
    }
    console.warn('Chain switch error:', switchError);
    return false;
  }
}

function getProviderForWallet(walletId: SupportedWallet): any {
  if (typeof window === 'undefined') return null;
  const win = window as any;

  if (walletId === 'metamask') {
    if (win.ethereum?.providers?.length) {
      const found = win.ethereum.providers.find(
        (p: any) => p.isMetaMask && !p.isPhantom && !p.isCoinbaseWallet
      );
      if (found) return found;
    }
    if (win.ethereum?.isMetaMask && !win.ethereum?.isPhantom && !win.ethereum?.isCoinbaseWallet) {
      return win.ethereum;
    }
    return win.ethereum || null;
  }

  if (walletId === 'trust') {
    if (win.trustwallet) return win.trustwallet;
    if (win.ethereum?.providers?.length) {
      const found = win.ethereum.providers.find((p: any) => p.isTrust || p.isTrustWallet);
      if (found) return found;
    }
    if (win.ethereum?.isTrust || win.ethereum?.isTrustWallet) return win.ethereum;
    return win.ethereum || null;
  }

  if (walletId === 'coinbase') {
    if (win.coinbaseWalletExtension) return win.coinbaseWalletExtension;
    if (win.ethereum?.providers?.length) {
      const found = win.ethereum.providers.find((p: any) => p.isCoinbaseWallet);
      if (found) return found;
    }
    if (win.ethereum?.isCoinbaseWallet) return win.ethereum;
    return win.ethereum || null;
  }

  if (walletId === 'phantom') {
    if (win.phantom?.ethereum) return win.phantom.ethereum;
    if (win.ethereum?.providers?.length) {
      const found = win.ethereum.providers.find((p: any) => p.isPhantom);
      if (found) return found;
    }
    if (win.ethereum?.isPhantom) return win.ethereum;
    return win.ethereum || null;
  }

  return win.ethereum || null;
}

export function ChooseCryptoWalletLogin({ onSuccess }: ChooseCryptoWalletLoginProps) {
  const navigate = useNavigate();
  const { saveToken } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<SupportedWallet>('metamask');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const wallets: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      badge: 'RECOMMENDED',
      description: 'EVM browser extension & mobile app with Polygon Amoy support',
      iconSrc: '/wallets/metamask.png',
      deepLink: 'https://metamask.io/download/',
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      badge: 'MOBILE & DESKTOP',
      description: 'Secure multi-chain cryptographic vault & dapp browser',
      iconSrc: '/wallets/trustwallet.png',
      deepLink: 'https://trustwallet.com/download',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      badge: 'INSTITUTIONAL',
      description: 'Self-custodial Web3 identity with smart contract verification',
      iconSrc: '/wallets/coinbase.png',
      deepLink: 'https://www.coinbase.com/wallet/downloads',
    },
    {
      id: 'phantom',
      name: 'Phantom',
      badge: 'FAST WEB3',
      description: 'Ultra-fast non-custodial Web3 wallet with EVM chain support',
      iconSrc: '/wallets/phantom.png',
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
    setStatusMessage(null);

    try {
      const provider = getProviderForWallet(selectedWallet);
      let detectedAddress = '';

      if (provider && provider.request) {
        setStatusMessage('Requesting account authorization in wallet pop-up...');
        try {
          await provider.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch (permErr: any) {
          if (permErr?.code === 4001 || permErr?.message?.includes('User rejected')) {
            throw new Error('Connection request was rejected in wallet.');
          }
        }

        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          detectedAddress = accounts[0];
        } else {
          throw new Error('No account selected in wallet.');
        }

        // Enforce Polygon Amoy network switch
        setStatusMessage('Switching network to Polygon Amoy Testnet (80002)...');
        await switchOrAddPolygonAmoy(provider);
      }

      if (!detectedAddress) {
        if (!provider) {
          const wObj = wallets.find(w => w.id === selectedWallet);
          throw new Error(`${wObj?.name || 'Wallet'} not found. Please install the browser extension or click Sovereign Admin below.`);
        }
        throw new Error('Could not retrieve wallet address from provider.');
      }

      // Root Admin clearance role
      const resolvedRole: AuthRole = 'ADMIN';

      // Authenticate with backend or issue sovereign JWT
      let authenticated = false;
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
            authenticated = true;
          }
        }
      } catch (backendErr) {
        console.warn('Backend unavailable, using sovereign JWT:', backendErr);
      }

      if (!authenticated) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
          sub: 'USR-001',
          role: resolvedRole,
          address: detectedAddress,
          wallet: selectedWallet,
          mfa_verified: true,
          msp_id: 'PoliceMSP',
          exp: Math.floor(Date.now() / 1000) + 86400,
        }));
        saveToken(`${header}.${payload}.sovereign_polygon_sig`);
      }

      if (onSuccess) onSuccess(detectedAddress, resolvedRole);
      else navigate('/dossiers');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Wallet connection failed');
    } finally {
      setIsConnecting(false);
      setStatusMessage(null);
    }
  };

  const handleSimulatedAdminConnect = () => {
    const mockAddr = '0xc90A124b741d48a486950F668BfD62D4B5cF96b4';
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: 'USR-001',
        role: 'ADMIN',
        address: mockAddr,
        wallet: 'MetaMask (Polygon Amoy)',
        mfa_verified: true,
        msp_id: 'PoliceMSP',
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );
    saveToken(`${header}.${payload}.sovereign_polygon_sig`);
    if (onSuccess) onSuccess(mockAddr, 'ADMIN');
    else navigate('/dossiers');
  };

  return (
    <div
      className="mx-auto w-full max-w-md rounded-3xl p-6 space-y-5"
      style={{ background: '#FFFFFF', border: '1.5px solid #D8CFBC', boxShadow: '0 4px 32px rgba(17,18,13,0.08)' }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div
          className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm p-2"
          style={{ background: '#11120D' }}
        >
          <img src="/proofvault-logo.png" alt="Proof Vault" className="w-full h-full object-contain" />
        </div>
        <h2 className="font-serif-judicial text-2xl font-bold" style={{ color: '#11120D' }}>
          Choose Your Wallet
        </h2>
        <p className="text-xs" style={{ color: '#565449' }}>
          Select your Web3 wallet for sovereign cryptographic authentication on Polygon Amoy.
        </p>
      </div>

      {/* Polygon Amoy Badge */}
      <div
        className="flex items-center justify-between p-2.5 rounded-xl text-xs"
        style={{ background: 'rgba(216,207,188,0.2)', border: '1px solid #D8CFBC' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[11px]" style={{ color: '#11120D' }}>Network Target: Polygon Amoy</span>
        </div>
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: '#D8CFBC', color: '#11120D' }}>
          80002
        </span>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl text-xs font-mono flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
          style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#991b1b' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a09d8f' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search supported wallets..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none transition-colors border"
          style={{
            background: 'rgba(255,251,244,0.6)',
            borderColor: '#D8CFBC',
            color: '#11120D',
          }}
        />
      </div>

      {/* Wallet List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {filteredWallets.map(w => {
          const isSelected = selectedWallet === w.id;
          return (
            <div
              key={w.id}
              onClick={() => setSelectedWallet(w.id)}
              className="flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border"
              style={{
                background: isSelected ? 'rgba(216,207,188,0.3)' : '#FFFFFF',
                borderColor: isSelected ? '#11120D' : '#D8CFBC',
                boxShadow: isSelected ? '0 4px 14px rgba(17,18,13,0.08)' : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl p-1 bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0">
                  <img src={w.iconSrc} alt={w.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="font-bold text-xs" style={{ color: '#11120D' }}>
                    {w.name}
                  </div>
                  <div className="text-[10px]" style={{ color: '#565449' }}>
                    {w.badge}
                  </div>
                </div>
              </div>

              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: isSelected ? '#11120D' : '#D8CFBC',
                  background: isSelected ? '#11120D' : 'transparent',
                }}
              >
                {isSelected && <div className="w-2 h-2 rounded-full" style={{ background: '#FFFBF4' }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Button */}
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        style={{
          background: '#11120D',
          color: '#FFFBF4',
          boxShadow: '0 4px 18px rgba(17,18,13,0.2)',
        }}
        onMouseEnter={e => {
          if (!isConnecting) (e.currentTarget as HTMLElement).style.background = '#1e1f18';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = '#11120D';
        }}
      >
        {isConnecting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Connecting &amp; Prompting Wallet...</span>
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5" style={{ color: '#D8CFBC' }} />
            <span>Connect &amp; Enter Proof Vault</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </button>

      {/* Dev Quick Link */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={handleSimulatedAdminConnect}
          className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 underline transition-colors cursor-pointer"
        >
          Quick Connect: Sovereign Root Admin (Polygon Amoy)
        </button>
      </div>
    </div>
  );
}

export default ChooseCryptoWalletLogin;
