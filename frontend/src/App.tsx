import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Folder, Upload, HelpCircle, ShieldAlert, LogOut, FileText, CheckCircle2, Lock } from 'lucide-react';
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

const NavigationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Cases', icon: Folder, active: location.pathname === '/' },
    { to: '/documents', label: 'Evidence Files', icon: FileText, active: location.pathname.startsWith('/documents') },
    { to: '/ask', label: 'Intelligence Q&A', icon: HelpCircle, active: location.pathname === '/ask' },
    { to: '/upload', label: 'Ingest Evidence', icon: Upload, active: location.pathname === '/upload', highlight: true },
    { to: '/incidents', label: 'Audit / Incidents', icon: ShieldAlert, active: location.pathname === '/incidents' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-mesh-dark text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl sticky top-0 z-40 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-blue-950/70 border border-blue-500/40 rounded-xl group-hover:border-blue-400/80 transition-all shadow-lg shadow-blue-950/50">
                <Shield className="w-5 h-5 text-blue-400 group-hover:scale-105 transition-transform" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-white text-sm">MHA — SDMS</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">v1.0</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-wide">Zero-Trust Evidence Platform</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                      item.active
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/20'
                        : item.highlight
                        ? 'text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300 border border-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
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
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3.5">
            {/* System Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>DEV-LEDGER SYNCED</span>
            </div>

            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                <div className="text-right font-mono text-xs">
                  <div className="text-white font-semibold text-xs leading-none">{user.username}</div>
                  <div className="text-[10px] text-blue-400 font-bold uppercase mt-0.5">{user.role}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-800/80 py-4 bg-slate-950/60 backdrop-blur text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>SDMS Zero-Trust Immutable Audit Core • Bharatiya Sakshya Adhiniyam §63 & IEA §65B Compliant</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          System Managed by Bhasit Gupta
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
  );
};
