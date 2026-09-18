import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Folder,
  FileText,
  Power,
  Plus,
  UserPlus,
  UserMinus,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Lock,
  KeyRound,
  Check,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Edit2,
} from 'lucide-react';
import { apiFetch } from '../api/client';

// Role → max document classification clearance (mirrors backend opa_client.py)
const ROLE_CLEARANCE: Record<string, { level: string; weight: number; color: string }> = {
  ADMIN:            { level: 'SECRET',       weight: 3, color: 'text-red-300 bg-red-950 border-red-700' },
  SUPERVISOR:       { level: 'SECRET',       weight: 3, color: 'text-red-300 bg-red-950 border-red-700' },
  FORENSIC_ANALYST: { level: 'SECRET',       weight: 3, color: 'text-red-300 bg-red-950 border-red-700' },
  LEGAL_OFFICER:    { level: 'CONFIDENTIAL', weight: 2, color: 'text-amber-300 bg-amber-950 border-amber-700' },
  INVESTIGATOR:     { level: 'CONFIDENTIAL', weight: 2, color: 'text-amber-300 bg-amber-950 border-amber-700' },
  LAWYER:           { level: 'RESTRICTED',   weight: 1, color: 'text-slate-300 bg-slate-800 border-slate-600' },
};

const CLS_WEIGHT: Record<string, number> = { RESTRICTED: 1, CONFIDENTIAL: 2, SECRET: 3 };

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleClearances, setRoleClearances] = useState<Record<string, { level: string; weight: number; color: string }>>(ROLE_CLEARANCE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper: Returns true if a role can access documents of given classification
  const roleCanAccess = (role: string, classification: string): boolean => {
    const r = roleClearances[role] || ROLE_CLEARANCE[role];
    if (!r) return false;
    return r.weight >= (CLS_WEIGHT[classification] ?? 1);
  };

  // Create Case form state
  const [showCreateCase, setShowCreateCase] = useState(false);
  const [caseForm, setCaseForm] = useState({
    case_id: '',
    title: '',
    description: '',
    classification_ceiling: 'CONFIDENTIAL',
    owning_msp: 'PoliceMSP',
  });
  const [caseFormError, setCaseFormError] = useState<string | null>(null);
  const [caseFormLoading, setCaseFormLoading] = useState(false);

  // Assign user state — expandedCase holds the case_id whose assignment panel is open
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [caseAssignments, setCaseAssignments] = useState<Record<string, any[]>>({});
  const [assignUserId, setAssignUserId] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);

  // Create User form
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({
    user_id: '', username: '', full_name: '', role: 'INVESTIGATOR', msp_id: 'PoliceMSP', password: '',
  });
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [userFormLoading, setUserFormLoading] = useState(false);

  const [bulkCaseSelections, setBulkCaseSelections] = useState<Record<string, string>>({});
  const [savingRoles, setSavingRoles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, u, c, r] = await Promise.all([
        apiFetch<any>('/admin/stats'),
        apiFetch<any[]>('/admin/users'),
        apiFetch<any[]>('/admin/cases'),
        apiFetch<any[]>('/admin/roles'),
      ]);
      setStats(s);
      setUsers(u);
      setCases(c);
      setRoles(r);

      if (r && Array.isArray(r)) {
        const newMap: Record<string, { level: string; weight: number; color: string }> = {};
        for (const item of r) {
          const wt = CLS_WEIGHT[item.clearance_ceiling] || 1;
          const col =
            wt === 3
              ? 'text-red-300 bg-red-950 border-red-700'
              : wt === 2
              ? 'text-amber-300 bg-amber-950 border-amber-700'
              : 'text-slate-300 bg-slate-800 border-slate-600';
          newMap[item.role] = { level: item.clearance_ceiling, weight: wt, color: col };
        }
        setRoleClearances(newMap);
      }
    } catch (err: any) {
      setError(err.message || 'Access restricted to system administrators.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (id: string, active: boolean) => {
    try {
      const action = active ? 'deactivate' : 'activate';
      await apiFetch(`/admin/users/${id}/${action}`, { method: 'PATCH' });
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleChangeOfficerRole = async (userId: string, newRole: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update officer role');
    }
  };

  const handleUpdateRoleField = (roleName: string, field: string, value: any) => {
    setRoles((prev) =>
      prev.map((r) => (r.role === roleName ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveRolePolicy = async (roleName: string) => {
    const roleObj = roles.find((r) => r.role === roleName);
    if (!roleObj) return;

    setSavingRoles((prev) => ({ ...prev, [roleName]: true }));
    try {
      await apiFetch(`/admin/roles/${roleName}`, {
        method: 'PUT',
        body: JSON.stringify({
          clearance_ceiling: roleObj.clearance_ceiling,
          description: roleObj.description,
          can_download: roleObj.can_download,
          can_issue_cert: roleObj.can_issue_cert,
          can_query_rag: roleObj.can_query_rag,
          can_ingest: roleObj.can_ingest,
        }),
      });
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save role policy');
    } finally {
      setSavingRoles((prev) => ({ ...prev, [roleName]: false }));
    }
  };

  const handleBulkRoleCaseAccess = async (roleName: string, action: 'ASSIGN' | 'REVOKE') => {
    const caseId = bulkCaseSelections[roleName];
    if (!caseId) {
      alert('Please select a case first.');
      return;
    }
    try {
      const res = await apiFetch<any>(`/admin/roles/${roleName}/case-access`, {
        method: 'POST',
        body: JSON.stringify({ case_id: caseId, action }),
      });
      await loadAdminData();
      alert(`Success: ${action === 'ASSIGN' ? 'Assigned' : 'Revoked'} ${res.affected_officers} officer(s) with role ${roleName} to/from case ${caseId}.`);
    } catch (err: any) {
      alert(err.message || 'Bulk case action failed');
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaseFormError(null);
    setCaseFormLoading(true);
    try {
      await apiFetch('/admin/cases', {
        method: 'POST',
        body: JSON.stringify(caseForm),
      });
      setShowCreateCase(false);
      setCaseForm({ case_id: '', title: '', description: '', classification_ceiling: 'CONFIDENTIAL', owning_msp: 'PoliceMSP' });
      await loadAdminData();
    } catch (err: any) {
      setCaseFormError(err.message || 'Failed to create case');
    } finally {
      setCaseFormLoading(false);
    }
  };

  const toggleCasePanel = async (caseId: string) => {
    if (expandedCase === caseId) {
      setExpandedCase(null);
      return;
    }
    setExpandedCase(caseId);
    setAssignUserId('');
    setAssignError(null);
    try {
      const assignments = await apiFetch<any[]>(`/admin/cases/${caseId}/assignments`);
      setCaseAssignments((prev) => ({ ...prev, [caseId]: assignments }));
    } catch {
      setCaseAssignments((prev) => ({ ...prev, [caseId]: [] }));
    }
  };

  const handleAssign = async (caseId: string) => {
    if (!assignUserId.trim()) return;
    setAssignError(null);
    try {
      await apiFetch(`/admin/cases/${caseId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ user_id: assignUserId.trim() }),
      });
      const assignments = await apiFetch<any[]>(`/admin/cases/${caseId}/assignments`);
      setCaseAssignments((prev) => ({ ...prev, [caseId]: assignments }));
      setAssignUserId('');
      await loadAdminData();
    } catch (err: any) {
      setAssignError(err.message || 'Failed to assign user');
    }
  };

  const handleRevoke = async (caseId: string, userId: string) => {
    try {
      await apiFetch(`/admin/cases/${caseId}/assign/${userId}`, { method: 'DELETE' });
      const assignments = await apiFetch<any[]>(`/admin/cases/${caseId}/assignments`);
      setCaseAssignments((prev) => ({ ...prev, [caseId]: assignments }));
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke assignment');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);
    setUserFormLoading(true);
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      setShowCreateUser(false);
      setUserForm({ user_id: '', username: '', full_name: '', role: 'INVESTIGATOR', msp_id: 'PoliceMSP', password: '' });
      await loadAdminData();
    } catch (err: any) {
      setUserFormError(err.message || 'Failed to create user');
    } finally {
      setUserFormLoading(false);
    }
  };

  const clsBadge = (cls: string) => {
    if (cls === 'SECRET') return 'bg-red-950 text-red-300 border border-red-700';
    if (cls === 'CONFIDENTIAL') return 'bg-amber-950 text-amber-300 border border-amber-700';
    return 'bg-slate-800 text-slate-300 border border-slate-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-police-gold" />
          System Administration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Root authority: manage MSP users, create cases, assign access, and monitor security controls.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500 rounded-lg text-xs text-red-300">{error}</div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-3 bg-blue-950/60 border border-blue-500/40 rounded-lg text-police-accent">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Users</div>
              <div className="text-2xl font-bold text-white">{stats.total_users}</div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-400">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Active Cases</div>
              <div className="text-2xl font-bold text-white">{stats.total_cases}</div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-lg text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Committed Documents</div>
              <div className="text-2xl font-bold text-white">{stats.total_documents}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Case Management ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Folder className="w-4 h-4 text-emerald-400" /> Case Management
          </h2>
          <button
            onClick={() => { setShowCreateCase((v) => !v); setCaseFormError(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create Case
          </button>
        </div>

        {/* Create Case Form */}
        {showCreateCase && (
          <div className="bg-slate-900 border border-emerald-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-emerald-300">New Case</h3>
              <button onClick={() => setShowCreateCase(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {caseFormError && (
              <div className="p-2 bg-red-950/60 border border-red-500/50 rounded text-xs text-red-300">{caseFormError}</div>
            )}
            <form onSubmit={handleCreateCase} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Case ID *</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. CASE-999"
                  value={caseForm.case_id}
                  onChange={(e) => setCaseForm((f) => ({ ...f, case_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title *</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Case title"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Optional description"
                  value={caseForm.description}
                  onChange={(e) => setCaseForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Classification</label>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  value={caseForm.classification_ceiling}
                  onChange={(e) => setCaseForm((f) => ({ ...f, classification_ceiling: e.target.value }))}
                >
                  <option>RESTRICTED</option>
                  <option>CONFIDENTIAL</option>
                  <option>SECRET</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Owning MSP</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. PoliceMSP"
                  value={caseForm.owning_msp}
                  onChange={(e) => setCaseForm((f) => ({ ...f, owning_msp: e.target.value }))}
                />
              </div>
              {/* ── Role Access Preview ── */}
              <div className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
                  <Lock className="w-3 h-3" />
                  Role Access Preview — who can access <span className="text-white ml-1">{caseForm.classification_ceiling}</span> documents
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {Object.entries(ROLE_CLEARANCE).filter(([r]) => r !== 'ADMIN').map(([role, meta]) => {
                    const canAccess = roleCanAccess(role, caseForm.classification_ceiling);
                    return (
                      <div key={role} className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono font-bold ${canAccess ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300' : 'bg-red-950/40 border-red-800/50 text-red-400 line-through opacity-60'}`}>
                        {canAccess ? '✓' : '✗'} {role.replace('_', ' ')}
                        <span className={`ml-auto px-1 rounded text-[9px] border ${meta.color}`}>{meta.level}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  <Info className="w-3 h-3 inline mr-1" />
                  The <strong className="text-slate-300">classification ceiling</strong> is the maximum classification level that documents in this case can be tagged with. Roles whose clearance is below this ceiling will be blocked from accessing those documents even if assigned to the case.
                </p>
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={caseFormLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
                >
                  {caseFormLoading ? 'Creating...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cases List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-6 text-xs text-slate-400 italic">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="p-6 text-xs text-slate-500 text-center">No cases found. Create one above.</div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-3.5">Case ID</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Classification</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">MSP</th>
                  <th className="p-3.5 text-right">Assignments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {cases.map((c) => (
                  <React.Fragment key={c.case_id}>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-police-accent">{c.case_id}</td>
                      <td className="p-3.5 text-slate-200 max-w-xs truncate">{c.title}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${clsBadge(c.classification_ceiling)}`}>
                          {c.classification_ceiling}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{c.owning_msp}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => toggleCasePanel(c.case_id)}
                          className="flex items-center gap-1 ml-auto px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] rounded transition-colors"
                        >
                          <UserPlus className="w-3 h-3" />
                          Manage
                          {expandedCase === c.case_id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>

                    {/* Inline Assignment Panel */}
                    {expandedCase === c.case_id && (
                      <tr>
                        <td colSpan={6} className="bg-slate-950/80 px-6 py-4 border-t border-slate-800">
                           <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                Assigned Users — {c.case_id}
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Case ceiling: <span className={`font-bold px-1.5 py-0.5 rounded border ${
                                  c.classification_ceiling === 'SECRET' ? 'text-red-300 bg-red-950 border-red-700' :
                                  c.classification_ceiling === 'CONFIDENTIAL' ? 'text-amber-300 bg-amber-950 border-amber-700' :
                                  'text-slate-300 bg-slate-800 border-slate-600'
                                }`}>{c.classification_ceiling}</span>
                              </span>
                            </div>

                            {/* Current assignments */}
                            <div className="flex flex-wrap gap-2">
                              {(caseAssignments[c.case_id] || []).length === 0 ? (
                                <span className="text-xs text-slate-500 italic">No users assigned yet.</span>
                              ) : (
                                (caseAssignments[c.case_id] || []).map((a) => {
                                  const clearance = ROLE_CLEARANCE[a.role];
                                  const canSeeAll = roleCanAccess(a.role, c.classification_ceiling);
                                  return (
                                    <div
                                      key={a.user_id}
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                                        !a.is_active
                                          ? 'bg-slate-800 border-slate-600 text-slate-500 line-through opacity-60'
                                          : canSeeAll
                                          ? 'bg-blue-950/60 border-blue-600/50 text-blue-300'
                                          : 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                                      }`}
                                    >
                                      <span>{a.username}</span>
                                      <span className="text-slate-500">·</span>
                                      <span className={`px-1 rounded text-[9px] border ${clearance?.color ?? ''}`}>
                                        {clearance?.level ?? '?'}
                                      </span>
                                      {a.is_active && !canSeeAll && (
                                        <span title={`${a.role} clearance (${clearance?.level}) is below case ceiling (${c.classification_ceiling}). Assigned but cannot access ${c.classification_ceiling} documents.`}
                                          className="text-amber-400 cursor-help">⚠</span>
                                      )}
                                      {a.is_active && (
                                        <button
                                          onClick={() => handleRevoke(c.case_id, a.user_id)}
                                          className="ml-1 text-red-400 hover:text-red-300"
                                          title="Revoke access"
                                        >
                                          <UserMinus className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Assign new user */}
                            <div className="flex items-center gap-2 mt-2">
                              <select
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-blue-500 flex-1"
                                value={assignUserId}
                                onChange={(e) => { setAssignUserId(e.target.value); setAssignError(null); }}
                              >
                                <option value="">— Select user to assign —</option>
                                {users.filter((u) => u.is_active).map((u) => {
                                  const canSee = roleCanAccess(u.role, c.classification_ceiling);
                                  return (
                                    <option key={u.id} value={u.id}>
                                      {u.username} ({u.role}) — clearance: {ROLE_CLEARANCE[u.role]?.level ?? '?'}{!canSee ? ' ⚠ below ceiling' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                              <button
                                onClick={() => handleAssign(c.case_id)}
                                disabled={!assignUserId}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-semibold rounded"
                              >
                                <UserPlus className="w-3 h-3" /> Assign
                              </button>
                            </div>

                            {/* Clearance warning for selected user */}
                            {assignUserId && !roleCanAccess(users.find(u => u.id === assignUserId)?.role ?? '', c.classification_ceiling) && (
                              <div className="flex items-start gap-1.5 p-2 bg-amber-950/40 border border-amber-700/50 rounded text-[10px] text-amber-300">
                                <span className="text-base leading-none">⚠</span>
                                <span>
                                  <strong>{users.find(u => u.id === assignUserId)?.username}</strong> has role <strong>{users.find(u => u.id === assignUserId)?.role}</strong> with max clearance <strong>{ROLE_CLEARANCE[users.find(u => u.id === assignUserId)?.role ?? '']?.level}</strong>.
                                  They will be assigned to this case but <strong>cannot access documents classified above their ceiling</strong>.
                                  Only <strong>RESTRICTED</strong> documents will be visible to them.
                                </span>
                              </div>
                            )}

                            {assignError && <p className="text-xs text-red-400">{assignError}</p>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Role Access Control & Security Clearance Policy Matrix ───────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-police-gold" /> Role Access & Security Clearance Policy Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure maximum classification clearance ceiling and capability permissions for each official role.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
            {roles.length} Roles Configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => {
            const isSaving = savingRoles[r.role] || false;
            const clearanceObj = roleClearances[r.role] || ROLE_CLEARANCE[r.role];
            const officerNames = (r.officers || []).map((o: any) => o.username).join(', ');

            return (
              <div
                key={r.role}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header: Role Name + Officer Count */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-white tracking-wide block">{r.role}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {r.officer_count} {r.officer_count === 1 ? 'officer' : 'officers'} assigned
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${clearanceObj?.color || ''}`}>
                      {r.clearance_ceiling}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  {/* Assigned Officers Hint */}
                  {r.officers && r.officers.length > 0 && (
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-400 truncate">
                      <span className="text-slate-500">Officers:</span> {officerNames}
                    </div>
                  )}

                  {/* Editable Clearance Ceiling */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Clearance Ceiling for {r.role}:
                    </label>
                    <select
                      value={r.clearance_ceiling}
                      onChange={(e) => handleUpdateRoleField(r.role, 'clearance_ceiling', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-police-accent"
                    >
                      <option value="RESTRICTED">RESTRICTED (Level 1 — Restricted evidence only)</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL (Level 2 — Restricted & Confidential)</option>
                      <option value="SECRET">SECRET (Level 3 — All evidence levels)</option>
                    </select>
                  </div>

                  {/* Permission Capability Checkboxes */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Allowed Operations:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={r.can_download}
                          onChange={(e) => handleUpdateRoleField(r.role, 'can_download', e.target.checked)}
                          className="rounded border-slate-700 text-police-accent bg-slate-950"
                        />
                        <span>Download Files</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={r.can_issue_cert}
                          onChange={(e) => handleUpdateRoleField(r.role, 'can_issue_cert', e.target.checked)}
                          className="rounded border-slate-700 text-police-accent bg-slate-950"
                        />
                        <span>Issue BSA §63</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={r.can_ingest}
                          onChange={(e) => handleUpdateRoleField(r.role, 'can_ingest', e.target.checked)}
                          className="rounded border-slate-700 text-police-accent bg-slate-950"
                        />
                        <span>Ingest Evidence</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={r.can_query_rag}
                          onChange={(e) => handleUpdateRoleField(r.role, 'can_query_rag', e.target.checked)}
                          className="rounded border-slate-700 text-police-accent bg-slate-950"
                        />
                        <span>Query AI (RAG)</span>
                      </label>
                    </div>
                  </div>

                  {/* Bulk Case Access for this role */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Bulk Case Access for all {r.role}s:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={bulkCaseSelections[r.role] || ''}
                        onChange={(e) =>
                          setBulkCaseSelections((prev) => ({ ...prev, [r.role]: e.target.value }))
                        }
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-none"
                      >
                        <option value="">— Select Case —</option>
                        {cases.map((c) => (
                          <option key={c.case_id} value={c.case_id}>
                            {c.case_id}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleBulkRoleCaseAccess(r.role, 'ASSIGN')}
                        disabled={!bulkCaseSelections[r.role]}
                        className="px-2 py-1 bg-police-accent hover:bg-blue-600 disabled:opacity-40 text-white text-[10px] font-semibold rounded transition-colors"
                        title="Assign all officers of this role to selected case"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleBulkRoleCaseAccess(r.role, 'REVOKE')}
                        disabled={!bulkCaseSelections[r.role]}
                        className="px-2 py-1 bg-red-800 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-semibold rounded transition-colors"
                        title="Revoke access for all officers of this role from selected case"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Role Policy Button */}
                <button
                  onClick={() => handleSaveRolePolicy(r.role)}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors shadow"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 text-emerald-400 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'Saving Policy...' : `Save ${r.role} Policy`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── User Management ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-police-accent" /> Registered Official Users
          </h2>
          <button
            onClick={() => { setShowCreateUser(v => !v); setUserFormError(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Official
          </button>
        </div>

        {/* Create User Form */}
        {showCreateUser && (
          <div className="bg-slate-900 border border-blue-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-blue-300">Register New Official</h3>
              <button onClick={() => setShowCreateUser(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {userFormError && (
              <div className="p-2 bg-red-950/60 border border-red-500/50 rounded text-xs text-red-300">{userFormError}</div>
            )}
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">User ID * <span className="text-slate-500">(e.g. USR-201)</span></label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  placeholder="USR-201"
                  value={userForm.user_id}
                  onChange={e => setUserForm(f => ({ ...f, user_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Username * <span className="text-slate-500">(login name)</span></label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  placeholder="officer_name"
                  value={userForm.username}
                  onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Inspector A. Singh"
                  value={userForm.full_name}
                  onChange={e => setUserForm(f => ({ ...f, full_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Role *</label>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  value={userForm.role}
                  onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="INVESTIGATOR">INVESTIGATOR — Secret clearance (Full Access)</option>
                  <option value="FORENSIC_ANALYST">FORENSIC_ANALYST — Secret clearance</option>
                  <option value="LEGAL_OFFICER">LEGAL_OFFICER — Confidential clearance</option>
                  <option value="SUPERVISOR">SUPERVISOR — Secret clearance</option>
                  <option value="LAWYER">LAWYER — Restricted clearance</option>
                  <option value="ADMIN">ADMIN — Full access</option>
                </select>
                {/* Live clearance hint */}
                <div className="mt-1 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] text-slate-500">Max clearance for this role: </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ROLE_CLEARANCE[userForm.role]?.color}`}>
                    {ROLE_CLEARANCE[userForm.role]?.level}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">MSP ID *</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="PoliceMSP"
                  value={userForm.msp_id}
                  onChange={e => setUserForm(f => ({ ...f, msp_id: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Temporary Password * <span className="text-slate-500">(min 8 chars)</span></label>
                <input
                  type="password"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Min 8 characters"
                  value={userForm.password}
                  onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                  minLength={8}
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  <Info className="w-3 h-3 inline mr-1" />
                  User will complete MFA enrollment on first login. MFA code <strong className="text-slate-300">000000</strong> works until they scan their TOTP QR.
                </p>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={userFormLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
                >
                  {userFormLoading ? 'Registering...' : 'Register Official'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-6 text-xs text-slate-400 italic">Loading users...</div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-3.5">User ID</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Clearance</th>
                  <th className="p-3.5">MSP ID</th>
                  <th className="p-3.5">MFA</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                      No users found. Add one above.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const clearance = ROLE_CLEARANCE[u.role];
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 text-white">{u.id}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-200">{u.username}</div>
                          <div className="text-[10px] text-slate-500">{u.full_name}</div>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeOfficerRole(u.id, e.target.value)}
                            disabled={u.username === 'admin_sys'}
                            className="bg-slate-950 border border-slate-700 hover:border-police-accent rounded-lg px-2 py-1 text-xs text-police-accent font-semibold focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title={u.username === 'admin_sys' ? 'Primary admin role cannot be altered' : 'Edit Officer Role'}
                          >
                            <option value="INVESTIGATOR">INVESTIGATOR</option>
                            <option value="FORENSIC_ANALYST">FORENSIC_ANALYST</option>
                            <option value="LEGAL_OFFICER">LEGAL_OFFICER</option>
                            <option value="SUPERVISOR">SUPERVISOR</option>
                            <option value="LAWYER">LAWYER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${(roleClearances[u.role] || clearance)?.color ?? 'text-slate-400'}`}>
                            {(roleClearances[u.role] || clearance)?.level ?? '—'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400">{u.msp_id}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.mfa_enrolled ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                          }`}>
                            {u.mfa_enrolled ? 'ENROLLED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.is_active ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                          }`}>
                            {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => toggleUser(u.id, u.is_active)}
                            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                            title={u.is_active ? 'Deactivate user' : 'Activate user'}
                          >
                            <Power className={`w-4 h-4 ${u.is_active ? 'text-red-400' : 'text-emerald-400'}`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};


