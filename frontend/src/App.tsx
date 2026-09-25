import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Scale, Folder, Upload, HelpCircle, ShieldAlert, LogOut, FileText, Lock } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/Landing';
import { Login } from './pages/Login';
import { MfaChallenge } from './pages/MfaChallenge';
import { CaseWorkspace } from './pages/CaseWorkspace';
import { DocumentsPage } from './pages/Documents';
import { UploadPage } from './pages/Upload';
import { AskPage } from './pages/Ask';
import { DocumentDetailPage } from './pages/DocumentDetail';
import { CustodyTimelinePage } from './pages/CustodyTimeline';
import { AuditLogPage } from './pages/AuditLog';
import { AdminPage } from './pages/Admin';
import { ChooseCryptoWalletLoginPage } from './pages/ChooseCryptoWalletLoginPage';
import { LenisProvider } from './components/LenisProvider';
import { TubelightNavBar } from './components/ui/tubelight-navbar';

const NavigationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dossiers', url: '/dossiers', icon: Folder },
    { name: 'Evidence Vault', url: '/documents', icon: FileText },
    { name: 'Judicial AI', url: '/ask', icon: HelpCircle },
    { name: 'Ingest Evidence', url: '/upload', icon: Upload },
    { name: 'Chain of Custody', url: '/incidents', icon: ShieldAlert },
    ...(user?.role === 'ADMIN' ? [{ name: 'Admin', url: '/admin', icon: Lock }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFBF4' }}>
      {/* Floating Header */}
      <header className="sticky top-3 z-40 max-w-[98%] 2xl:max-w-[1720px] mx-auto px-1 sm:px-3 w-full pointer-events-none">
        <div
          className="px-3 sm:px-6 h-[64px] flex items-center justify-between pointer-events-auto gap-2 lg:gap-6 overflow-visible w-full"
          style={{
            background: 'rgba(255,251,244,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(216,207,188,0.6)',
            borderRadius: '1rem',
            boxShadow: '0 4px 24px rgba(17,18,13,0.07), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          {/* Brand + Nav */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 flex-1">
            <Link to="/dossiers" className="flex items-center gap-2.5 group shrink-0">
              <div
                className="h-10 px-2 rounded-xl flex items-center justify-center shadow-xs shrink-0 transition-transform group-hover:scale-105 border bg-white"
                style={{ borderColor: '#D8CFBC' }}
              >
                <img src="/proofvault-logo.png" alt="Proof Vault" className="h-7 w-auto object-contain" />
              </div>
              <div className="hidden xl:block shrink-0">
                <div className="font-serif-judicial font-black tracking-wide text-sm leading-none" style={{ color: '#11120D' }}>
                  Proof Vault
                </div>
                <div className="text-[9px] font-mono font-semibold tracking-wide mt-0.5" style={{ color: '#565449' }}>
                  Secure Evidence · Stronger Justice
                </div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center">
              <TubelightNavBar items={navItems} />
            </div>
          </div>

          {/* Right side: Wallet Address (short form) + Role + Logout */}
          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white shadow-xs"
                style={{ borderColor: '#D8CFBC' }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold font-mono text-stone-900 tracking-tight">
                    {user.address
                      ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
                      : user.username?.startsWith('0x') && user.username.length > 10
                      ? `${user.username.slice(0, 6)}...${user.username.slice(-4)}`
                      : user.username}
                  </span>
                </div>
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ background: '#11120D', color: '#FFFBF4' }}
                >
                  {user.role}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border transition-all cursor-pointer shrink-0 bg-white hover:bg-stone-100 shadow-xs"
              style={{ borderColor: '#D8CFBC', color: '#565449' }}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pb-24 lg:pb-8">
        {children}
      </main>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <TubelightNavBar items={navItems} />
      </div>

      {/* Footer */}
      <footer
        className="py-4 relative z-10 text-xs font-mono"
        style={{ borderTop: '1px solid #D8CFBC', background: 'rgba(255,251,244,0.9)', color: '#565449' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
              style={{ background: '#11120D' }}
            >
              <Scale className="w-2.5 h-2.5" style={{ color: '#D8CFBC' }} />
            </div>
            <span>Proof Vault · Electronic Evidence Management · BSA §63 &amp; IEA §65B Admissible</span>
          </div>
          <div className="text-[11px] flex items-center gap-2">
            <span>Blockchain EVM</span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#565449' }}></span>
            <span>Deterministic Evidence Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ children, requiredRole }) => {
  const token = localStorage.getItem('sdms_token');
  const { user } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/dossiers" replace />;
  }
  return <NavigationLayout>{children}</NavigationLayout>;
};

export const App: React.FC = () => {
  return (
    <LenisProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/choose-crypto-wallet-login" element={<ChooseCryptoWalletLoginPage />} />
          <Route path="/mfa" element={<Navigate to="/dossiers" replace />} />
          <Route path="/dossiers" element={<ProtectedRoute><CaseWorkspace /></ProtectedRoute>} />
          <Route path="/ask" element={<ProtectedRoute><AskPage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/:docId" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
          <Route path="/custody/:caseId" element={<ProtectedRoute><CustodyTimelinePage /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LenisProvider>
  );
};

export default App;

// Root application router defining protected routes and layout shell
