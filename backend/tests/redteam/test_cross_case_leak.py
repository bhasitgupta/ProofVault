import pytest
from app.db.session import init_models, AsyncSessionLocal
from app.ledger.dev_ledger import DevLedger
from app.ingest.pipeline import run_ingestion_pipeline
from app.rag.orchestrator import run_rag_pipeline

@pytest.mark.anyio
async def test_redteam_cross_case_leak_prevention():
    """
    Ensure an investigator assigned strictly to CASE-ALPHA cannot retrieve evidence
    from CASE-BETA even when querying for unique high-entropy identifiers from CASE-BETA.
    """
    await init_models()
    ledger = DevLedger(db_path="test_redteam_leak_ledger.db")

    case_beta_doc = b"TOP SECRET TARGET: Project Krypton codename X99-OMEGA located at Sector 7."
    
    async with AsyncSessionLocal() as session:
        # Ingest document into CASE-BETA
        await run_ingestion_pipeline(
            file_bytes=case_beta_doc,
            filename="target_intel.txt",
            case_id="CASE-BETA",
            doc_type="CASE_DIARY",
            classification="RESTRICTED",
            uploader_id="USR-SECRET-AGENT",
            uploader_msp="MHA-MSP",
            session=session,
            ledger=ledger
        )

        # Investigator ONLY authorized for CASE-ALPHA queries for CASE-BETA content
        res = await run_rag_pipeline(
            query="Project Krypton codename X99-OMEGA Sector 7",
            user_id="USR-OUTSIDER",
            user_role="INVESTIGATOR",
            user_msp="MHA-MSP",
            allowed_case_ids=["CASE-ALPHA"], # NOT assigned to CASE-BETA
            max_classification="SECRET",
            session=session,
            ledger=ledger
        )

        # Result must be clean of any CASE-BETA confidential tokens
        assert "X99-OMEGA" not in (res.get("answer") or "")
        assert len(res.get("citations", [])) == 0
        assert "No accessible documents found" in (res.get("answer") or "")
