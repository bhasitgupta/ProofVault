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
import { ThreeAnimation } from './components/ThreeAnimation';
import { LenisProvider } from './components/LenisProvider';

const NavigationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dossiers', label: 'Dossiers', icon: Folder, active: location.pathname === '/dossiers' },
    { to: '/documents', label: 'Evidence Vault', icon: FileText, active: location.pathname.startsWith('/documents') },
    { to: '/ask', label: 'Judicial AI', icon: HelpCircle, active: location.pathname === '/ask' },
    { to: '/upload', label: 'Ingest Evidence', icon: Upload, active: location.pathname === '/upload', highlight: true },
    { to: '/incidents', label: 'Chain of Custody', icon: ShieldAlert, active: location.pathname === '/incidents' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ambient text-slate-900 relative selection:bg-indigo-500/10 selection:text-indigo-900">
      {/* 3D Evidentiary Lattice Animation */}
      <ThreeAnimation />

      {/* Floating Modern Glassmorphic Header */}
      <header className="sticky top-3 z-40 max-w-7xl mx-auto px-4 sm:px-6 w-full pointer-events-none">
        <div className="glass-nav-obsidian rounded-2xl px-5 h-18 flex items-center justify-between shadow-2xl pointer-events-auto transition-all">
          
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/dossiers" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform overflow-hidden p-1 border border-indigo-400/40 ring-1 ring-white/10">
                <img src="/logo.png" alt="Proof Vault" className="w-full h-full object-contain filter drop-shadow(0 2px 8px rgba(99,102,241,0.6))" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-judicial font-black tracking-wide text-white text-lg">
                    Proof Vault
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-950/80 text-cyan-300 border border-cyan-500/30 shadow-xs">
                    EVM 80002
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-wide block -mt-0.5">
                  Secure Evidence • Stronger Justice
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all duration-150 ${
                      item.active
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 font-bold border border-indigo-400/30'
                        : item.highlight
                        ? 'text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 shadow-xs'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-500/30'
                      : 'text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Network Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>POLYGON AMOY ANCHORED</span>
            </div>

            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="text-right font-mono text-xs">
                  <div className="text-white font-bold text-xs">{user.username}</div>
                  <div className="text-[10px] text-cyan-400 font-extrabold uppercase mt-0.5 tracking-wider">{user.role}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-rose-950/50 border border-transparent hover:border-rose-800/40 rounded-xl text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('sdms_token');
  if (!token) {
    return <Navigate to="/login" replace />;
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
          <Route path="/mfa" element={<Navigate to="/dossiers" replace />} />
          <Route path="/dossiers" element={<ProtectedRoute><CaseWorkspace /></ProtectedRoute>} />
          <Route path="/ask" element={<ProtectedRoute><AskPage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          <Route path="/documents/:docId" element={<ProtectedRoute><DocumentDetailPage /></ProtectedRoute>} />
          <Route path="/custody/:caseId" element={<ProtectedRoute><CustodyTimelinePage /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LenisProvider>
  );
};

export default App;
