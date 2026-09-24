from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.document import Document
from app.db.models.audit_log import AuditLog
from app.deps import get_current_user, get_ledger, get_vault
from app.integrity.verifier import verify_document_integrity

router = APIRouter(tags=["verify/audit/health"])


@router.get("/verify/{doc_id}")
async def verify_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    ledger=Depends(get_ledger),
    vault=Depends(get_vault),
):
    """Full Tier 3+4 verification of a document against the ledger."""
    stmt = select(Document).where(Document.id == doc_id)
    result = await session.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not assigned to this case")

    vr = await verify_document_integrity(
        doc_id=doc_id,
        on_chain_blob_hash=doc.blob_hash,
        on_chain_content_hash=doc.content_hash,
        wrapped_dek=doc.wrapped_dek,
        nonce_hex=doc.nonce_hex,
        vault=vault,
        case_id=doc.case_id,
        ledger=ledger,
    )

    return {
        "doc_id": doc_id,
        "overall": vr.overall,
        "blob_hash_ok": vr.blob_hash_ok,
        "content_hash_ok": vr.content_hash_ok,
        "failing_check": vr.failing_check,
        "ledger_tx_id": vr.ledger_tx_id,
    }


@router.get("/case-audit/{case_id}")
async def get_audit_trail(
    case_id: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    ledger=Depends(get_ledger),
):
    """Return recent audit events for a case from the ledger."""
    if case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not assigned to this case")

    events = await ledger.get_events(case_id=case_id, limit=limit)
    return {"case_id": case_id, "events": events}


@router.get("/health")
async def health():
    """Health check for the API server."""
    return {"status": "ok", "service": "SDMS API v1"}

"""Verify Router: Cryptographic evidence integrity verification against ledger."""
