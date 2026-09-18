from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.case import Case
from app.db.models.assignment import Assignment
from app.db.models.document import Document
from app.deps import get_current_user
from app.core.security import hash_password
from app.core.mfa import generate_totp_secret
from app.core.constants import UserRole, ClassificationLevel

router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_ONLY = {UserRole.ADMIN.value}


def require_admin(current_user: dict):
    if current_user["role"] not in ADMIN_ONLY:
        raise HTTPException(status_code=403, detail="ADMIN role required")


class CreateUserRequest(BaseModel):
    user_id: str = Field(..., min_length=3)
    username: str = Field(..., min_length=3)
    full_name: str
    role: str
    msp_id: Optional[str] = None
    password: str = Field(..., min_length=8)


@router.get("/stats")
async def system_stats(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """System-wide statistics. ADMIN only."""
    require_admin(current_user)

    user_count = (await session.execute(func.count(User.id))).scalar()
    case_count = (await session.execute(func.count(Case.case_id))).scalar()
    doc_count = (await session.execute(func.count(Document.id))).scalar()

    return {
        "total_users": user_count,
        "total_cases": case_count,
        "total_documents": doc_count,
    }


@router.get("/users")
async def list_users(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """List all users. ADMIN only."""
    require_admin(current_user)
    result = await session.execute(select(User))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "mfa_enrolled": u.mfa_enrolled,
            "msp_id": u.msp_id,
        }
        for u in users
    ]


@router.post("/users", status_code=201)
async def create_user(
    req: CreateUserRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Create a new system user. ADMIN only."""
    require_admin(current_user)

    valid_roles = {r.value for r in UserRole}
    if req.role not in valid_roles:
        raise HTTPException(status_code=422, detail=f"Invalid role. Must be one of: {valid_roles}")

    existing = await session.execute(select(User).where(User.username == req.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Username {req.username!r} already exists")

    user = User(
        id=req.user_id,
        username=req.username,
        full_name=req.full_name,
        role=req.role,
        password_hash=hash_password(req.password),
        totp_secret=generate_totp_secret(),
        mfa_enrolled=False,
        is_active=True,
        msp_id=req.msp_id or "default-msp",
    )
    session.add(user)
    await session.commit()
    return {"user_id": user.id, "username": user.username, "role": user.role}


@router.patch("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Deactivate a user account. ADMIN only."""
    require_admin(current_user)
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await session.commit()
    return {"user_id": user_id, "is_active": False}


@router.patch("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Reactivate a user account. ADMIN only."""
    require_admin(current_user)
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    await session.commit()
    return {"user_id": user_id, "is_active": True}


# ── Role & Access Policy Management ──────────────────────────────────────────

class UpdateUserRoleRequest(BaseModel):
    role: str


class UpdateRolePolicyRequest(BaseModel):
    clearance_ceiling: str
    description: Optional[str] = None
    can_download: Optional[bool] = True
    can_issue_cert: Optional[bool] = True
    can_query_rag: Optional[bool] = True
    can_ingest: Optional[bool] = True


class BulkRoleCaseAccessRequest(BaseModel):
    case_id: str
    action: str = Field(..., pattern="^(ASSIGN|REVOKE)$")


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    req: UpdateUserRoleRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Change an officer's role. ADMIN only."""
    require_admin(current_user)
    valid_roles = {r.value for r in UserRole}
    if req.role not in valid_roles:
        raise HTTPException(status_code=422, detail=f"Invalid role. Must be one of: {valid_roles}")

    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = user.role
    user.role = req.role
    await session.commit()
    return {
        "user_id": user.id,
        "username": user.username,
        "old_role": old_role,
        "new_role": user.role,
        "updated": True,
    }


@router.get("/roles")
async def list_roles(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """List all system roles and their effective clearance policy. ADMIN only."""
    require_admin(current_user)
    from app.policy.opa_client import get_all_role_clearances
    from app.db.models.role_policy import RolePolicy

    clearance_map = get_all_role_clearances()
    db_policies = (await session.execute(select(RolePolicy))).scalars().all()
    policy_dict = {p.role: p for p in db_policies}

    all_users = (await session.execute(select(User))).scalars().all()
    users_by_role: dict = {}
    for u in all_users:
        users_by_role.setdefault(u.role, []).append({
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "is_active": u.is_active,
        })

    DEFAULT_ROLE_DESCRIPTIONS = {
        "ADMIN": "System Administrator with full operational oversight and access to all cases and evidence.",
        "SUPERVISOR": "Supervisory Officer with oversight across assigned cases and access to Secret intelligence.",
        "FORENSIC_ANALYST": "Technical Forensic Specialist with access to Secret forensic artifacts and laboratory reports.",
        "INVESTIGATOR": "Field Investigating Officer with access to Restricted and Confidential evidence in assigned cases.",
        "LEGAL_OFFICER": "Prosecution and Legal Counsel with access to Confidential case dossiers and charge-sheets.",
        "LAWYER": "External Defense / Legal Counsel with restricted access to disclosable evidence records only.",
    }

    result = []
    for r in UserRole:
        role_name = r.value
        policy = policy_dict.get(role_name)
        clearance = clearance_map.get(role_name, "RESTRICTED")
        officers = users_by_role.get(role_name, [])

        result.append({
            "role": role_name,
            "clearance_ceiling": clearance,
            "description": policy.description if policy and policy.description else DEFAULT_ROLE_DESCRIPTIONS.get(role_name, ""),
            "can_download": policy.can_download if policy else (role_name != "LAWYER"),
            "can_issue_cert": policy.can_issue_cert if policy else (role_name in ("ADMIN", "SUPERVISOR", "INVESTIGATOR", "FORENSIC_ANALYST")),
            "can_query_rag": policy.can_query_rag if policy else True,
            "can_ingest": policy.can_ingest if policy else (role_name in ("ADMIN", "SUPERVISOR", "INVESTIGATOR", "FORENSIC_ANALYST")),
            "officer_count": len(officers),
            "officers": officers,
        })

    return result


@router.put("/roles/{role_name}")
async def update_role_policy(
    role_name: str,
    req: UpdateRolePolicyRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Update role clearance ceiling and access capabilities. ADMIN only."""
    require_admin(current_user)
    valid_roles = {r.value for r in UserRole}
    if role_name not in valid_roles:
        raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found")

    valid_cls = {c.value for c in ClassificationLevel}
    if req.clearance_ceiling not in valid_cls:
        raise HTTPException(status_code=422, detail=f"Invalid classification ceiling. Must be one of: {valid_cls}")

    from app.policy.opa_client import set_role_clearance
    from app.db.models.role_policy import RolePolicy

    set_role_clearance(role_name, req.clearance_ceiling)

    policy_res = await session.execute(select(RolePolicy).where(RolePolicy.role == role_name))
    policy = policy_res.scalar_one_or_none()
    if not policy:
        policy = RolePolicy(
            role=role_name,
            clearance_ceiling=req.clearance_ceiling,
            description=req.description or "",
            can_download=req.can_download if req.can_download is not None else True,
            can_issue_cert=req.can_issue_cert if req.can_issue_cert is not None else True,
            can_query_rag=req.can_query_rag if req.can_query_rag is not None else True,
            can_ingest=req.can_ingest if req.can_ingest is not None else True,
        )
        session.add(policy)
    else:
        policy.clearance_ceiling = req.clearance_ceiling
        if req.description is not None:
            policy.description = req.description
        if req.can_download is not None:
            policy.can_download = req.can_download
        if req.can_issue_cert is not None:
            policy.can_issue_cert = req.can_issue_cert
        if req.can_query_rag is not None:
            policy.can_query_rag = req.can_query_rag
        if req.can_ingest is not None:
            policy.can_ingest = req.can_ingest

    await session.commit()
    return {
        "role": role_name,
        "clearance_ceiling": req.clearance_ceiling,
        "description": policy.description,
        "can_download": policy.can_download,
        "can_issue_cert": policy.can_issue_cert,
        "can_query_rag": policy.can_query_rag,
        "can_ingest": policy.can_ingest,
        "updated": True,
    }


@router.post("/roles/{role_name}/case-access")
async def bulk_role_case_access(
    role_name: str,
    req: BulkRoleCaseAccessRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Bulk assign or revoke all officers of a particular role to/from a case. ADMIN only."""
    require_admin(current_user)

    case_res = await session.execute(select(Case).where(Case.case_id == req.case_id))
    if not case_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Case not found")

    officers = (await session.execute(select(User).where(User.role == role_name, User.is_active == True))).scalars().all()
    if not officers:
        return {"role": role_name, "case_id": req.case_id, "affected_officers": 0, "action": req.action}

    officer_ids = [u.id for u in officers]
    count = 0

    if req.action == "ASSIGN":
        for u in officers:
            existing = await session.execute(
                select(Assignment).where(Assignment.user_id == u.id, Assignment.case_id == req.case_id)
            )
            assign = existing.scalar_one_or_none()
            if assign:
                assign.is_active = True
            else:
                session.add(Assignment(user_id=u.id, case_id=req.case_id, is_active=True))
            count += 1
    else:  # REVOKE
        existing_list = (await session.execute(
            select(Assignment).where(Assignment.user_id.in_(officer_ids), Assignment.case_id == req.case_id)
        )).scalars().all()
        for assign in existing_list:
            assign.is_active = False
            count += 1

    await session.commit()
    return {
        "role": role_name,
        "case_id": req.case_id,
        "action": req.action,
        "affected_officers": count,
    }


# ── Case Management ────────────────────────────────────────────────────────────

class CreateCaseRequest(BaseModel):
    case_id: str = Field(..., min_length=3, max_length=64)
    title: str = Field(..., min_length=3, max_length=256)
    description: Optional[str] = None
    classification_ceiling: str = Field(default="CONFIDENTIAL")
    owning_msp: Optional[str] = None


class AssignUserRequest(BaseModel):
    user_id: str


@router.get("/cases")
async def admin_list_cases(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """List all cases in the system. ADMIN only."""
    require_admin(current_user)
    result = await session.execute(select(Case))
    cases = result.scalars().all()
    return [
        {
            "case_id": c.case_id,
            "title": c.title,
            "description": c.description,
            "status": c.status,
            "classification_ceiling": c.classification_ceiling,
            "owning_msp": c.owning_msp,
        }
        for c in cases
    ]


@router.post("/cases", status_code=201)
async def admin_create_case(
    req: CreateCaseRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Create a new case. ADMIN only."""
    require_admin(current_user)

    valid_cls = {c.value for c in ClassificationLevel}
    if req.classification_ceiling not in valid_cls:
        raise HTTPException(status_code=422, detail=f"Invalid classification. Must be one of: {valid_cls}")

    existing = await session.execute(select(Case).where(Case.case_id == req.case_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Case {req.case_id} already exists")

    case = Case(
        case_id=req.case_id,
        title=req.title,
        description=req.description or "",
        classification_ceiling=req.classification_ceiling,
        status="OPEN",
        owning_msp=req.owning_msp or "PoliceMSP",
    )
    session.add(case)
    await session.commit()
    return {"case_id": case.case_id, "title": case.title, "status": case.status}


@router.get("/cases/{case_id}/assignments")
async def admin_list_assignments(
    case_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """List all user assignments for a case. ADMIN only."""
    require_admin(current_user)
    result = await session.execute(
        select(Assignment, User)
        .join(User, Assignment.user_id == User.id)
        .where(Assignment.case_id == case_id)
    )
    rows = result.all()
    return [
        {
            "user_id": a.user_id,
            "username": u.username,
            "role": u.role,
            "is_active": a.is_active,
        }
        for a, u in rows
    ]


@router.post("/cases/{case_id}/assign", status_code=201)
async def admin_assign_user(
    case_id: str,
    req: AssignUserRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Assign a user to a case. ADMIN only."""
    require_admin(current_user)

    case_res = await session.execute(select(Case).where(Case.case_id == case_id))
    if not case_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Case not found")

    existing = await session.execute(
        select(Assignment).where(Assignment.user_id == req.user_id, Assignment.case_id == case_id)
    )
    assign = existing.scalar_one_or_none()
    if assign:
        assign.is_active = True
    else:
        assign = Assignment(user_id=req.user_id, case_id=case_id, is_active=True)
        session.add(assign)

    await session.commit()
    return {"user_id": req.user_id, "case_id": case_id, "assigned": True}


@router.delete("/cases/{case_id}/assign/{user_id}")
async def admin_revoke_assignment(
    case_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Revoke a user's assignment. ADMIN only."""
    require_admin(current_user)

    result = await session.execute(
        select(Assignment).where(Assignment.user_id == user_id, Assignment.case_id == case_id)
    )
    assign = result.scalar_one_or_none()
    if not assign:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assign.is_active = False
    await session.commit()
    return {"user_id": user_id, "case_id": case_id, "revoked": True}
