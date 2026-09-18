import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Folder, Upload, HelpCircle, ShieldAlert, LogOut, FileText, Lock, Radio, Activity, Scale, Award } from 'lucide-react';
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
    { to: '/ask', label: 'Judicial AI', icon: HelpCircle, active: location.pathname === '/ask' },
    { to: '/upload', label: 'Ingest Evidence', icon: Upload, active: location.pathname === '/upload', highlight: true },
    { to: '/incidents', label: 'Chain of Custody', icon: ShieldAlert, active: location.pathname === '/incidents' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-stone-900 relative selection:bg-red-500/20 selection:text-red-950">
      {/* 3D Armillary Gyroscope Canvas */}
      <ThreeCanvas />

      {/* Floating Ivory Island Header */}
      <header className="sticky top-3 z-40 max-w-7xl mx-auto px-4 sm:px-6 w-full pointer-events-none">
        <div className="glass-ivory rounded-2xl px-5 h-16 flex items-center justify-between shadow-lg shadow-amber-950/5 pointer-events-auto transition-all">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-800 to-amber-900 text-white flex items-center justify-center shadow-md shadow-red-950/20 group-hover:scale-105 transition-transform">
                <Scale className="w-5 h-5 text-amber-200" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-serif-judicial font-black tracking-wider text-red-900 text-base">
                    NYAYA-VAULT
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-100 text-red-800 border border-red-200">
                    MHA SIH26190
                  </span>
                </div>
                <span className="text-[10px] text-stone-600 font-mono tracking-wide">
                  Sovereign Digital Provenance Trust Layer
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
                        ? 'bg-red-50 text-red-800 border border-red-200/80 shadow-sm font-bold'
                        : item.highlight
                        ? 'text-amber-800 hover:bg-amber-50 hover:text-amber-900 border border-amber-200'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
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
                      ? 'bg-purple-50 text-purple-900 border border-purple-200 font-bold'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-purple-700" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Live Trust Telemetry */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-[10px] font-mono text-stone-600">
                <Radio className="w-3 h-3 text-red-600 animate-pulse" />
                <span>9ms</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[10px] font-mono text-red-800 font-bold">
                <Award className="w-3 h-3 text-amber-600" />
                <span>POLYGON ANCHORED</span>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
                <div className="text-right font-mono text-xs">
                  <div className="text-stone-900 font-bold text-xs leading-none">{user.username}</div>
                  <div className="text-[9px] text-red-700 font-extrabold uppercase mt-0.5 tracking-wider">{user.role}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-100/60 border border-transparent hover:border-red-200 rounded-xl text-stone-500 hover:text-red-700 transition-all cursor-pointer"
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

      {/* Warm Ivory Judicial Footer */}
      <footer className="border-t border-stone-200 py-4 bg-white/70 backdrop-blur-xl relative z-10 text-xs text-stone-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-red-700" />
            <span>NYAYA-VAULT • Electronic Evidence Management • Bharatiya Sakshya Adhiniyam §63 & IEA §65B Admissible</span>
          </div>
          <div className="text-stone-500 text-[11px] flex items-center gap-2">
            <span>Authored by Bhasit Gupta</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            <span>POLYGON AMOY LAYER</span>
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
