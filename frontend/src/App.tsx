import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Shield, Folder, Upload, HelpCircle, ShieldAlert, LogOut, FileText } from 'lucide-react';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="p-2 bg-police-blue/40 border border-police-accent/50 rounded-lg">
                <Shield className="w-5 h-5 text-police-accent" />
              </div>
              <div className="leading-tight">
                <span className="font-bold tracking-tight text-white block text-sm">MHA — SDMS</span>
                <span className="text-[10px] text-slate-400 block font-mono">Zero-Trust Evidence System</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <Link to="/" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                <Folder className="w-3.5 h-3.5 text-police-accent" /> Cases
              </Link>
              <Link to="/documents" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                <FileText className="w-3.5 h-3.5 text-police-accent" /> Files
              </Link>
              <Link to="/ask" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                <HelpCircle className="w-3.5 h-3.5 text-police-accent" /> Intelligence Q&A
              </Link>
              <Link to="/upload" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-400" /> Ingest Evidence
              </Link>
              <Link to="/incidents" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Incidents
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:block text-right font-mono text-xs">
                <div className="text-white font-bold">{user.username}</div>
                <div className="text-[10px] text-police-accent">{user.role}</div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
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

      <footer className="border-t border-slate-800/80 py-4 bg-slate-900/40 text-center text-xs text-slate-500 font-mono">
        SDMS © 2026 Ministry of Home Affairs • Indian Evidence Act §65B / BSA §63 Compliant
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
