import pytest
from app.db.session import init_models, AsyncSessionLocal
from app.ledger.dev_ledger import DevLedger
from app.ingest.pipeline import run_ingestion_pipeline
from app.rag.orchestrator import run_rag_pipeline
from app.db.models.chunk import Chunk
from sqlalchemy import select

@pytest.mark.anyio
async def test_redteam_chunk_tamper_detected():
    """
    Simulate an attacker directly mutating chunk_text inside Postgres / DB.
    The Merkle integrity gate in run_rag_pipeline MUST detect this before feeding to LLM,
    raise a tamper alert, and withhold tampered evidence.
    """
    await init_models()
    ledger = DevLedger(db_path="test_redteam_chunk_ledger.db")

    raw_doc = b"CRITICAL FORENSIC EVIDENCE: Suspect DNA matches scene with 99.9% certainty."
    
    async with AsyncSessionLocal() as session:
        res = await run_ingestion_pipeline(
            file_bytes=raw_doc,
            filename="dna_evidence.txt",
            case_id="CASE-TAMPER-01",
            doc_type="FORENSIC_REPORT",
            classification="CONFIDENTIAL",
            uploader_id="USR-INV",
            uploader_msp="MHA-MSP",
            session=session,
            ledger=ledger
        )
        doc_id = res["doc_id"]

        # ATTACK: Malicious actor mutates chunk text in DB
        stmt = select(Chunk).where(Chunk.doc_id == doc_id)
        chunk_obj = (await session.execute(stmt)).scalar_one()
        chunk_obj.chunk_text = "TAMPERED: Suspect DNA was completely excluded from scene."
        await session.commit()

        # RUN QUERY: Integrity gate must catch the altered chunk
        q_res = await run_rag_pipeline(
            query="DNA matches scene certainty",
            user_id="USR-INV",
            user_role="INVESTIGATOR",
            user_msp="MHA-MSP",
            allowed_case_ids=["CASE-TAMPER-01"],
            max_classification="CONFIDENTIAL",
            session=session,
            ledger=ledger
        )

        assert q_res["tamper_detected"] is True
        assert q_res["answer"] is None
        assert "INTEGRITY GATE BLOCKED" in q_res.get("message", "")
