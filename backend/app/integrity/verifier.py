"""
Tiered verification per C6:
  Tier 1: chunk_hash recomputed from Qdrant payload vs stored chunk_hash
  Tier 2: Merkle inclusion proof vs on-chain chunk_merkle_root
  Tier 3: blob_hash of stored ciphertext vs on-chain blob_hash
  Tier 4: (on citation) decrypt → content_hash vs on-chain content_hash
"""
import hashlib
import struct
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Tuple

from app.storage.object_store import ObjectStore
from app.crypto.hashing import content_hash as compute_ch, blob_hash as compute_bh
from app.crypto.envelope import decrypt_blob
from app.crypto.merkle import verify_merkle_proof

_store = ObjectStore()


@dataclass
class VerificationResult:
    doc_id: str
    chunk_hash_ok: Optional[bool] = None
    merkle_proof_ok: Optional[bool] = None
    blob_hash_ok: Optional[bool] = None
    content_hash_ok: Optional[bool] = None
    overall: bool = False
    failing_check: str = ""
    ledger_tx_id: str = ""
    details: Dict[str, Any] = field(default_factory=dict)


async def verify_chunk_integrity(
    *,
    doc_id: str,
    chunk_index: int,
    chunk_text: str,
    chunk_hash_stored: str,
    merkle_proof: List[Dict[str, Any]],
    ledger,
) -> VerificationResult:
    """Tier 1 + Tier 2 — runs BEFORE the LLM on every retrieved chunk."""
    result = VerificationResult(doc_id=doc_id)

    # Tier 1: Re-hash the chunk locally
    h = hashlib.sha256()
    h.update(b"\x00")
    h.update(doc_id.encode("utf-8"))
    h.update(struct.pack(">I", chunk_index))
    h.update(chunk_text.encode("utf-8"))
    computed = h.hexdigest()
    result.chunk_hash_ok = (computed.lower() == chunk_hash_stored.lower())

    if not result.chunk_hash_ok:
        result.failing_check = "CHUNK_HASH"
        result.overall = False
        return result

    # Tier 2: Merkle inclusion proof vs on-chain root
    ok, tx_id = await ledger.verify_chunk(doc_id, chunk_index, chunk_text, merkle_proof)
    result.merkle_proof_ok = ok
    result.ledger_tx_id = tx_id

    if not ok:
        result.failing_check = "MERKLE_PROOF"
        result.overall = False
        return result

    result.overall = True
    return result


async def verify_document_integrity(
    *,
    doc_id: str,
    on_chain_blob_hash: str,
    on_chain_content_hash: str,
    wrapped_dek: str,
    nonce_hex: str,
    vault,
    case_id: str,
    ledger,
) -> VerificationResult:
    """Tier 3 + Tier 4 — on-demand full document verification."""
    result = VerificationResult(doc_id=doc_id)

    # Tier 3: blob_hash check (fast, no decryption)
    try:
        ciphertext = _store.get_blob(doc_id)
        computed_bh = compute_bh(ciphertext)
        result.blob_hash_ok = (computed_bh.lower() == on_chain_blob_hash.lower())

        ok, tx_id = await ledger.verify_content_hash(doc_id, on_chain_content_hash)
        result.ledger_tx_id = tx_id

        if not result.blob_hash_ok:
            result.failing_check = "BLOB_HASH"
            result.overall = False
            return result

        # Tier 4: Decrypt + content_hash
        dek = await vault.unwrap_dek(wrapped_dek, case_id)
        nonce = bytes.fromhex(nonce_hex)
        plaintext = decrypt_blob(ciphertext, nonce, dek, doc_id)
        computed_ch = compute_ch(plaintext)
        result.content_hash_ok = (computed_ch.lower() == on_chain_content_hash.lower())

        if not result.content_hash_ok:
            result.failing_check = "CONTENT_HASH"
            result.overall = False
            return result

    except Exception as e:
        result.failing_check = f"EXCEPTION: {e}"
        result.overall = False
        return result

    result.overall = True
    return result
