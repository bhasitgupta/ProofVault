import pytest
from app.db.session import init_models, AsyncSessionLocal
from app.ledger.dev_ledger import DevLedger
from app.ingest.pipeline import run_ingestion_pipeline
from app.integrity.verifier import verify_document_integrity
from app.storage.object_store import ObjectStore
from app.crypto.vault_client import VaultTransitClient
from app.db.models.document import Document
from sqlalchemy import select

@pytest.mark.anyio
async def test_redteam_blob_tamper_detected():
    """
    Simulate an attacker mutating ciphertext in object store (MinIO/local storage).
    Tier 3 check (blob_hash vs on-chain blob_hash) must fail and report BLOB_HASH mismatch.
    """
    await init_models()
    ledger = DevLedger(db_path="test_redteam_blob_ledger.db")
    store = ObjectStore()
    vault = VaultTransitClient()

    raw_doc = b"SEIZURE MEMO: Weapon serialized #8841-A recovered from suspect car."
    
    async with AsyncSessionLocal() as session:
        res = await run_ingestion_pipeline(
            file_bytes=raw_doc,
            filename="seizure_memo.txt",
            case_id="CASE-BLOB-01",
            doc_type="SEIZURE_MEMO",
            classification="RESTRICTED",
            uploader_id="USR-INV",
            uploader_msp="MHA-MSP",
            session=session,
            ledger=ledger
        )
        doc_id = res["doc_id"]

        # ATTACK: Malicious actor mutates stored ciphertext file directly
        original_ciphertext = store.get_blob(doc_id)
        tampered_ciphertext = original_ciphertext[:-1] + b"\x00"
        store.put_blob(doc_id, tampered_ciphertext)

        doc = (await session.execute(select(Document).where(Document.id == doc_id))).scalar_one()

        # RUN VERIFICATION: Must detect tampered blob
        vr = await verify_document_integrity(
            doc_id=doc_id,
            on_chain_blob_hash=doc.blob_hash,
            on_chain_content_hash=doc.content_hash,
            wrapped_dek=doc.wrapped_dek,
            nonce_hex=doc.nonce_hex,
            vault=vault,
            case_id=doc.case_id,
            ledger=ledger
        )

        assert vr.overall is False
        assert vr.blob_hash_ok is False
        assert vr.failing_check == "BLOB_HASH"
