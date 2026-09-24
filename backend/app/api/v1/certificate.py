import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.document import Document
from app.db.models.certificate import Certificate
from app.deps import get_current_user, get_ledger
from app.legal.bsa_certificate import generate_bsa_certificate
from app.ledger.records import AuditEvent
from app.core.constants import AuditAction, AuditOutcome, UserRole

router = APIRouter(prefix="/certificates", tags=["certificates"])

CERT_ALLOWED_ROLES = {UserRole.LEGAL_OFFICER.value, UserRole.SUPERVISOR.value, UserRole.ADMIN.value}


@router.post("/{doc_id}")
async def issue_certificate(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    ledger=Depends(get_ledger),
):
    """
    Issue a BSA §63 / IEA §65B certificate for a document.
    Only LEGAL_OFFICER, SUPERVISOR, or ADMIN can issue certificates.
    """
    if current_user["role"] not in CERT_ALLOWED_ROLES:
        raise HTTPException(status_code=403, detail="Only Legal Officers or Supervisors may issue certificates")

    # Get the document
    res = await session.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not assigned to this case")

    # Generate BSA certificate
    cert_meta = generate_bsa_certificate(
        doc_id=doc_id,
        case_id=doc.case_id,
        filename=doc.filename,
        content_hash=doc.content_hash,
        blob_hash=doc.blob_hash,
        chunk_merkle_root=doc.chunk_merkle_root,
        chunk_count=doc.chunk_count,
        ledger_tx_id=doc.ledger_tx_id,
        uploader_id=doc.uploader_id,
        issuer_id=current_user["user_id"],
        classification=doc.classification,
        doc_type=doc.doc_type,
        tsa_token_hash=doc.tsa_token_hash or "",
        output_dir="certificates",
    )

    # Register certificate on the access-channel
    evt = AuditEvent(
        eventId=str(uuid.uuid4()),
        actorId=current_user["user_id"],
        actorRole=current_user["role"],
        actorMSP=current_user["msp_id"],
        action=AuditAction.CERTIFICATE_ISSUED.value,
        docIds=[doc_id],
        outcome=AuditOutcome.ALLOW.value,
        reason=f"BSA §63 certificate issued. cert_id={cert_meta['cert_id']}, pdf_hash={cert_meta['pdf_hash']}",
    )
    tx_id = await ledger.append_event(evt)

    # Persist certificate record
    cert_row = Certificate(
        id=cert_meta["cert_id"],
        doc_id=doc_id,
        issuer_id=current_user["user_id"],
        pdf_path=cert_meta["pdf_path"],
        pdf_hash=cert_meta["pdf_hash"],
        ledger_tx_id=tx_id,
    )
    session.add(cert_row)
    await session.commit()

    return {
        "cert_id": cert_meta["cert_id"],
        "doc_id": doc_id,
        "pdf_hash": cert_meta["pdf_hash"],
        "issued_at": cert_meta["issued_at"],
        "ledger_tx_id": tx_id,
        "download_url": f"/api/v1/certificates/{cert_meta['cert_id']}/download",
    }


@router.get("/{cert_id}/download")
async def download_certificate(
    cert_id: str,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Download a previously issued certificate PDF."""
    res = await session.execute(select(Certificate).where(Certificate.id == cert_id))
    cert = res.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # Check access via the document's case
    doc_res = await session.execute(select(Document).where(Document.id == cert.doc_id))
    doc = doc_res.scalar_one_or_none()
    if not doc or doc.case_id not in current_user["live_case_ids"]:
        raise HTTPException(status_code=403, detail="Not authorised to access this certificate")

    import os
    if not os.path.exists(cert.pdf_path):
        raise HTTPException(status_code=404, detail="Certificate file not found on disk")

    media_type = "application/pdf" if cert.pdf_path.endswith(".pdf") else "text/plain"
    return FileResponse(
        path=cert.pdf_path,
        media_type=media_type,
        filename=f"BSA_Certificate_{cert_id}.pdf",
    )

"""Certificate Router: Court-admissible BSA Section 63 certificate issuance."""
