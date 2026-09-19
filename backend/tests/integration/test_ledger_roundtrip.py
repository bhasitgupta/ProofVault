import pytest
import os
import uuid
from app.ledger.dev_ledger import DevLedger
from app.ledger.records import DocRecord, AuditEvent

@pytest.mark.anyio
async def test_ledger_roundtrip():
    test_db = f"test_roundtrip_{uuid.uuid4().hex[:8]}.db"
    if os.path.exists(test_db):
        os.remove(test_db)
    ledger = DevLedger(db_path=test_db)

    # 1. Register document on dochash-channel
    rec = DocRecord(
        docId="DOC-RT-01",
        caseId="CASE-101",
        contentHash="a" * 64,
        blobHash="b" * 64,
        chunkMerkleRoot="c" * 64,
        chunkCount=3,
        sizeBytes=1024,
        mimeType="text/plain",
        docType="FIR",
        classification="CONFIDENTIAL",
        uploaderId="USR-INV",
        uploaderMSP="MHA-MSP",
        uploaderSig="sig-hex",
        tsaTokenHash="tsa-hex"
    )
    tx_id = await ledger.register_document(rec)
    assert tx_id.startswith("0x") or tx_id.startswith("tx_")

    # 2. Re-read document
    fetched = await ledger.get_document("DOC-RT-01")
    assert fetched is not None
    assert fetched.contentHash == "a" * 64
    assert fetched.chunkMerkleRoot == "c" * 64

    # 3. Append access event on access-channel
    evt = AuditEvent(
        eventId="EVT-01",
        actorId="USR-INV",
        actorRole="INVESTIGATOR",
        actorMSP="MHA-MSP",
        action="DOCUMENT_ACCESSED",
        caseId="CASE-101",
        docIds=["DOC-RT-01"],
        outcome="ALLOW"
    )
    tx_evt = await ledger.append_event(evt)
    assert tx_evt.startswith("0x") or tx_evt.startswith("tx_")

    # 4. Verify document history contains the event
    history = await ledger.get_document_history("DOC-RT-01")
    assert len(history) >= 1
