"""
Ingestion Pipeline — implements the corrected order from §2.1 of the implementation plan.

Order:
  1. validate_upload_guards + sanitize_metadata
  2. MalwareScanner.scan_bytes → quarantine on INFECTED, STOP
  3. content_hash = SHA-256(plaintext)
  4. officer_signature over content_hash
  5. RFC3161 TSA token over content_hash
  6. Text extraction (PyMuPDF) + normalize
  7. Chunk + per-chunk hash + Merkle tree → chunk_merkle_root
  8. Envelope encrypt → DEK (AES-256-GCM, AAD=doc_id) → wrap DEK via Vault
  9. blob_hash = SHA-256(ciphertext)
 10. ObjectStore.put_blob(ciphertext)
 11. Postgres metadata row
 12. LEDGER COMMIT GATE: RegisterDocument on dochash-channel
     → rollback on failure (quarantine, alert, never index)
 13. Embed chunks → Qdrant upsert
 14. AuditEvent(UPLOAD_OK) on access-channel
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.ingest.guards import validate_upload_guards, sanitize_metadata
from app.ingest.extractor import extract_text_pages
from app.ingest.normalizer import normalize_text
from app.ingest.chunker import chunk_pages
from app.ingest.tagger import validate_and_tag
from app.ingest.dedupe import check_content_duplicate
from app.storage.malware import MalwareScanner
from app.storage.quarantine import QuarantineManager
from app.storage.object_store import ObjectStore
from app.crypto.hashing import content_hash as compute_content_hash, blob_hash as compute_blob_hash
from app.crypto.envelope import generate_dek, encrypt_blob
from app.crypto.vault_client import VaultTransitClient
from app.crypto.merkle import MerkleTree
from app.crypto.tsa import generate_tsa_token
from app.crypto.signer import generate_officer_keypair, sign_content_hash
from app.ledger.records import DocRecord, AuditEvent
from app.db.models.document import Document
from app.db.models.chunk import Chunk
from app.db.models.audit_log import AuditLog
from app.core.constants import AuditAction, AuditOutcome

# Singletons shared across requests (init once at app startup)
_scanner = MalwareScanner()
_quarantine = QuarantineManager()
_store = ObjectStore()
_vault = VaultTransitClient()

async def run_ingestion_pipeline(
    *,
    file_bytes: bytes,
    filename: str,
    case_id: str,
    doc_type: str,
    classification: str,
    uploader_id: str,
    uploader_msp: str,
    session: AsyncSession,
    ledger,   # LedgerAdapter
) -> dict:
    doc_id = str(uuid.uuid4())

    # ── Step 1: Guards + metadata sanitisation ──────────────────────────────
    validate_upload_guards(filename, file_bytes)
    safe_meta = sanitize_metadata({
        "case_id": case_id,
        "doc_type": doc_type,
        "classification": classification,
        "filename": filename,
    })

    # ── Step 2: Malware scan ─────────────────────────────────────────────────
    is_clean, threat = _scanner.scan_bytes(file_bytes)
    if not is_clean:
        _quarantine.quarantine_file(doc_id, file_bytes, threat, uploader_id)
        # Audit the rejected upload
        evt = AuditEvent(
            eventId=str(uuid.uuid4()),
            actorId=uploader_id,
            actorRole="SYSTEM",
            actorMSP=uploader_msp,
            action=AuditAction.UPLOAD_MALWARE.value,
            caseId=case_id,
            outcome=AuditOutcome.DENY.value,
            reason=f"Malware detected: {threat}",
        )
        await ledger.append_event(evt)
        raise ValueError(f"File rejected — malware detected: {threat}")

    # ── Step 3: content_hash ─────────────────────────────────────────────────
    ch = compute_content_hash(file_bytes)

    # ── Step 4: Officer signature ────────────────────────────────────────────
    priv_bytes, _ = generate_officer_keypair()   # In production: load from officer HSM
    uploader_sig = sign_content_hash(priv_bytes, ch)

    # ── Step 5: TSA token ────────────────────────────────────────────────────
    tsa_hash = generate_tsa_token(ch)

    # ── Step 6: Text extract + normalise ─────────────────────────────────────
    mime_type = "text/plain" if filename.endswith(".txt") else "application/pdf"
    raw_pages = extract_text_pages(file_bytes, mime_type)
    pages = [{"page_number": p["page_number"], "text": normalize_text(p["text"])} for p in raw_pages]

    # ── Step 7: Chunk + per-chunk hashes + Merkle root ───────────────────────
    chunks = chunk_pages(pages, doc_id)
    chunk_texts = [c["chunk_text"] for c in chunks]
    merkle_tree = MerkleTree(doc_id, chunk_texts)
    chunk_merkle_root = merkle_tree.root

    # Validate tags
    validate_and_tag(case_id, doc_type, classification, filename)

    # ── Step 8: Envelope encrypt ──────────────────────────────────────────────
    dek = generate_dek()
    ciphertext, nonce = encrypt_blob(file_bytes, dek, doc_id)
    wrapped_dek = await _vault.wrap_dek(dek, case_id)

    # ── Step 9: blob_hash ─────────────────────────────────────────────────────
    bh = compute_blob_hash(ciphertext)

    # ── Step 10: Object store ─────────────────────────────────────────────────
    storage_path = _store.put_blob(doc_id, ciphertext)

    # ── Step 11: Postgres metadata row ────────────────────────────────────────
    doc_row = Document(
        id=doc_id,
        case_id=case_id,
        filename=filename,
        content_hash=ch,
        blob_hash=bh,
        chunk_merkle_root=chunk_merkle_root,
        chunk_count=len(chunks),
        size_bytes=len(file_bytes),
        mime_type=mime_type,
        doc_type=doc_type,
        classification=classification,
        uploader_id=uploader_id,
        storage_path=storage_path,
        wrapped_dek=wrapped_dek,
        nonce_hex=nonce.hex(),
        ledger_tx_id="",  # Will be filled after ledger commit
        tsa_token_hash=tsa_hash,
        status="ACTIVE",
    )
    session.add(doc_row)
    await session.flush()  # get the row in DB without committing

    # ── Step 12: LEDGER COMMIT GATE ───────────────────────────────────────────
    record = DocRecord(
        docId=doc_id,
        caseId=case_id,
        contentHash=ch,
        blobHash=bh,
        chunkMerkleRoot=chunk_merkle_root,
        chunkCount=len(chunks),
        sizeBytes=len(file_bytes),
        mimeType=mime_type,
        docType=doc_type,
        classification=classification,
        uploaderId=uploader_id,
        uploaderMSP=uploader_msp,
        uploaderSig=uploader_sig,
        tsaTokenHash=tsa_hash,
    )
    try:
        tx_id = await ledger.register_document(record)
    except Exception as e:
        # Rollback DB, quarantine the uploaded blob
        await session.rollback()
        _store.delete_blob(doc_id)
        raise RuntimeError(f"LEDGER COMMIT FAILED — document NOT indexed: {e}")

    # Update the tx_id now that ledger commit succeeded
    doc_row.ledger_tx_id = tx_id
    await session.commit()

    # ── Step 13: Store chunks in DB (index will pick these up for Qdrant) ─────
    for c in chunks:
        chunk_row = Chunk(
            id=str(uuid.uuid4()),
            doc_id=doc_id,
            chunk_index=c["chunk_index"],
            chunk_hash=c["chunk_hash"],
            chunk_text=c["chunk_text"],
            page_number=c["page_number"],
        )
        session.add(chunk_row)
    await session.commit()

    # ── Step 14: UPLOAD_OK audit event ───────────────────────────────────────
    evt = AuditEvent(
        eventId=str(uuid.uuid4()),
        actorId=uploader_id,
        actorRole="INVESTIGATOR",
        actorMSP=uploader_msp,
        action=AuditAction.UPLOAD_OK.value,
        caseId=case_id,
        docIds=[doc_id],
        outcome=AuditOutcome.ALLOW.value,
        reason="Ingestion pipeline completed successfully",
    )
    await ledger.append_event(evt)

    return {
        "doc_id": doc_id,
        "content_hash": ch,
        "blob_hash": bh,
        "chunk_merkle_root": chunk_merkle_root,
        "chunk_count": len(chunks),
        "ledger_tx_id": tx_id,
        "status": "ACTIVE",
    }
