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
  ADMIN:            { level: 'SECRET',       weight: 3, color: 'text-crimson-800 bg-crimson-50 border-crimson-200' },
  SUPERVISOR:       { level: 'SECRET',       weight: 3, color: 'text-crimson-800 bg-crimson-50 border-crimson-200' },
  FORENSIC_ANALYST: { level: 'SECRET',       weight: 3, color: 'text-crimson-800 bg-crimson-50 border-crimson-200' },
  LEGAL_OFFICER:    { level: 'CONFIDENTIAL', weight: 2, color: 'text-amber-800 bg-amber-50 border-amber-200' },
  INVESTIGATOR:     { level: 'CONFIDENTIAL', weight: 2, color: 'text-amber-800 bg-amber-50 border-amber-200' },
  LAWYER:           { level: 'RESTRICTED',   weight: 1, color: 'text-stone-700 bg-stone-100 border-stone-200' },
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
              ? 'text-crimson-800 bg-crimson-50 border-crimson-200'
              : wt === 2
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-stone-700 bg-stone-100 border-stone-200';
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
    if (cls === 'SECRET') return 'bg-crimson-50 text-crimson-800 border border-crimson-200';
    if (cls === 'CONFIDENTIAL') return 'bg-amber-50 text-amber-800 border border-amber-200';
    return 'bg-stone-100 text-stone-700 border border-stone-200';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-ivory border-crimson-gold rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-crimson-50 border border-crimson-200 rounded-xl text-crimson-800 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-judicial font-bold tracking-tight text-stone-900">
              System Administration
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Root sovereign authority: manage judicial users, cases, role clearances, and on-chain policy enforcement.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 shadow-sm">{error}</div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-ivory border border-stone-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-crimson-50 border border-crimson-200 rounded-xl text-crimson-800 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-medium">Registered Officials</div>
              <div className="text-2xl font-bold font-serif-judicial text-stone-900">{stats.total_users}</div>
            </div>
          </div>
          <div className="glass-ivory border border-stone-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shadow-sm">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-medium">Active Case Dossiers</div>
              <div className="text-2xl font-bold font-serif-judicial text-stone-900">{stats.total_cases}</div>
            </div>
          </div>
          <div className="glass-ivory border border-stone-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-medium">Committed Evidence</div>
              <div className="text-2xl font-bold font-serif-judicial text-stone-900">{stats.total_documents}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Case Management ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif-judicial font-bold text-stone-900 flex items-center gap-2">
            <Folder className="w-4 h-4 text-crimson-800" /> Case Management
          </h2>
          <button
            onClick={() => { setShowCreateCase((v) => !v); setCaseFormError(null); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-crimson-800 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create Case
          </button>
        </div>

        {/* Create Case Form */}
        {showCreateCase && (
          <div className="glass-ivory border border-stone-300 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-serif-judicial font-bold text-stone-900">Register New Judicial Case</h3>
              <button onClick={() => setShowCreateCase(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            {caseFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">{caseFormError}</div>
            )}
            <form onSubmit={handleCreateCase} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Case ID *</label>
                <input
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="e.g. CASE-999"
                  value={caseForm.case_id}
                  onChange={(e) => setCaseForm((f) => ({ ...f, case_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Title *</label>
                <input
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="Case title"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <input
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="Optional summary"
                  value={caseForm.description}
                  onChange={(e) => setCaseForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Classification Ceiling</label>
                <select
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
                  value={caseForm.classification_ceiling}
                  onChange={(e) => setCaseForm((f) => ({ ...f, classification_ceiling: e.target.value }))}
                >
                  <option>RESTRICTED</option>
                  <option>CONFIDENTIAL</option>
                  <option>SECRET</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Owning MSP</label>
                <input
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="e.g. PoliceMSP"
                  value={caseForm.owning_msp}
                  onChange={(e) => setCaseForm((f) => ({ ...f, owning_msp: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={caseFormLoading}
                  className="px-5 py-2 bg-crimson-800 hover:bg-crimson-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  {caseFormLoading ? 'Registering...' : 'Commit Case'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cases List */}
        <div className="glass-ivory border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-xs text-stone-500 italic text-center">Loading case records...</div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-xs text-stone-500 text-center">No cases found. Create one above.</div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-parchment-200/80 border-b border-stone-200 text-stone-600 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Case ID</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Classification</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">MSP</th>
                  <th className="p-3.5 text-right">Assignments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {cases.map((c) => (
                  <React.Fragment key={c.case_id}>
                    <tr className="hover:bg-parchment-100/60 transition-colors">
                      <td className="p-3.5 font-bold text-crimson-800">{c.case_id}</td>
                      <td className="p-3.5 text-stone-800 font-medium max-w-xs truncate">{c.title}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${clsBadge(c.classification_ceiling)}`}>
                          {c.classification_ceiling}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-600">{c.owning_msp}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => toggleCasePanel(c.case_id)}
                          className="flex items-center gap-1 ml-auto px-2.5 py-1 bg-white hover:bg-parchment-200 text-stone-700 text-[10px] rounded-lg border border-stone-200 shadow-sm transition-colors"
                        >
                          <UserPlus className="w-3 h-3 text-crimson-700" />
                          Manage
                          {expandedCase === c.case_id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>

                    {/* Inline Assignment Panel */}
                    {expandedCase === c.case_id && (
                      <tr>
                        <td colSpan={6} className="bg-parchment-50 px-6 py-4 border-t border-stone-200">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] text-stone-600 uppercase tracking-wider font-bold font-mono">
                                Assigned Officials — {c.case_id}
                              </p>
                              <span className="text-[10px] text-stone-500 font-mono">
                                Case ceiling: <span className={`font-bold px-1.5 py-0.5 rounded-lg border ${clsBadge(c.classification_ceiling)}`}>{c.classification_ceiling}</span>
                              </span>
                            </div>

                            {/* Current assignments */}
                            <div className="flex flex-wrap gap-2">
                              {(caseAssignments[c.case_id] || []).length === 0 ? (
                                <span className="text-xs text-stone-500 italic">No officials assigned yet.</span>
                              ) : (
                                (caseAssignments[c.case_id] || []).map((a) => {
                                  const clearance = ROLE_CLEARANCE[a.role];
                                  return (
                                    <div
                                      key={a.user_id}
                                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-mono font-bold bg-white border border-stone-200 text-stone-800 shadow-sm"
                                    >
                                      <span>{a.username}</span>
                                      <span className="text-stone-300">·</span>
                                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] border ${clearance?.color ?? ''}`}>
                                        {clearance?.level ?? '?'}
                                      </span>
                                      {a.is_active && (
                                        <button
                                          onClick={() => handleRevoke(c.case_id, a.user_id)}
                                          className="ml-1 text-rose-600 hover:text-rose-800"
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
                                className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 font-mono focus:outline-none focus:border-crimson-700 flex-1 shadow-sm"
                                value={assignUserId}
                                onChange={(e) => { setAssignUserId(e.target.value); setAssignError(null); }}
                              >
                                <option value="">— Select official to assign —</option>
                                {users.filter((u) => u.is_active).map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.username} ({u.role}) — clearance: {ROLE_CLEARANCE[u.role]?.level ?? '?'}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssign(c.case_id)}
                                disabled={!assignUserId}
                                className="flex items-center gap-1 px-3.5 py-1.5 bg-crimson-800 hover:bg-crimson-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-sm"
                              >
                                <UserPlus className="w-3 h-3" /> Assign
                              </button>
                            </div>

                            {assignError && <p className="text-xs text-rose-700">{assignError}</p>}
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

      {/* ── Role Policy Matrix ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-base font-serif-judicial font-bold text-stone-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-crimson-800" /> Role Access & Security Clearance Policy Matrix
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Configure maximum classification clearance ceiling and capability permissions for each official judicial role.
            </p>
          </div>
          <span className="text-[11px] font-mono text-stone-600 bg-white border border-stone-200 px-3 py-1 rounded-xl shadow-sm">
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
                className="glass-ivory border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-crimson-700/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-stone-900 tracking-wide block">{r.role}</span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {r.officer_count} {r.officer_count === 1 ? 'officer' : 'officers'} assigned
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${clearanceObj?.color || ''}`}>
                      {r.clearance_ceiling}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  {r.officers && r.officers.length > 0 && (
                    <div className="p-2.5 bg-parchment-50 rounded-xl border border-stone-200 text-[10px] font-mono text-stone-600 truncate">
                      <span className="text-stone-400 font-semibold">Officers:</span> {officerNames}
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-stone-200">
                    <label className="block text-[11px] font-semibold text-stone-700">
                      Clearance Ceiling for {r.role}:
                    </label>
                    <select
                      value={r.clearance_ceiling}
                      onChange={(e) => handleUpdateRoleField(r.role, 'clearance_ceiling', e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 font-mono focus:outline-none focus:border-crimson-700 shadow-sm"
                    >
                      <option value="RESTRICTED">RESTRICTED (Level 1 — Restricted evidence only)</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL (Level 2 — Restricted & Confidential)</option>
                      <option value="SECRET">SECRET (Level 3 — All evidence levels)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveRolePolicy(r.role)}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-parchment-100 text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 transition-colors shadow-sm"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 text-emerald-600 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'Saving...' : `Save ${r.role} Policy`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── User Management ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif-judicial font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-crimson-800" /> Registered Official Personnel
          </h2>
          <button
            onClick={() => { setShowCreateUser(v => !v); setUserFormError(null); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-crimson-800 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Register Official
          </button>
        </div>

        {/* Create User Form */}
        {showCreateUser && (
          <div className="glass-ivory border border-stone-300 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-serif-judicial font-bold text-stone-900">Enroll New Judicial Personnel</h3>
              <button onClick={() => setShowCreateUser(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            {userFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">{userFormError}</div>
            )}
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">User ID *</label>
                <input
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="USR-201"
                  value={userForm.user_id}
                  onChange={e => setUserForm(f => ({ ...f, user_id: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Username *</label>
                <input
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="officer_name"
                  value={userForm.username}
                  onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="Inspector A. Gupta"
                  value={userForm.full_name}
                  onChange={e => setUserForm(f => ({ ...f, full_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Role *</label>
                <select
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
                  value={userForm.role}
                  onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="INVESTIGATOR">INVESTIGATOR — Confidential</option>
                  <option value="FORENSIC_ANALYST">FORENSIC_ANALYST — Secret</option>
                  <option value="LEGAL_OFFICER">LEGAL_OFFICER — Confidential</option>
                  <option value="SUPERVISOR">SUPERVISOR — Secret</option>
                  <option value="LAWYER">LAWYER — Restricted</option>
                  <option value="ADMIN">ADMIN — Secret (Root)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">MSP ID *</label>
                <input
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="PoliceMSP"
                  value={userForm.msp_id}
                  onChange={e => setUserForm(f => ({ ...f, msp_id: e.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="Min 8 characters"
                  value={userForm.password}
                  onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                  minLength={8}
                  required
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={userFormLoading}
                  className="px-5 py-2 bg-crimson-800 hover:bg-crimson-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  {userFormLoading ? 'Enrolling...' : 'Enroll Official'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users table */}
        <div className="glass-ivory border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-xs text-stone-500 italic text-center">Loading personnel...</div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-parchment-200/80 border-b border-stone-200 text-stone-600 text-[11px] uppercase font-semibold">
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
              <tbody className="divide-y divide-stone-200">
                {users.map((u) => {
                  const clearance = ROLE_CLEARANCE[u.role];
                  return (
                    <tr key={u.id} className="hover:bg-parchment-100/60 transition-colors">
                      <td className="p-3.5 text-stone-900 font-bold">{u.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{u.username}</div>
                        <div className="text-[10px] text-stone-500">{u.full_name}</div>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeOfficerRole(u.id, e.target.value)}
                          disabled={u.username === 'admin_sys'}
                          className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-crimson-800 font-semibold focus:outline-none cursor-pointer disabled:opacity-50 shadow-sm"
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
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${(roleClearances[u.role] || clearance)?.color ?? 'text-stone-600'}`}>
                          {(roleClearances[u.role] || clearance)?.level ?? '—'}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-600">{u.msp_id}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          u.mfa_enrolled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {u.mfa_enrolled ? 'ENROLLED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => toggleUser(u.id, u.is_active)}
                          className="p-1.5 hover:bg-parchment-200 rounded-lg text-stone-500 hover:text-stone-900 transition-colors"
                          title={u.is_active ? 'Deactivate user' : 'Activate user'}
                        >
                          <Power className={`w-4 h-4 ${u.is_active ? 'text-rose-600' : 'text-emerald-600'}`} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminPage;
