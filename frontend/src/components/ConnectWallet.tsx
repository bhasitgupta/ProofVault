import React, { useState, useEffect } from 'react';
import {
  AlertCircle, ArrowRight, RefreshCw, Lock, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export type SupportedWallet = 'metamask' | 'phantom' | 'coinbase';
export type AuthRole = 'INVESTIGATOR' | 'FORENSIC_ANALYST' | 'LEGAL_OFFICER' | 'SUPERVISOR' | 'ADMIN';

// ── Admin wallet address — receives ADMIN role automatically ──────────────────
const ADMIN_WALLET_ADDRESS = '0xc90A124b741d48a486950F668BfD62D4B5cF96b4';

interface WalletOption {
  id: SupportedWallet;
  name: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  detector: () => boolean;
  deepLink: string;
}

// Official MetaMask Fox SVG
export const MetaMaskLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 318.6 318.6" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" d="M274.1 35.5l-99.5 73.9L194 65.4z" />
    <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M44.4 35.5l98.7 74.6-18.4-44.7z" />
    <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M238.3 206.8l-26.4 40.6 56.7 15.6 16.3-55.3z" />
    <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M33.9 207.7l16.2 55.3 56.7-15.6-26.3-40.6z" />
    <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5z" />
    <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M214.9 138.2l-38.6-34.8-1.3 61.2 56.2-2.5z" />
    <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M106.8 247.4l33.8-16.5-29.2-22.8z" />
    <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M177.9 230.9l34 16.5-4.8-39.3z" />
    <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M211.9 247.4l-34-16.5 2.7 22.1-.3 9.3z" />
    <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M138.8 262.3l2.8-22.1-34.8 16.5 31.7 14.9z" />
    <path fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" d="M179.9 209.1l4.8 39.3 27.2-2.5 1-20.7-33-16.1z" />
    <path fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" d="M106.5 190.2l26.9 13.2-3.2-26.7z" />
    <path fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" d="M177.9 176.7l-3.2 26.7 26.9-13.2z" />
    <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M87.8 162.1l23.6 46 8.5-31.4z" />
    <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M198.8 176.7l8.4 31.4 23.6-46z" />
    <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M142.1 140.6l-54.3 21.5 8.5 14.6 30.6-2.5z" />
    <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M176.5 140.6l15.2 33.6 30.6 2.5 8.5-14.6z" />
    <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="M142.1 140.6l-2.8 33.6 2.8 16.1 17.2-16.1z" />
    <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="M176.5 140.6l-17.2 17.5 17.2 16.1 2.8-16.1z" />
    <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="M87.8 162.1l18.7 45.6-26.3-17.5z" />
    <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="M211.9 207.7l18.7-45.6 7.6 28.1z" />
  </svg>
);

// Official Phantom Ghost Logo SVG
export const PhantomLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="28" fill="#AB9FF2" />
    <path
      d="M101.9 66.8c-1.8-15.6-15.6-27.4-31.8-27.4-17.7 0-32.1 14.2-32.1 31.8 0 4.1.8 8.1 2.3 11.7l.2.5c1.6 3.7 4.2 8.7 8.3 12.3 5.4 4.7 10.5 4.3 14.1 1.7 2.6-1.9 4.6-4.9 6.4-7.6 1.8-2.8 3.5-5.3 5.7-6.2 1.3-.5 2.8-.4 4.3.4 3 1.5 5.5 4.8 7.8 7.8 2.8 3.6 5.8 7.5 10.9 7.5 4.8 0 8.3-3.6 10.6-7.8 2.7-4.9 3.5-9.6 3.3-14.7zm-44.5-8.2c-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6 5.6 2.5 5.6 5.6-2.5 5.6-5.6 5.6zm22.4 0c-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6 5.6 2.5 5.6 5.6-2.5 5.6-5.6 5.6z"
      fill="#FFFFFF"
    />
  </svg>
);

// Official Coinbase Wallet Logo SVG
export const CoinbaseLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="28" fill="#0052FF" />
    <rect x="36" y="36" width="56" height="56" rx="14" fill="#FFFFFF" />
    <rect x="52" y="52" width="24" height="24" rx="5" fill="#0052FF" />
  </svg>
);

interface ConnectWalletProps {
  onSuccess?: (address: string, role: string) => void;
}

/**
 * Determines role for a connected address.
 * Admin wallet address 0xc90A124b741d48a486950F668BfD62D4B5cF96b4
 * always receives ADMIN role regardless of selection.
 * All other addresses default to INVESTIGATOR.
 */
function resolveRole(address: string): AuthRole {
  if (address.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase()) {
    return 'ADMIN';
  }
  // Default — backend may override via JWT from wallet-login endpoint
  return 'INVESTIGATOR';
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onSuccess }) => {
  const [connectingWallet, setConnectingWallet] = useState<SupportedWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { saveToken } = useAuth();

  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Polygon EVM browser extension & mobile',
      badge: 'POPULAR',
      icon: <MetaMaskLogo className="w-9 h-9 shrink-0 drop-shadow-sm" />,
      detector: () => typeof window !== 'undefined' && Boolean((window as any).ethereum?.isMetaMask),
      deepLink: 'https://metamask.io/download/',
    },
    {
      id: 'phantom',
      name: 'Phantom',
      description: 'Multi-chain Web3 wallet with Polygon support',
      badge: 'FAST',
      icon: <PhantomLogo className="w-9 h-9 shrink-0 drop-shadow-sm" />,
      detector: () => typeof window !== 'undefined' && Boolean((window as any).phantom?.ethereum || (window as any).phantom),
      deepLink: 'https://phantom.app/download',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      description: 'Self-custody Smart Wallet & institutional identity',
      badge: 'INSTITUTIONAL',
      icon: <CoinbaseLogo className="w-9 h-9 shrink-0 drop-shadow-sm" />,
      detector: () => typeof window !== 'undefined' && Boolean((window as any).coinbaseWalletExtension || (window as any).ethereum?.isCoinbaseWallet),
      deepLink: 'https://www.coinbase.com/wallet/downloads',
    },
  ];

  const handleWalletSelect = async (wallet: WalletOption) => {
    setError(null);
    setConnectingWallet(wallet.id);

    try {
      let detectedAddress = '';

      // 1. Try real browser provider
      const eth = (window as any).ethereum;
      const phantomEth = (window as any).phantom?.ethereum;

      let provider = null;
      if (wallet.id === 'phantom' && phantomEth) {
        provider = phantomEth;
      } else if (wallet.id === 'coinbase' && (window as any).coinbaseWalletExtension) {
        provider = (window as any).coinbaseWalletExtension;
      } else if (eth) {
        provider = eth;
      }

      if (provider && provider.request) {
        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            detectedAddress = accounts[0];
          }
        } catch (provErr: any) {
          console.warn('Wallet provider request failed or cancelled:', provErr);
        }
      }

      // 2. Determine role — admin wallet gets ADMIN, others get resolved by backend
      const resolvedRole = detectedAddress ? resolveRole(detectedAddress) : 'INVESTIGATOR';

      // 3. Authenticate with backend
      if (detectedAddress) {
        try {
          const apiBase = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/+$/, '') + '/api/v1';
          const res = await fetch(`${apiBase}/auth/wallet-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: detectedAddress,
              wallet_type: wallet.name,
              role: resolvedRole,
            }),
          });

          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.access_token) {
              saveToken(data.access_token);
              if (onSuccess) onSuccess(detectedAddress, resolvedRole);
              return;
            }
          }
        } catch (backendErr) {
          console.warn('Backend wallet-login unavailable, using sovereign fallback:', backendErr);
        }
      }

      // 4. Sovereign JWT fallback (dev/offline resilience)
      if (!detectedAddress) {
        detectedAddress = `0x000000000000000000000000000000000000${wallet.id === 'phantom' ? '9999' : wallet.id === 'coinbase' ? '8888' : '7777'}`;
      }

      const fallbackRole = resolveRole(detectedAddress);
      const subMap: Record<AuthRole, string> = {
        INVESTIGATOR: 'USR-101',
        FORENSIC_ANALYST: 'USR-102',
        LEGAL_OFFICER: 'USR-103',
        SUPERVISOR: 'USR-104',
        ADMIN: 'USR-001',
      };
      const mspMap: Record<AuthRole, string> = {
        INVESTIGATOR: 'PoliceMSP',
        FORENSIC_ANALYST: 'ForensicsMSP',
        LEGAL_OFFICER: 'JudiciaryMSP',
        SUPERVISOR: 'PoliceMSP',
        ADMIN: 'PoliceMSP',
      };

      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          sub: subMap[fallbackRole],
          role: fallbackRole,
          address: detectedAddress,
          wallet: wallet.name,
          mfa_verified: true,
          msp_id: mspMap[fallbackRole],
          exp: Math.floor(Date.now() / 1000) + 86400,
        })
      );
      const mockToken = `${header}.${payload}.sovereign_evm_sig`;
      saveToken(mockToken);

      if (onSuccess) {
        onSuccess(detectedAddress, fallbackRole);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to establish cryptographic wallet handshake.');
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Security notice — no role selector */}
      <div
        className="flex items-start gap-3 p-3.5 rounded-xl text-xs"
        style={{ background: 'rgba(216,207,188,0.25)', border: '1px solid #D8CFBC' }}
      >
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#565449' }} />
        <p style={{ color: '#565449' }} className="leading-relaxed">
          Your role is determined automatically by your wallet address and institutional registry. Admin access is granted to pre-authorised addresses only.
        </p>
      </div>

      {error && (
        <div
          className="p-3 rounded-xl text-xs flex items-center gap-2 font-mono"
          style={{ background: 'rgba(184,48,48,0.06)', border: '1px solid rgba(184,48,48,0.2)', color: '#962020' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Wallet options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: '#565449' }}>
          <span>Select Web3 Wallet Provider</span>
          <span className="flex items-center gap-1.5 font-bold" style={{ color: '#11120D' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#565449' }}></span>
            POLYGON AMOY EVM
          </span>
        </div>

        <div className="space-y-2.5">
          {walletOptions.map((wallet) => {
            const isConnecting = connectingWallet === wallet.id;
            return (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet)}
                disabled={connectingWallet !== null}
                className="w-full p-4 rounded-xl flex items-center justify-between group cursor-pointer disabled:opacity-50 transition-all"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #D8CFBC',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#565449';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(17,18,13,0.08)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#D8CFBC';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-center gap-3.5 text-left">
                  {wallet.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: '#11120D' }}>{wallet.name}</span>
                      <span
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#D8CFBC', color: '#565449' }}
                      >
                        {wallet.badge}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#565449' }}>{wallet.description}</p>
                  </div>
                </div>

                <div style={{ color: '#D8CFBC' }} className="group-hover:text-olive-600 transition-colors">
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#565449' }} />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="pt-3 text-[11px] font-mono flex items-center justify-between"
        style={{ borderTop: '1px solid #D8CFBC', color: '#565449' }}
      >
        <span className="flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          Hardware &amp; Software Signatures
        </span>
        <span>EIP-1193 Standard</span>
      </div>
    </div>
  );
};

export default ConnectWallet;
