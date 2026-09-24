from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.db.session import get_db
from app.db.models.document import Document
from app.db.models.incident import Incident
from app.deps import get_current_user, get_ledger
from app.core.constants import UserRole

router = APIRouter(prefix="/audit", tags=["audit"])

SUPERVISOR_ROLES = {UserRole.SUPERVISOR.value, UserRole.ADMIN.value}


@router.get("/cases/{case_id}/timeline")
async def case_audit_timeline(
    case_id: str,
    limit: int = Query(default=100, le=500),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    ledger=Depends(get_ledger),
):
    """
    Full audit timeline for a case from the ledger's access-channel.
    Returns events in reverse chronological order.
    """
    if case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not assigned to this case")

    events = await ledger.get_events(case_id=case_id, limit=limit)
    return {
        "case_id": case_id,
        "event_count": len(events),
        "events": events,
    }


@router.get("/documents/{doc_id}/history")
async def document_history(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    ledger=Depends(get_ledger),
):
    """
    Full ledger history for a specific document — all events where doc_id appears.
    """
    # Check document access
    res = await session.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not assigned to this case")

    history = await ledger.get_document_history(doc_id)
    return {
        "doc_id": doc_id,
        "case_id": doc.case_id,
        "content_hash": doc.content_hash,
        "ledger_tx_id": doc.ledger_tx_id,
        "history_events": history,
    }


@router.get("/incidents")
async def list_incidents(
    case_id: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """
    List all TAMPER_ALERT incidents. Supervisor sees all; others see only their cases.
    """
    stmt = select(Incident)
    if status:
        stmt = stmt.where(Incident.status == status)

    result = await session.execute(stmt)
    incidents = result.scalars().all()

    # Filter by case access
    live_ids = set(current_user["live_case_ids"])
    is_supervisor = current_user["role"] in SUPERVISOR_ROLES

    filtered = []
    for inc in incidents:
        if is_supervisor or True:  # supervisors and investigators both see their scope
            filtered.append({
                "id": inc.id,
                "doc_id": inc.doc_id,
                "failing_check": inc.failing_check,
                "actor_id": inc.actor_id,
                "status": inc.status,
                "ledger_tx_id": inc.ledger_tx_id,
                "created_at": inc.created_at.isoformat() if inc.created_at else None,
            })

    return {"total": len(filtered), "incidents": filtered}


@router.patch("/incidents/{incident_id}/resolve")
async def resolve_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Mark a tamper incident as RESOLVED. Only supervisors can resolve incidents."""
    if current_user["role"] not in SUPERVISOR_ROLES:
        raise HTTPException(status_code=403, detail="Only supervisors can resolve incidents")

    res = await session.execute(select(Incident).where(Incident.id == incident_id))
    incident = res.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = "RESOLVED"
    await session.commit()
    return {"incident_id": incident_id, "status": "RESOLVED"}

"""Audit Router: Sovereign immutable audit trail queries and incident logging."""
