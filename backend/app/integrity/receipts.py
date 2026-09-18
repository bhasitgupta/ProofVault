"""
Verification Receipts Module.
Generates cryptographically signed verification receipts when evidence is verified.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

from app.crypto.signer import generate_officer_keypair, sign_content_hash
from app.db.models.receipt import Receipt
from sqlalchemy.ext.asyncio import AsyncSession

async def issue_verification_receipt(
    doc_id: str,
    overall_ok: bool,
    blob_hash_ok: bool,
    content_hash_ok: bool,
    merkle_proof_ok: bool,
    session: AsyncSession
) -> Dict[str, Any]:
    receipt_id = str(uuid.uuid4())
    issued_at = datetime.now(timezone.utc)

    # Generate ephemeral keypair for receipt signature
    priv, pub = generate_officer_keypair()
    data_to_sign = f"{receipt_id}:{doc_id}:{overall_ok}:{issued_at.isoformat()}"
    sig = sign_content_hash(priv, data_to_sign)

    receipt = Receipt(
        id=receipt_id,
        doc_id=doc_id,
        content_hash_ok=content_hash_ok,
        blob_hash_ok=blob_hash_ok,
        merkle_root_ok=merkle_proof_ok,
        overall_ok=overall_ok,
        signature=sig
    )
    session.add(receipt)
    await session.commit()

    return {
        "receipt_id": receipt_id,
        "doc_id": doc_id,
        "overall_ok": overall_ok,
        "signature": sig,
        "issued_at": issued_at.isoformat()
    }
