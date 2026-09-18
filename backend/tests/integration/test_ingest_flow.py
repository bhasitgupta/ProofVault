import pytest
from app.db.session import init_models, AsyncSessionLocal
from app.ledger.dev_ledger import DevLedger
from app.ingest.pipeline import run_ingestion_pipeline

@pytest.mark.anyio
async def test_full_ingestion_integration():
    await init_models()
    ledger = DevLedger(db_path="test_integration_ledger.db")
    raw_evidence = b"""
    FIRST INFORMATION REPORT (FIR) - CRIME NO: 402/2026
    Police Station: Cyber Crime Division, New Delhi
    Date of Occurrence: 01-March-2026

    Details:
    Unauthorised server intrusion detected at central data vault.
    IP 198.51.100.22 traced to accused terminal.
    Digital artifacts and memory dump preserved under chain of custody.
    """

    async with AsyncSessionLocal() as session:
        result = await run_ingestion_pipeline(
            file_bytes=raw_evidence,
            filename="fir_402_2026.txt",
            case_id="CASE-101",
            doc_type="FIR",
            classification="CONFIDENTIAL",
            uploader_id="USR-TEST-INV",
            uploader_msp="MHA-MSP",
            session=session,
            ledger=ledger
        )

        assert result["status"] == "ACTIVE"
        assert len(result["doc_id"]) > 10
        assert len(result["content_hash"]) == 64
        assert len(result["chunk_merkle_root"]) == 64
        assert result["ledger_tx_id"].startswith("tx_")
