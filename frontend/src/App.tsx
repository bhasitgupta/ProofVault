import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Folder, Upload, HelpCircle, ShieldAlert, LogOut, FileText, Lock, Radio, Activity, Scale, Award, Layers } from 'lucide-react';
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
    { name: 'Ingest Evidence', url: '/upload', icon: Upload, highlight: true },
    { name: 'Chain of Custody', url: '/incidents', icon: ShieldAlert },
    ...(user?.role === 'ADMIN' ? [{ name: 'Admin', url: '/admin', icon: Lock }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ambient text-slate-900 relative selection:bg-indigo-500/10 selection:text-indigo-900">
      {/* Floating Modern Glassmorphic Header with Tubelight Navigation */}
      <header className="sticky top-3 z-40 max-w-7xl mx-auto px-4 sm:px-6 w-full pointer-events-none">
        <div className="glass-nav-obsidian rounded-2xl px-5 h-18 flex items-center justify-between shadow-lg pointer-events-auto transition-all gap-4">
          
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <Link to="/dossiers" className="flex items-center gap-3 group shrink-0 whitespace-nowrap">
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-md shadow-indigo-900/20 group-hover:scale-105 transition-transform p-2 border border-amber-400/30 shrink-0">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              <div className="shrink-0 whitespace-nowrap">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="font-serif-judicial font-black tracking-wide text-stone-900 text-lg whitespace-nowrap">
                    Proof Vault
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-xs whitespace-nowrap">
                    EVM 80002
                  </span>
                </div>
                <span className="text-[10px] text-stone-600 font-mono tracking-wide block -mt-0.5 font-semibold whitespace-nowrap">
                  Secure Evidence • Stronger Justice
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center shrink-0">
              <TubelightNavBar items={navItems} />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
            {/* Network Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-mono text-emerald-900 font-bold shadow-xs whitespace-nowrap shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>POLYGON AMOY ANCHORED</span>
            </div>

            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-stone-300 shrink-0 whitespace-nowrap">
                <div className="text-right font-mono text-xs whitespace-nowrap shrink-0">
                  <div className="text-stone-900 font-bold text-xs whitespace-nowrap">{user.username}</div>
                  <div className="text-[10px] text-indigo-700 font-extrabold uppercase mt-0.5 tracking-wider whitespace-nowrap">{user.role}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl text-stone-700 hover:text-rose-700 transition-all cursor-pointer shrink-0"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pb-24 lg:pb-8">
        {children}
      </main>

      {/* Mobile Floating Tubelight Navigation Bar */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <TubelightNavBar items={navItems} />
      </div>

      {/* Refined Modern Footer */}
      <footer className="border-t border-slate-200/80 py-4 bg-white/70 backdrop-blur-xl relative z-10 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Proof Vault" className="w-4 h-4 object-contain" />
            <span>Proof Vault • Electronic Evidence Management • BSA §63 & IEA §65B Admissible</span>
          </div>
          <div className="text-[11px] flex items-center gap-2">
            <span>Polygon Amoy Network</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Deterministic EVM Storage</span>
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
