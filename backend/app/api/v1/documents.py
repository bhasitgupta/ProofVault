from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from app.db.session import get_db
from app.db.models.document import Document
from app.db.models.chunk import Chunk
from app.deps import get_current_user, get_ledger, get_vault
from app.ingest.pipeline import run_ingestion_pipeline
from app.policy.opa_client import OPAClient
from app.core.constants import ClassificationLevel
from app.crypto.envelope import decrypt_blob
from app.storage.object_store import ObjectStore

router = APIRouter(prefix="/documents", tags=["documents"])
_store = ObjectStore()

# Max upload 100 MB
MAX_UPLOAD_BYTES = 100 * 1024 * 1024


@router.get("", response_model=List[dict])
async def list_documents(
    case_id: Optional[str] = None,
    classification: Optional[str] = None,
    doc_type: Optional[str] = None,
    search: Optional[str] = None,
    accessible_only: bool = True,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """
    List documents with role-based ABAC filtering.
    If accessible_only=True, strictly filters to documents the user has clearance and assignment to view.
    """
    stmt = select(Document).where(Document.status == "ACTIVE")
    if case_id:
        stmt = stmt.where(Document.case_id == case_id)
    if classification:
        stmt = stmt.where(Document.classification == classification)
    if doc_type:
        stmt = stmt.where(Document.doc_type == doc_type)
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            (Document.filename.ilike(search_pattern)) | 
            (Document.id.ilike(search_pattern)) |
            (Document.case_id.ilike(search_pattern))
        )
    stmt = stmt.order_by(Document.created_at.desc())
    result = await session.execute(stmt)
    docs = result.scalars().all()

    opa = OPAClient()
    items = []
    user_role = current_user["role"]
    user_cases = current_user["live_case_ids"]

    for doc in docs:
        is_assigned_case = doc.case_id in user_cases
        can_access = opa.can_access(
            role=user_role,
            doc_classification=doc.classification,
            doc_case_id=doc.case_id,
            user_case_ids=user_cases,
        )

        if accessible_only and not can_access:
            continue

        items.append({
            "doc_id": doc.id,
            "case_id": doc.case_id,
            "filename": doc.filename,
            "doc_type": doc.doc_type,
            "classification": doc.classification,
            "size_bytes": doc.size_bytes,
            "chunk_count": doc.chunk_count,
            "content_hash": doc.content_hash,
            "blob_hash": doc.blob_hash,
            "chunk_merkle_root": doc.chunk_merkle_root,
            "ledger_tx_id": doc.ledger_tx_id,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "status": doc.status,
            "has_access": can_access,
            "access_reason": (
                "Access Granted" if can_access else
                ("Case Unassigned" if not is_assigned_case else f"Clearance Exceeded: {user_role} cannot access {doc.classification}")
            ),
        })

    return items


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    doc_type: str = Form(...),
    classification: str = Form(...),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    ledger=Depends(get_ledger),
):
    """Upload and ingest a document through the full pipeline."""
    # ABAC: Check the user is assigned to this case
    opa = OPAClient()
    if case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not assigned to this case")

    # ABAC: Check classification ceiling
    allowed = opa.can_access(
        role=current_user["role"],
        doc_classification=classification,
        doc_case_id=case_id,
        user_case_ids=current_user["live_case_ids"],
    )
    if not allowed:
        raise HTTPException(status_code=403, detail="Classification ceiling exceeded")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 100 MB)")

    try:
        result = await run_ingestion_pipeline(
            file_bytes=file_bytes,
            filename=file.filename or "upload",
            case_id=case_id,
            doc_type=doc_type,
            classification=classification,
            uploader_id=current_user["user_id"],
            uploader_msp=current_user["msp_id"],
            session=session,
            ledger=ledger,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return result


@router.get("/{doc_id}")
async def get_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get document metadata (not the file)."""
    stmt = select(Document).where(Document.id == doc_id)
    result = await session.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # ABAC: must be on the case
    if doc.case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not assigned to this case")

    return {
        "doc_id": doc.id,
        "case_id": doc.case_id,
        "filename": doc.filename,
        "content_hash": doc.content_hash,
        "blob_hash": doc.blob_hash,
        "chunk_merkle_root": doc.chunk_merkle_root,
        "chunk_count": doc.chunk_count,
        "doc_type": doc.doc_type,
        "classification": doc.classification,
        "size_bytes": doc.size_bytes,
        "status": doc.status,
        "ledger_tx_id": doc.ledger_tx_id,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
    }


@router.get("/{doc_id}/download")
async def download_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    vault=Depends(get_vault),
    ledger=Depends(get_ledger),
):
    """Download and decrypt the document file. Enforces ABAC + logs access."""
    stmt = select(Document).where(Document.id == doc_id)
    result = await session.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not assigned to this case")

    opa = OPAClient()
    if not opa.can_access(
        role=current_user["role"],
        doc_classification=doc.classification,
        doc_case_id=doc.case_id,
        user_case_ids=current_user["live_case_ids"],
    ):
        raise HTTPException(status_code=403, detail="Classification ceiling exceeded")

    # Get ciphertext and decrypt
    try:
        ciphertext = _store.get_blob(doc_id)
        dek = await vault.unwrap_dek(doc.wrapped_dek, doc.case_id)
        nonce = bytes.fromhex(doc.nonce_hex)
        plaintext = decrypt_blob(ciphertext, nonce, dek, doc_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {e}")

    # Audit: ACCESS event
    import uuid, hashlib
    from app.ledger.records import AuditEvent
    from app.core.constants import AuditAction, AuditOutcome
    evt = AuditEvent(
        eventId=str(uuid.uuid4()),
        actorId=current_user["user_id"],
        actorRole=current_user["role"],
        actorMSP=current_user["msp_id"],
        action=AuditAction.DOC_DOWNLOAD.value,
        docIds=[doc_id],
        outcome=AuditOutcome.ALLOW.value,
        reason="Document download",
    )
    await ledger.append_event(evt)

    return Response(
        content=plaintext,
        media_type=doc.mime_type or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{doc.filename}"'},
    )


@router.get("/{doc_id}/preview")
async def preview_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    vault=Depends(get_vault),
):
    """
    Get decrypted text preview and chunk breakdown for a document.
    Strictly verifies role clearance and case assignment.
    """
    stmt = select(Document).where(Document.id == doc_id)
    result = await session.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    opa = OPAClient()
    can_access = opa.can_access(
        role=current_user["role"],
        doc_classification=doc.classification,
        doc_case_id=doc.case_id,
        user_case_ids=current_user["live_case_ids"],
    )
    if not can_access:
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: Role '{current_user['role']}' does not have sufficient clearance to preview '{doc.classification}' evidence."
        )

    # Get chunks from DB
    chunks_stmt = select(Chunk).where(Chunk.doc_id == doc_id).order_by(Chunk.chunk_index)
    chunks_res = await session.execute(chunks_stmt)
    chunks = chunks_res.scalars().all()

    # Try decrypting blob if available
    preview_text = ""
    try:
        ciphertext = _store.get_blob(doc_id)
        dek = await vault.unwrap_dek(doc.wrapped_dek, doc.case_id)
        nonce = bytes.fromhex(doc.nonce_hex)
        plaintext_bytes = decrypt_blob(ciphertext, nonce, dek, doc_id)
        preview_text = plaintext_bytes.decode("utf-8", errors="replace")
    except Exception:
        # Fallback to reconstructing from verified chunks
        if chunks:
            preview_text = "\n\n".join(c.chunk_text for c in chunks)

    return {
        "doc_id": doc.id,
        "case_id": doc.case_id,
        "filename": doc.filename,
        "classification": doc.classification,
        "doc_type": doc.doc_type,
        "size_bytes": doc.size_bytes,
        "content_hash": doc.content_hash,
        "blob_hash": doc.blob_hash,
        "chunk_merkle_root": doc.chunk_merkle_root,
        "ledger_tx_id": doc.ledger_tx_id,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "preview_text": preview_text[:30000],
        "chunk_count": len(chunks),
        "chunks": [
            {
                "chunk_index": c.chunk_index,
                "chunk_hash": c.chunk_hash,
                "page_number": c.page_number,
                "text": c.chunk_text,
            }
            for c in chunks
        ],
    }


"""Documents Router: Evidence exhibit intake, chunking, and metadata retrieval."""
