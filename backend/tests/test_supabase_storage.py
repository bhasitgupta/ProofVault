import os
import pytest
from app.config import Settings, _resolve_default_db_url
from app.storage.object_store import ObjectStore
from app.storage.quarantine import QuarantineManager
from app.rag.llm_client import LLMClient

def test_supabase_config_resolution(monkeypatch):
    monkeypatch.setenv("SUPABASE_DB_URL", "postgresql://postgres:secret@db.supabase.co:5432/postgres")
    resolved = _resolve_default_db_url()
    assert resolved.startswith("postgresql+asyncpg://")

def test_object_store_bucket_mapping():
    store = ObjectStore()
    assert store._get_bucket_name("evidence") == "evidence"
    assert store._get_bucket_name("quarantine") == "quarantine"
    assert store._get_bucket_name("certificates") == "certificates"

def test_object_store_put_and_get():
    store = ObjectStore()
    doc_id = "TEST-SUPABASE-BLOB-01"
    payload = b"ENC_BLOB_FOR_SUPABASE_TESTING_123"
    
    path = store.put_blob(doc_id, payload, bucket="evidence")
    assert store.exists(doc_id, bucket="evidence")
    
    retrieved = store.get_blob(doc_id, bucket="evidence")
    assert retrieved == payload
    
    deleted = store.delete_blob(doc_id, bucket="evidence")
    assert deleted is True

def test_quarantine_manager():
    qm = QuarantineManager()
    doc_id = "TEST-QUARANTINE-01"
    raw_bytes = b"INFECTED_PAYLOAD_TEST"
    
    res = qm.quarantine_file(
        doc_id=doc_id,
        raw_bytes=raw_bytes,
        threat_name="EICAR_TEST",
        uploader_id="USR-TEST"
    )
    assert doc_id in res

@pytest.mark.anyio
async def test_cascading_cloud_ai_gateway():
    llm = LLMClient()
    prompt = """
    <EVIDENCE id="1">Forensic memo verifies recovered USB drive hash 0xABCDEF</EVIDENCE>
    Query: What was recovered?
    """
    answer = await llm.generate_answer(system_prompt="Analyze", user_prompt=prompt)
    assert len(answer) > 10
    assert "Forensic memo" in answer or "verified" in answer.lower()
