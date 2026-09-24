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
  AlertCircle,
  Sliders,
  ShieldCheck,
  Edit2,
  Cpu,
  Zap,
  Eye,
  EyeOff,
  Activity,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { getAIProviderConfigs } from '../api/query';
import { recordCustodyEvent } from '../api/audit';
import { ensurePolygonAmoyNetwork, POLYGONSCAN_BASE, PROVENANCE_REGISTRY_ADDR, anchorCaseOnChain, anchorOfficialOnChain, anchorRoleChangeOnChain } from '../lib/polygon';
import { ethers } from 'ethers';

const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 'https://kraxwwwkhprczuiqkxuw.supabase.co';
// Always use anon key — never use service role key in browser
const SUPABASE_KEY =
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_yBEvcnfdSVjN_5ZlxSw_5w_bDe53Czq';
// Evidence Registry — used as anchor target for raw hash calldata
const EVIDENCE_REGISTRY_ADDR = ((import.meta as any).env?.VITE_POLYGON_EVIDENCE_REGISTRY as string) || '0xF022e8E8E7FD5d565fAb24dC74B6fAc1c8760a01';


// Provenance Registry ABI — role management functions
const PROVENANCE_ABI = [
  'function registerCase(bytes32 caseIdHash, string calldata title, uint8 clearanceLevel) external',
  'function registerOfficer(address officerAddr, bytes32 roleHash, bytes32 mspHash) external',
];


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
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleClearances, setRoleClearances] = useState<Record<string, { level: string; weight: number; color: string }>>(ROLE_CLEARANCE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sovereign AI Gateway States for 4 Models
  const [tier1Key, setTier1Key] = useState('');
  const [tier2Key, setTier2Key] = useState('');
  const [tier3Key, setTier3Key] = useState('');
  const [tier4Key, setTier4Key] = useState('');
  const [showKeys, setShowKeys] = useState({ t1: false, t2: false, t3: false, t4: false });
  const [aiSaveSuccess, setAiSaveSuccess] = useState(false);
  const [testingTier, setTestingTier] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string; latencyMs?: number }>>({});

  useEffect(() => {
    if (isAdmin) {
      const cfgs = getAIProviderConfigs();
      setTier1Key(cfgs.tier1.apiKey);
      setTier2Key(cfgs.tier2.apiKey);
      setTier3Key(cfgs.tier3.apiKey);
      setTier4Key(cfgs.tier4.apiKey);
    }
  }, [isAdmin]);

  const handleSaveAIKeys = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tier1Key.trim()) localStorage.setItem('pv_tier1_key', tier1Key.trim());
    else localStorage.removeItem('pv_tier1_key');

    if (tier2Key.trim()) localStorage.setItem('pv_tier2_key', tier2Key.trim());
    else localStorage.removeItem('pv_tier2_key');

    if (tier3Key.trim()) localStorage.setItem('pv_tier3_key', tier3Key.trim());
    else localStorage.removeItem('pv_tier3_key');

    if (tier4Key.trim()) localStorage.setItem('pv_tier4_key', tier4Key.trim());
    else localStorage.removeItem('pv_tier4_key');

    setAiSaveSuccess(true);
    setTimeout(() => setAiSaveSuccess(false), 2500);
  };

  const handleTestTier = async (tier: 'tier1' | 'tier2' | 'tier3' | 'tier4') => {
    setTestingTier(tier);
    const cfgs = getAIProviderConfigs();
    const cfg = cfgs[tier];
    const key = tier === 'tier1' ? tier1Key : tier === 'tier2' ? tier2Key : tier === 'tier3' ? tier3Key : tier4Key;
    const effectiveKey = key.trim() || cfg.apiKey;

    if (!effectiveKey) {
      setTestResults(prev => ({ ...prev, [tier]: { ok: false, message: 'No API key configured' } }));
      setTestingTier(null);
      return;
    }

    const start = Date.now();
    try {
      const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: [{ role: 'user', content: 'respond with OK' }],
          max_tokens: 5,
        }),
      });
      const latency = Date.now() - start;
      if (resp.ok) {
        setTestResults(prev => ({ ...prev, [tier]: { ok: true, message: `Operational (${latency}ms)`, latencyMs: latency } }));
      } else {
        const errJson = await resp.json().catch(() => ({}));
        setTestResults(prev => ({ ...prev, [tier]: { ok: false, message: errJson.error?.message || `HTTP ${resp.status}` } }));
      }
    } catch (e: any) {
      setTestResults(prev => ({ ...prev, [tier]: { ok: false, message: e.message || 'Network error' } }));
    } finally {
      setTestingTier(null);
    }
  };

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

  // App notification toast — replaces browser alert()
  const [appToast, setAppToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showAppToast = (message: string, type: 'success' | 'error' = 'success') => {
    setAppToast({ message, type });
    setTimeout(() => setAppToast(null), 6000);
  };

  // Chain anchor toast — shown after successful on-chain tx, no alert() popup
  const [chainToast, setChainToast] = useState<{ id: string; txHash: string; url: string; title: string; label: string } | null>(null);
  const showChainToast = (id: string, txHash: string, title = 'Anchored on Polygon Amoy ✓', label = 'Docket') => {
    const url = `${POLYGONSCAN_BASE}/tx/${txHash}`;
    setChainToast({ id, txHash, url, title, label });
    setTimeout(() => setChainToast(null), 12000); // auto-dismiss after 12s
  };

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

  // Role change on-chain confirmation modal state
  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    user: any;
    newRole: string;
  } | null>(null);
  const [roleChangeReason, setRoleChangeReason] = useState('Statutory Clearance Adjustment & Role Reassignment');
  const [roleChangeSubmitting, setRoleChangeSubmitting] = useState(false);
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      let s: any = null, u: any[] = [], c: any[] = [], r: any[] = [];
      try {
        [s, u, c, r] = await Promise.all([
          apiFetch<any>('/admin/stats'),
          apiFetch<any[]>('/admin/users'),
          apiFetch<any[]>('/admin/cases'),
          apiFetch<any[]>('/admin/roles'),
        ]);
      } catch (backendErr) {
      // Backend offline — use Supabase with anon key
        const [uRes, cRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/users?select=*&order=created_at.desc`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          }).then((res) => res.json()).catch(() => []),
          fetch(`${SUPABASE_URL}/rest/v1/cases?select=*&order=created_at.desc`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          }).then((res) => res.json()).catch(() => []),
        ]);
        u = Array.isArray(uRes) ? uRes : [];
        c = Array.isArray(cRes) ? cRes : [];
        // Compute real counts from DB
        s = {
          total_users: u.length,
          total_cases: c.length,
          total_documents: 0,
          total_events: 0,
        };
        // Try to get real doc/event counts
        try {
          const [docCountRes, evtCountRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/documents?select=id`, {
              headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact', Range: '0-0' },
            }),
            fetch(`${SUPABASE_URL}/rest/v1/audit_logs?select=id`, {
              headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact', Range: '0-0' },
            }),
          ]);
          const docCount = docCountRes.headers.get('Content-Range');
          const evtCount = evtCountRes.headers.get('Content-Range');
          if (docCount) s.total_documents = parseInt(docCount.split('/')[1] || '0', 10);
          if (evtCount) s.total_events = parseInt(evtCount.split('/')[1] || '0', 10);
        } catch {}
        r = [
          { role: 'ADMIN', clearance_ceiling: 'SECRET', description: 'System Administrator with full operational oversight', can_download: true, can_issue_cert: true, can_query_rag: true, can_ingest: true },
          { role: 'SUPERVISOR', clearance_ceiling: 'SECRET', description: 'Supervisory Officer managing multi-jurisdiction cases', can_download: true, can_issue_cert: true, can_query_rag: true, can_ingest: true },
          { role: 'FORENSIC_ANALYST', clearance_ceiling: 'SECRET', description: 'Forensic Lab Director conducting deep ballistics & cyber analysis', can_download: true, can_issue_cert: true, can_query_rag: true, can_ingest: true },
          { role: 'INVESTIGATOR', clearance_ceiling: 'CONFIDENTIAL', description: 'Lead Field Investigator managing case evidence dossiers', can_download: true, can_issue_cert: true, can_query_rag: true, can_ingest: true },
          { role: 'LEGAL_OFFICER', clearance_ceiling: 'CONFIDENTIAL', description: 'Public Prosecutor evaluating trial readiness and certifying evidence', can_download: true, can_issue_cert: true, can_query_rag: true, can_ingest: false },
          { role: 'LAWYER', clearance_ceiling: 'RESTRICTED', description: 'Defense or Legal Counsel with restricted dossier review rights', can_download: false, can_issue_cert: false, can_query_rag: true, can_ingest: false },
        ];

      }
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
      try {
        await apiFetch(`/admin/users/${id}/${action}`, { method: 'PATCH' });
      } catch {
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: !active }),
        });
      }
      await loadAdminData();
      showAppToast(`Officer status updated successfully`, 'success');
    } catch (err: any) {
      showAppToast(err.message || 'Action failed', 'error');
    }
  };

  const handleInitiateRoleChange = (targetUser: any, newRole: string) => {
    if (targetUser.role === newRole) return;
    setRoleChangeTarget({ user: targetUser, newRole });
    setRoleChangeReason(`Statutory Judicial Reassignment: ${targetUser.role} -> ${newRole}`);
    setRoleChangeError(null);
  };

  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget) return;
    const { user: targetUser, newRole } = roleChangeTarget;
    const oldRole = targetUser.role || 'OFFICER';
    setRoleChangeSubmitting(true);
    setRoleChangeError(null);

    try {
      // Step 1: Enforce on-chain role update anchoring on Polygon Amoy via MetaMask wallet popup
      const { txHash, explorerUrl } = await anchorRoleChangeOnChain({
        userId: targetUser.id,
        newRole,
        adminId: localStorage.getItem('sdms_user_id') || user?.id || 'ADMIN',
      });
      console.info(`[Chain] anchorRoleChangeOnChain(${targetUser.id}: ${oldRole} -> ${newRole}) confirmed: ${txHash}`);

      // Step 2: Save to backend / Supabase
      try {
        await apiFetch(`/admin/users/${targetUser.id}/role`, {
          method: 'PATCH',
          body: JSON.stringify({ role: newRole, blockchain_tx: txHash }),
        });
      } catch {
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(targetUser.id)}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole, updated_at: new Date().toISOString() }),
        });
      }

      // Step 3: Write audit log with immutable on-chain tx reference
      await recordCustodyEvent({
        actorId: localStorage.getItem('sdms_user_id') || user?.id || 'ADMIN',
        actorRole: user?.role || 'ADMIN',
        actorMSP: user?.msp_id || 'JudicialMSP',
        action: 'OFFICER_ROLE_UPDATED',
        caseId: 'SYSTEM',
        outcome: 'ALLOW',
        reason: `Officer ${targetUser.id} (${targetUser.username}) role reassigned from ${oldRole} to ${newRole}. Justification: ${roleChangeReason.trim()}`,
        ledgerTxId: txHash,
      });

      // Step 4: Show on-chain toast banner (NO browser alert())
      showChainToast(targetUser.id, txHash, 'Officer Role Updated on Polygon Amoy ✓', 'Officer');
      setRoleChangeTarget(null);
      await loadAdminData();
    } catch (err: any) {
      setRoleChangeError(err.message || 'Failed to update officer role on Polygon blockchain');
    } finally {
      setRoleChangeSubmitting(false);
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
      const nowIso = new Date().toISOString();
      const rolePayload = {
        role: roleName,
        clearance_ceiling: roleObj.clearance_ceiling,
        description: roleObj.description,
        can_download: roleObj.can_download ?? true,
        can_issue_cert: roleObj.can_issue_cert ?? true,
        can_query_rag: roleObj.can_query_rag ?? true,
        can_ingest: roleObj.can_ingest ?? true,
        updated_at: nowIso,
      };

      // Try backend first
      let saved = false;
      try {
        await apiFetch(`/admin/roles/${roleName}`, {
          method: 'PUT',
          body: JSON.stringify(rolePayload),
        });
        saved = true;
      } catch {
        // Backend offline — save directly to Supabase
      }

      if (!saved) {
        // PATCH existing row; if empty result, INSERT new row
        const patchRes = await fetch(
          `${SUPABASE_URL}/rest/v1/roles?role=eq.${encodeURIComponent(roleName)}`,
          {
            method: 'PATCH',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify(rolePayload),
          }
        );
        const patched = patchRes.ok ? await patchRes.json() : [];
        if (!patched || patched.length === 0) {
          await fetch(`${SUPABASE_URL}/rest/v1/roles`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates',
            },
            body: JSON.stringify(rolePayload),
          });
        }
      }

      // Write audit log entry
      fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'ROLE_POLICY_UPDATED',
          actor_id: 'ADMIN',
          case_id: 'SYSTEM',
          details: JSON.stringify({
            role: roleName,
            clearance_ceiling: roleObj.clearance_ceiling,
            can_download: roleObj.can_download,
            can_issue_cert: roleObj.can_issue_cert,
            can_query_rag: roleObj.can_query_rag,
            can_ingest: roleObj.can_ingest,
          }),
          timestamp: nowIso,
        }),
      }).catch(() => {});

      // Update local roles state directly — do NOT call loadAdminData()
      // because fallback always resets to hardcoded list
      setRoles((prev) =>
        prev.map((r) => (r.role === roleName ? { ...r, ...rolePayload } : r))
      );

      showAppToast(`✓ ${roleName} policy saved — Clearance: ${roleObj.clearance_ceiling}`, 'success');
    } catch (err: any) {
      showAppToast(err.message || 'Failed to save role policy', 'error');
    } finally {
      setSavingRoles((prev) => ({ ...prev, [roleName]: false }));
    }
  };

  const handleBulkRoleCaseAccess = async (roleName: string, action: 'ASSIGN' | 'REVOKE') => {
    const caseId = bulkCaseSelections[roleName];
    if (!caseId) {
      showAppToast('Please select a case first.', 'error');
      return;
    }
    try {
      const res = await apiFetch<any>(`/admin/roles/${roleName}/case-access`, {
        method: 'POST',
        body: JSON.stringify({ case_id: caseId, action }),
      });
      await loadAdminData();
      showAppToast(`Success: ${action === 'ASSIGN' ? 'Assigned' : 'Revoked'} ${res.affected_officers} officer(s) with role ${roleName} to/from case ${caseId}.`, 'success');
    } catch (err: any) {
      showAppToast(err.message || 'Bulk case action failed', 'error');
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaseFormError(null);
    setCaseFormLoading(true);
    const savedCaseId = caseForm.case_id;
    try {
      // Step 1: Enforce on-chain case anchoring on Polygon Amoy via MetaMask wallet popup
      const normalizedCaseId = caseForm.case_id.trim().toUpperCase();
      const { txHash } = await anchorCaseOnChain(normalizedCaseId);
      console.info(`[Chain] logCase(${normalizedCaseId}) confirmed: ${txHash}`);
      let chainTxHash = txHash;


      // Step 2: Save to Supabase — source of truth
      const nowIso = new Date().toISOString();
      const casePayload = {
        case_id: caseForm.case_id,
        title: caseForm.title,
        description: caseForm.description,
        classification_ceiling: caseForm.classification_ceiling,
        status: 'ACTIVE',
        owning_msp: caseForm.owning_msp,
        created_at: nowIso,
        updated_at: nowIso,
      };
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/cases`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(casePayload),
      });
      if (!supaRes.ok) {
        const errText = await supaRes.text();
        throw new Error(`Case Creation Error: ${errText}`);
      }

      // Step 3: Audit log
      fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'CASE_CREATED', actor_id: 'ADMIN', case_id: caseForm.case_id, details: JSON.stringify({ title: caseForm.title, classification: caseForm.classification_ceiling, msp: caseForm.owning_msp, chain_tx: chainTxHash || 'off-chain' }), timestamp: nowIso }),
      }).catch(() => {});

      setShowCreateCase(false);
      setCaseForm({ case_id: '', title: '', description: '', classification_ceiling: 'CONFIDENTIAL', owning_msp: 'PoliceMSP' });
      await loadAdminData();
      if (chainTxHash) showChainToast(savedCaseId, chainTxHash, 'Case Anchored on Polygon Amoy ✓', 'Docket');

    } catch (err: any) {
      setCaseFormError(err.message || 'Failed to create case');
    } finally {
      setCaseFormLoading(false);
    }
  };



  const fetchCaseAssignmentsFromSupabase = async (caseId: string) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/assignments?case_id=eq.${encodeURIComponent(caseId)}&select=user_id,is_active,users(id,username,role)`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        return (rows || [])
          .filter((r: any) => r.is_active)
          .map((r: any) => ({
            user_id: r.user_id,
            username: r.users?.username || r.user_id,
            role: r.users?.role || 'INVESTIGATOR',
            is_active: r.is_active,
          }));
      }
    } catch (err) {
      console.warn('Supabase fetch assignments failed:', err);
    }
    return [];
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
      const supaAssignments = await fetchCaseAssignmentsFromSupabase(caseId);
      setCaseAssignments((prev) => ({ ...prev, [caseId]: supaAssignments }));
    }
  };

  const handleAssign = async (caseId: string) => {
    if (!assignUserId.trim()) return;
    setAssignError(null);
    const targetUserId = assignUserId.trim();
    let assigned = false;

    // 1. Try FastAPI backend
    try {
      await apiFetch(`/admin/cases/${caseId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ user_id: targetUserId }),
      });
      assigned = true;
    } catch (backendErr) {
      console.warn('Backend assign failed, attempting Supabase direct fallback:', backendErr);
    }

    // 2. Direct Supabase fallback
    if (!assigned) {
      try {
        const checkRes = await fetch(
          `${SUPABASE_URL}/rest/v1/assignments?case_id=eq.${encodeURIComponent(caseId)}&user_id=eq.${encodeURIComponent(targetUserId)}`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          }
        );
        const existing = checkRes.ok ? await checkRes.json() : [];
        if (existing && existing.length > 0) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/assignments?case_id=eq.${encodeURIComponent(caseId)}&user_id=eq.${encodeURIComponent(targetUserId)}`,
            {
              method: 'PATCH',
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ is_active: true }),
            }
          );
        } else {
          await fetch(`${SUPABASE_URL}/rest/v1/assignments`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify({
              id: `asgn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              user_id: targetUserId,
              case_id: caseId,
              is_active: true,
            }),
          });
        }
        assigned = true;
      } catch (supaErr: any) {
        setAssignError(supaErr.message || 'Failed to assign official');
        return;
      }
    }

    // 3. Reload assignments
    try {
      let assignments: any[] = [];
      try {
        assignments = await apiFetch<any[]>(`/admin/cases/${caseId}/assignments`);
      } catch {
        assignments = await fetchCaseAssignmentsFromSupabase(caseId);
      }
      setCaseAssignments((prev) => ({ ...prev, [caseId]: assignments }));
      setAssignUserId('');
      await loadAdminData();
    } catch (err: any) {
      setAssignError(err.message || 'Failed to refresh assignments');
    }
  };

  const handleRevoke = async (caseId: string, userId: string) => {
    let revoked = false;
    try {
      await apiFetch(`/admin/cases/${caseId}/assign/${userId}`, { method: 'DELETE' });
      revoked = true;
    } catch {
      try {
        await fetch(
          `${SUPABASE_URL}/rest/v1/assignments?case_id=eq.${encodeURIComponent(caseId)}&user_id=eq.${encodeURIComponent(userId)}`,
          {
            method: 'PATCH',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_active: false }),
          }
        );
        revoked = true;
      } catch (supaErr: any) {
        showAppToast(supaErr.message || 'Failed to revoke assignment', 'error');
        return;
      }
    }

    try {
      let assignments: any[] = [];
      try {
        assignments = await apiFetch<any[]>(`/admin/cases/${caseId}/assignments`);
      } catch {
        assignments = await fetchCaseAssignmentsFromSupabase(caseId);
      }
      setCaseAssignments((prev) => ({ ...prev, [caseId]: assignments }));
      await loadAdminData();
      showAppToast('Official assignment revoked successfully', 'success');
    } catch (err: any) {
      showAppToast(err.message || 'Failed to revoke assignment', 'error');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);
    setUserFormLoading(true);
    const officialId = userForm.user_id.trim();
    try {
      // Step 1: Enforce on-chain official enrollment on Polygon Amoy via MetaMask wallet popup
      const { txHash, explorerUrl } = await anchorOfficialOnChain({
        userId: officialId,
        username: userForm.username,
        role: userForm.role,
        mspId: userForm.msp_id || 'PoliceMSP',
      });
      console.info(`[Chain] anchorOfficialOnChain(${officialId}) confirmed: ${txHash}`);
      showChainToast(officialId, txHash, 'Official Enrolled on Polygon Amoy ✓', 'Official');

      // Step 2: Try backend first, then Supabase with anon key
      let created = false;
      try {
        await apiFetch('/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...userForm, blockchain_tx: txHash }),
        });
        created = true;
      } catch (backendErr: any) {
        console.warn('Backend create user failed, enrolling via Supabase REST:', backendErr);
      }

      if (!created) {
        const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            id: userForm.user_id,
            username: userForm.username,
            full_name: userForm.full_name,
            role: userForm.role,
            msp_id: userForm.msp_id || 'PoliceMSP',
            password_hash: `hash_${btoa(userForm.password || 'temporary123').slice(0, 32)}`,
            totp_secret: '',
            mfa_enrolled: false,
            is_active: true,
          }),
        });
        if (!supaRes.ok) {
          const errText = await supaRes.text();
          throw new Error(`Enrollment Error: ${errText}`);
        }
      }

      // Step 3: Write audit log with immutable on-chain tx reference
      fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'OFFICER_ENROLLED',
          actor_id: 'ADMIN',
          case_id: 'SYSTEM',
          details: JSON.stringify({
            user_id: userForm.user_id,
            username: userForm.username,
            role: userForm.role,
            msp: userForm.msp_id,
            blockchain_tx: txHash,
            explorer_url: explorerUrl,
          }),
          timestamp: new Date().toISOString()
        }),
      }).catch(() => {});

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

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-md w-full glass-ivory border-crimson-gold rounded-3xl p-8 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif-judicial font-bold text-stone-900">Restricted Sovereign Console</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              This module is strictly restricted to verified <span className="font-bold text-rose-800">Root Administrators</span>. Your active account or connected Web3 wallet lacks administrative clearance.
            </p>
          </div>
          <div className="p-3 bg-stone-100 rounded-xl font-mono text-xs text-stone-600 flex items-center justify-between">
            <span>Current Role:</span>
            <span className="font-bold uppercase text-stone-900">{user?.role || 'UNAUTHENTICATED'}</span>
          </div>
          <a
            href="/dossiers"
            className="inline-block w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Return to Authorized Case Dossiers
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Chain Anchor Toast — shown after successful Polygon Amoy TX */}
      {chainToast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, maxWidth: '420px', animation: 'slideInRight 0.3s ease' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a2f 100%)', border: '1px solid #22c55e', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(34,197,94,0.15)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e', marginBottom: '2px' }}>{chainToast.title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{chainToast.label} <strong style={{ color: '#e2e8f0' }}>{chainToast.id}</strong> is permanently on-chain</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginBottom: '10px', wordBreak: 'break-all' }}>TX: {chainToast.txHash}</div>
                <a href={chainToast.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(130,71,229,0.15)', border: '1px solid rgba(130,71,229,0.4)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, color: '#a78bfa', textDecoration: 'none', transition: 'all 0.2s' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  View on Polygonscan
                </a>
              </div>
              <button onClick={() => setChainToast(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', lineHeight: 1 }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* App Notification Toast — clean modern banner replacing browser alert() */}
      {appToast && (
        <div style={{ position: 'fixed', top: chainToast ? '160px' : '20px', right: '20px', zIndex: 9998, maxWidth: '420px', animation: 'slideInRight 0.3s ease' }}>
          <div style={{
            background: appToast.type === 'success' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #450a0a 0%, #1e1b1b 100%)',
            border: `1px solid ${appToast.type === 'success' ? '#22c55e' : '#f43f5e'}`,
            borderRadius: '14px',
            padding: '14px 18px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: appToast.type === 'success' ? '#22c55e' : '#f43f5e', fontWeight: 'bold' }}>
                {appToast.type === 'success' ? '✓' : '⚠'}
              </span>
              <span>{appToast.message}</span>
            </div>
            <button onClick={() => setAppToast(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', lineHeight: 1 }}>✕</button>
          </div>
        </div>
      )}

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

      {/* ── Cascading Sovereign AI Gateway & Model Governance (ADMIN ONLY) ──────────── */}
      <div id="ai-gateway" className="glass-ivory border-crimson-gold rounded-3xl p-6 sm:p-7 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-crimson-50 border border-crimson-200 rounded-2xl text-crimson-800 shadow-sm">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif-judicial font-bold text-stone-900">
                  Cascading AI Gateway & Model Governance
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  ROOT ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Configure 4-tier failover reasoning models and manage cryptographic API keys. Other judicial roles cannot view or edit these secrets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAIKeys}
              className="flex items-center gap-1.5 px-4 py-2 bg-crimson-800 hover:bg-crimson-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {aiSaveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{aiSaveSuccess ? 'Vault Updated!' : 'Save AI Gateway Keys'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveAIKeys} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tier 1: GPT-6 Astra */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold font-serif-judicial text-stone-900">Tier 1: GPT-6 Astra (Primary)</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                openai/gpt-6-astra
              </span>
            </div>
            <div className="relative">
              <input
                type={showKeys.t1 ? 'text' : 'password'}
                value={tier1Key}
                onChange={(e) => setTier1Key(e.target.value)}
                placeholder="Enter GPT-6 Astra API Key..."
                className="w-full pl-3 pr-20 py-2.5 text-xs font-mono bg-parchment-50/70 border border-stone-200 rounded-xl focus:outline-none focus:border-crimson-700 shadow-xs"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKeys(s => ({ ...s, t1: !s.t1 }))}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                  title="Toggle Visibility"
                >
                  {showKeys.t1 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleTestTier('tier1')}
                  disabled={testingTier === 'tier1'}
                  className="px-2 py-1 text-[10px] font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md border border-stone-200 transition-colors"
                  title="Run Diagnostic Ping"
                >
                  {testingTier === 'tier1' ? 'Pinging...' : 'Ping'}
                </button>
              </div>
            </div>
            {testResults['tier1'] && (
              <div className={`text-[11px] font-mono flex items-center gap-1.5 ${testResults['tier1'].ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                {testResults['tier1'].ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{testResults['tier1'].message}</span>
              </div>
            )}
          </div>

          {/* Tier 2: Grok 4.6 */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold font-serif-judicial text-stone-900">Tier 2: Grok 4.6 (Failover 1)</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                x-ai/grok-4.6
              </span>
            </div>
            <div className="relative">
              <input
                type={showKeys.t2 ? 'text' : 'password'}
                value={tier2Key}
                onChange={(e) => setTier2Key(e.target.value)}
                placeholder="Enter Grok 4.6 API Key..."
                className="w-full pl-3 pr-20 py-2.5 text-xs font-mono bg-parchment-50/70 border border-stone-200 rounded-xl focus:outline-none focus:border-crimson-700 shadow-xs"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKeys(s => ({ ...s, t2: !s.t2 }))}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                  title="Toggle Visibility"
                >
                  {showKeys.t2 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleTestTier('tier2')}
                  disabled={testingTier === 'tier2'}
                  className="px-2 py-1 text-[10px] font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md border border-stone-200 transition-colors"
                  title="Run Diagnostic Ping"
                >
                  {testingTier === 'tier2' ? 'Pinging...' : 'Ping'}
                </button>
              </div>
            </div>
            {testResults['tier2'] && (
              <div className={`text-[11px] font-mono flex items-center gap-1.5 ${testResults['tier2'].ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                {testResults['tier2'].ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{testResults['tier2'].message}</span>
              </div>
            )}
          </div>

          {/* Tier 3: Nemotron 3 Ultra */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-bold font-serif-judicial text-stone-900">Tier 3: Nemotron 3 Ultra (Failover 2)</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                nvidia/nemotron-3-ultra-550b
              </span>
            </div>
            <div className="relative">
              <input
                type={showKeys.t3 ? 'text' : 'password'}
                value={tier3Key}
                onChange={(e) => setTier3Key(e.target.value)}
                placeholder="Enter Nemotron 3 Ultra API Key..."
                className="w-full pl-3 pr-20 py-2.5 text-xs font-mono bg-parchment-50/70 border border-stone-200 rounded-xl focus:outline-none focus:border-crimson-700 shadow-xs"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKeys(s => ({ ...s, t3: !s.t3 }))}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                  title="Toggle Visibility"
                >
                  {showKeys.t3 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleTestTier('tier3')}
                  disabled={testingTier === 'tier3'}
                  className="px-2 py-1 text-[10px] font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md border border-stone-200 transition-colors"
                  title="Run Diagnostic Ping"
                >
                  {testingTier === 'tier3' ? 'Pinging...' : 'Ping'}
                </button>
              </div>
            </div>
            {testResults['tier3'] && (
              <div className={`text-[11px] font-mono flex items-center gap-1.5 ${testResults['tier3'].ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                {testResults['tier3'].ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{testResults['tier3'].message}</span>
              </div>
            )}
          </div>

          {/* Tier 4: Gemini 3.8 Flash */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-xs font-bold font-serif-judicial text-stone-900">Tier 4: Gemini 3.8 Flash (Failover 3)</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                google/gemini-3.8-flash
              </span>
            </div>
            <div className="relative">
              <input
                type={showKeys.t4 ? 'text' : 'password'}
                value={tier4Key}
                onChange={(e) => setTier4Key(e.target.value)}
                placeholder="Enter Gemini 3.8 Flash API Key..."
                className="w-full pl-3 pr-20 py-2.5 text-xs font-mono bg-parchment-50/70 border border-stone-200 rounded-xl focus:outline-none focus:border-crimson-700 shadow-xs"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKeys(s => ({ ...s, t4: !s.t4 }))}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                  title="Toggle Visibility"
                >
                  {showKeys.t4 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleTestTier('tier4')}
                  disabled={testingTier === 'tier4'}
                  className="px-2 py-1 text-[10px] font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md border border-stone-200 transition-colors"
                  title="Run Diagnostic Ping"
                >
                  {testingTier === 'tier4' ? 'Pinging...' : 'Ping'}
                </button>
              </div>
            </div>
            {testResults['tier4'] && (
              <div className={`text-[11px] font-mono flex items-center gap-1.5 ${testResults['tier4'].ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                {testResults['tier4'].ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{testResults['tier4'].message}</span>
              </div>
            )}
          </div>
        </form>

        <div className="p-3.5 bg-parchment-100/70 rounded-2xl border border-stone-200 flex items-center justify-between text-xs text-stone-600 font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-crimson-800" />
            <span>Zero-Trust Enforced: Non-admin roles (Investigator, Forensic Analyst, Prosecutor) are barred from viewing this gateway.</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            ZERO-LEAKAGE ACTIVE
          </span>
        </div>
      </div>

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

        {/* Role Change Confirmation Modal */}
        {roleChangeTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-ivory border border-stone-300 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-crimson-50 border border-crimson-200 text-crimson-800 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif-judicial font-bold text-stone-900">Authorize On-Chain Role Change</h3>
                    <p className="text-[11px] text-stone-500 font-mono">Polygon Amoy Testnet (Chain ID 80002)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { if (!roleChangeSubmitting) setRoleChangeTarget(null); }}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {roleChangeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {roleChangeError}
                </div>
              )}

              <div className="p-4 bg-parchment-100/80 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-mono">Official ID:</span>
                  <span className="font-bold font-mono text-stone-900">{roleChangeTarget.user.id} ({roleChangeTarget.user.username})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Current Role:</span>
                  <span className="font-bold text-stone-700 px-2 py-0.5 bg-white border border-stone-200 rounded-lg text-[11px]">{roleChangeTarget.user.role}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Proposed New Role:</span>
                  <span className="font-bold text-crimson-800 px-2 py-0.5 bg-crimson-50 border border-crimson-200 rounded-lg text-[11px]">{roleChangeTarget.newRole}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">New Clearance Ceiling:</span>
                  <span className="font-bold text-emerald-800 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px]">
                    {ROLE_CLEARANCE[roleChangeTarget.newRole]?.level || 'STANDARD'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Statutory Justification / Reassignment Order *
                </label>
                <textarea
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                  rows={2}
                  disabled={roleChangeSubmitting}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-crimson-700 shadow-sm"
                  placeholder="Enter statutory justification for audit trail..."
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-stone-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>Enforces Web3 wallet signature & records immutable audit record on Polygon Amoy.</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold ml-2">METAMASK</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleChangeTarget(null)}
                  disabled={roleChangeSubmitting}
                  className="px-4 py-2 border border-stone-300 hover:bg-parchment-100 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRoleChange}
                  disabled={roleChangeSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-crimson-800 hover:bg-crimson-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {roleChangeSubmitting ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Awaiting MetaMask & Anchoring...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Sign & Anchor Role on Polygon Amoy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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
              <div className="sm:col-span-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-stone-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>On-Chain Official Registration: Enrolling invokes <strong>ProvenanceRegistry</strong> on <strong>Polygon Amoy (80002)</strong> via MetaMask.</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold ml-2">METAMASK REQUIRED</span>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={userFormLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-crimson-800 hover:bg-crimson-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  {userFormLoading ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Awaiting MetaMask & Anchoring...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Enroll & Anchor Official</span>
                    </>
                  )}
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
                  <th className="p-3.5">On-Chain</th>
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
                          onChange={(e) => handleInitiateRoleChange(u, e.target.value)}
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
                        <a
                          href={`${POLYGONSCAN_BASE}/address/${PROVENANCE_REGISTRY_ADDR}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          title={`Anchored on Polygon Amoy ProvenanceRegistry (${PROVENANCE_REGISTRY_ADDR})`}
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>POLYGON</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </td>
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
