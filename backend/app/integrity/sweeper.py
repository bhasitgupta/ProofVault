"""
Background Integrity Sweeper.
Periodically sweeps active documents and runs Tier 3 (blob_hash) checks against ledger.
Raises TAMPER_ALERT on discrepancies.
"""
import asyncio
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.document import Document
from app.integrity.verifier import verify_document_integrity
from app.integrity.alerts import raise_tamper_alert
from app.crypto.vault_client import VaultTransitClient

async def run_integrity_sweep(session: AsyncSession, ledger, max_docs: int = 50) -> List[dict]:
    stmt = select(Document).where(Document.status == "ACTIVE").limit(max_docs)
    res = await session.execute(stmt)
    docs = res.scalars().all()

    vault = VaultTransitClient()
    report = []

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

        if not vr.overall:
            await raise_tamper_alert(
                doc_id=d.id,
                failing_check=vr.failing_check,
                actor_id="SWEEPER_SERVICE",
                actor_msp="SYSTEM",
                details=f"Background integrity sweep failure on {d.id}: {vr.failing_check}",
                session=session,
                ledger=ledger
            )

        report.append({
            "doc_id": d.id,
            "overall_ok": vr.overall,
            "failing_check": vr.failing_check
        })

    return report
