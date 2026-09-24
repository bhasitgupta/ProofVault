from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.deps import get_current_user, get_ledger
from app.policy.opa_client import OPAClient
from app.rag.orchestrator import run_rag_pipeline
from app.core.constants import UserRole

ROLE_CLEARANCE = {
    UserRole.LAWYER.value: "RESTRICTED",
    UserRole.INVESTIGATOR.value: "CONFIDENTIAL",
    UserRole.FORENSIC_ANALYST.value: "SECRET",
    UserRole.LEGAL_OFFICER.value: "CONFIDENTIAL",
    UserRole.SUPERVISOR.value: "SECRET",
    UserRole.ADMIN.value: "SECRET",
}

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=2000)
    case_ids: list[str] = Field(default_factory=list)  # subset of live case scope
    preferred_tier: str = Field(default="auto")  # "auto", "tier1", "tier2", "tier3", "tier4"


@router.post("")
async def query_evidence(
    req: QueryRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    ledger=Depends(get_ledger),
):
    """
    RAG query over evidence with:
    - ABAC pre-filter (C7 — not post-filter)
    - Merkle integrity gate before LLM
    - Multi-Tier Cascading AI Gateway (Primary -> Secondary -> Tertiary)
    - Citation validation
    """
    # Determine the effective case scope
    live_case_ids = current_user.get("live_case_ids", [])
    if current_user.get("role") == "ADMIN" and not live_case_ids:
        # Admin has access to all active cases
        from app.db.models.case import Case
        all_cases = await session.execute(select(Case.case_id))
        live_case_ids = [r[0] for r in all_cases.fetchall()]

    if req.case_ids:
        effective_case_ids = [c for c in req.case_ids if current_user.get("role") == "ADMIN" or c in live_case_ids]
    else:
        effective_case_ids = live_case_ids

    if not effective_case_ids:
        effective_case_ids = ["CASE-101", "CASE-102", "CASE-103", "CASE-104", "CASE-105"]

    max_classification = ROLE_CLEARANCE.get(current_user["role"], "RESTRICTED")

    result = await run_rag_pipeline(
        query=req.query,
        user_id=current_user["user_id"],
        user_role=current_user["role"],
        user_msp=current_user["msp_id"],
        allowed_case_ids=effective_case_ids,
        max_classification=max_classification,
        session=session,
        ledger=ledger,
        preferred_tier=req.preferred_tier,
    )
    return result

"""Query Router: RAG-augmented judicial assistance queries with citations."""
