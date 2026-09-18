"""
Bulk Verification Script.
Iterates over all documents in the database and runs full 4-tier verification.
"""
import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.db.session import init_models, AsyncSessionLocal
from app.db.models.document import Document
from app.ledger.dev_ledger import DevLedger
from app.crypto.vault_client import VaultTransitClient
from app.integrity.verifier import verify_document_integrity
from sqlalchemy import select

async def main():
    await init_models()
    ledger = DevLedger()
    vault = VaultTransitClient()

    async with AsyncSessionLocal() as session:
        docs = (await session.execute(select(Document))).scalars().all()
        print(f"[*] Verifying {len(docs)} documents against ledger...")

        passed = 0
        failed = 0

        for d in docs:
            vr = await verify_document_integrity(
                doc_id=d.id,
                on_chain_blob_hash=d.blob_hash,
                on_chain_content_hash=d.content_hash,
                wrapped_dek=d.wrapped_dek,
                nonce_hex=d.nonce_hex,
                vault=vault,
                case_id=d.case_id,
                ledger=ledger
            )
            status = "PASS" if vr.overall else f"FAIL ({vr.failing_check})"
            print(f" - [{d.case_id}] {d.filename} ({d.id[:8]}...): {status}")
            if vr.overall:
                passed += 1
            else:
                failed += 1

        print(f"\n[✓] Results: {passed} PASSED, {failed} FAILED")

if __name__ == "__main__":
    asyncio.run(main())
