import pytest
import os
import uuid
from app.db.session import init_models, AsyncSessionLocal
from app.ledger.dev_ledger import DevLedger
from app.ingest.pipeline import run_ingestion_pipeline
from app.rag.orchestrator import run_rag_pipeline

@pytest.mark.anyio
async def test_rag_query_flow_integration():
    await init_models()
    rand_id = uuid.uuid4().hex[:6]
    test_db = f"test_query_ledger_{rand_id}.db"
    case_id = f"CASE-QUERY-{rand_id}"
    ledger = DevLedger(db_path=test_db)

    evidence = b"""
    FORENSIC LAB ANALYSIS REPORT
    Case ID: Forensic Investigation
    Conclusion: Ballistic markings match weapon seized from accused premises with 99.8% precision.
    """

    async with AsyncSessionLocal() as session:
        # Ingest document
        ingest_res = await run_ingestion_pipeline(
            file_bytes=evidence,
            filename="ballistics_report.txt",
            case_id=case_id,
            doc_type="FORENSIC_REPORT",
            classification="SECRET",
            uploader_id="USR-FORENSIC-1",
            uploader_msp="MHA-MSP",
            session=session,
            ledger=ledger
        )
        assert ingest_res["status"] == "ACTIVE"

        # Query with SECRET clearance and case_id scope
        query_res = await run_rag_pipeline(
            query="ballistic markings match weapon precision",
            user_id="USR-SUPERVISOR-1",
            user_role="SUPERVISOR",
            user_msp="MHA-MSP",
            allowed_case_ids=[case_id],
            max_classification="SECRET",
            session=session,
            ledger=ledger
        )

        assert query_res["tamper_detected"] is False
        assert query_res["answer"] is not None
