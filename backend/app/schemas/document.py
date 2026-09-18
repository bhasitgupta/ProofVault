from pydantic import BaseModel
from typing import Optional

class DocumentResponse(BaseModel):
    doc_id: str
    case_id: str
    filename: str
    content_hash: str
    blob_hash: str
    chunk_merkle_root: str
    chunk_count: int
    doc_type: str
    classification: str
    size_bytes: int
    status: str
    ledger_tx_id: str
    created_at: Optional[str] = None
