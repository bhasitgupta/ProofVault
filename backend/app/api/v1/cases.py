from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime

from app.db.session import get_db
from app.db.models.case import Case
from app.db.models.assignment import Assignment
from app.db.models.document import Document
from app.deps import get_current_user
from app.core.constants import ClassificationLevel, UserRole

router = APIRouter(prefix="/cases", tags=["cases"])

SUPERVISOR_ROLES = {UserRole.SUPERVISOR.value, UserRole.ADMIN.value}


class CreateCaseRequest(BaseModel):
    case_id: str = Field(..., min_length=3, max_length=64)
    title: str = Field(..., min_length=3, max_length=256)
    description: Optional[str] = None
    classification_ceiling: str = Field(default="CONFIDENTIAL")
    owning_msp: Optional[str] = None


class AssignUserRequest(BaseModel):
    user_id: str
    case_id: str


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_case(
    req: CreateCaseRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Create a new case. Only SUPERVISOR or ADMIN may do this."""
    if current_user["role"] not in SUPERVISOR_ROLES:
        raise HTTPException(status_code=403, detail="Only supervisors can create cases")

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
        owning_msp=req.owning_msp or current_user["msp_id"],
    )
    session.add(case)
    await session.commit()
    return {"case_id": case.case_id, "title": case.title, "status": case.status}


@router.get("", response_model=List[dict])
async def list_cases(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """List all cases the current user is assigned to (with fallback in demo mode)."""
    live_ids = current_user.get("live_case_ids") or []
    if live_ids:
        result = await session.execute(select(Case).where(Case.case_id.in_(live_ids)))
        cases = result.scalars().all()
    else:
        result = await session.execute(select(Case))
        cases = result.scalars().all()

    # Calculate active document count per case
    enriched = []
    for c in cases:
        doc_count_res = await session.execute(
            select(Document).where(Document.case_id == c.case_id, Document.status == "ACTIVE")
        )
        doc_count = len(doc_count_res.scalars().all())

        enriched.append({
            "case_id": c.case_id,
            "title": c.title,
            "description": c.description or "",
            "status": c.status,
            "classification_ceiling": c.classification_ceiling,
            "owning_msp": c.owning_msp,
            "active_document_count": doc_count,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })

    return enriched


@router.get("/{case_id}")
async def get_case(
    case_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get case details including document count."""
    if case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not assigned to this case")

    result = await session.execute(select(Case).where(Case.case_id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Count documents
    doc_count_res = await session.execute(
        select(Document).where(Document.case_id == case_id, Document.status == "ACTIVE")
    )
    doc_count = len(doc_count_res.scalars().all())

    return {
        "case_id": case.case_id,
        "title": case.title,
        "description": case.description,
        "status": case.status,
        "classification_ceiling": case.classification_ceiling,
        "owning_msp": case.owning_msp,
        "active_document_count": doc_count,
        "created_at": case.created_at.isoformat() if case.created_at else None,
    }


@router.post("/{case_id}/assign")
async def assign_user(
    case_id: str,
    req: AssignUserRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Assign a user to a case. Only SUPERVISOR can do this."""
    if current_user["role"] not in SUPERVISOR_ROLES:
        raise HTTPException(status_code=403, detail="Only supervisors can assign users")

    # Check case exists
    case_res = await session.execute(select(Case).where(Case.case_id == case_id))
    if not case_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Case not found")

    # Upsert assignment
    existing = await session.execute(
        select(Assignment).where(
            Assignment.user_id == req.user_id,
            Assignment.case_id == case_id,
        )
    )
    assign = existing.scalar_one_or_none()
    if assign:
        assign.is_active = True
    else:
        assign = Assignment(user_id=req.user_id, case_id=case_id, is_active=True)
        session.add(assign)

    await session.commit()
    return {"user_id": req.user_id, "case_id": case_id, "assigned": True}


@router.delete("/{case_id}/assign/{user_id}")
async def revoke_assignment(
    case_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Revoke a user's assignment to a case."""
    if current_user["role"] not in SUPERVISOR_ROLES:
        raise HTTPException(status_code=403, detail="Only supervisors can revoke assignments")

    result = await session.execute(
        select(Assignment).where(
            Assignment.user_id == user_id,
            Assignment.case_id == case_id,
        )
    )
    assign = result.scalar_one_or_none()
    if not assign:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assign.is_active = False
    await session.commit()
    return {"user_id": user_id, "case_id": case_id, "revoked": True}
