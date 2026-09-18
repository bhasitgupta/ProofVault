from pydantic import BaseModel
from typing import Optional, Dict, Any

class VerificationResponse(BaseModel):
    doc_id: str
    overall: bool
    blob_hash_ok: Optional[bool] = None
    content_hash_ok: Optional[bool] = None
    merkle_proof_ok: Optional[bool] = None
    chunk_hash_ok: Optional[bool] = None
    failing_check: Optional[str] = ""
    ledger_tx_id: Optional[str] = ""
    details: Dict[str, Any] = {}
