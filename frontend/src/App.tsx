import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Folder, Upload, HelpCircle, ShieldAlert, LogOut, FileText, Lock, Radio, Activity, Cpu } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
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
import { ThreeCanvas } from './components/ThreeCanvas';
import { LenisProvider } from './components/LenisProvider';

const NavigationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dossiers', icon: Folder, active: location.pathname === '/' },
    { to: '/documents', label: 'Evidence Vault', icon: FileText, active: location.pathname.startsWith('/documents') },
    { to: '/ask', label: 'Verifiable AI', icon: HelpCircle, active: location.pathname === '/ask' },
    { to: '/upload', label: 'Ingest Anchor', icon: Upload, active: location.pathname === '/upload', highlight: true },
    { to: '/incidents', label: 'Chain Telemetry', icon: ShieldAlert, active: location.pathname === '/incidents' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-obsidian text-slate-100 relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Interactive 3D Canvas Background */}
      <ThreeCanvas />

      {/* Floating Island Header */}
      <header className="sticky top-3 z-40 max-w-7xl mx-auto px-4 sm:px-6 w-full pointer-events-none">
        <div className="glass-obsidian rounded-2xl border border-white/10 px-5 h-16 flex items-center justify-between shadow-2xl shadow-black/80 backdrop-blur-2xl pointer-events-auto transition-all">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/40 flex items-center justify-center group-hover:border-indigo-400 transition-all shadow-lg shadow-indigo-500/10">
                <Shield className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-tight text-white text-sm bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                    NYAYA-VAULT
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    MHA SIH26190
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                  Judicial Provenance Trust Layer
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
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                      item.active
                        ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/15'
                        : item.highlight
                        ? 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 border border-emerald-500/25'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Live Telemetry Pills */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>11ms</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>POLYGON ANCHOR</span>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
                <div className="text-right font-mono text-xs">
                  <div className="text-white font-semibold text-xs leading-none">{user.username}</div>
                  <div className="text-[9px] text-indigo-400 font-bold uppercase mt-0.5 tracking-wider">{user.role}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2.5 hover:bg-rose-950/50 border border-transparent hover:border-rose-500/30 rounded-xl text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
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

      {/* Modern Status Footer */}
      <footer className="border-t border-white/5 py-4 bg-obsidian/90 backdrop-blur-xl relative z-10 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>NYAYA-VAULT • Zero-Trust Electronic Evidence Trust Architecture • BSA §63 & IEA §65B Certified</span>
          </div>
          <div className="text-slate-500 text-[11px] flex items-center gap-2">
            <span>Engineered by Bhasit Gupta</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>POLYGON AMOY READY</span>
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
          <Route path="/login" element={<Login />} />
          <Route path="/mfa" element={<MfaChallenge />} />
          <Route path="/" element={<ProtectedRoute><CaseWorkspace /></ProtectedRoute>} />
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
