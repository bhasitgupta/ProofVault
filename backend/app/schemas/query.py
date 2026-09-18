from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=2000)
    case_ids: List[str] = Field(default_factory=list)

class Citation(BaseModel):
    doc_id: str
    chunk_index: int
    page_number: Optional[int] = None
    chunk_hash: Optional[str] = None
    ledger_tx_id: Optional[str] = None
    verification_status: str = "VERIFIED"

class QueryResponse(BaseModel):
    answer: Optional[str] = None
    citations: List[Citation] = Field(default_factory=list)
    tamper_detected: bool = False
    tamper_quarantined: bool = False
    tamper_alert_tx: Optional[str] = None
    message: Optional[str] = None
    scope_note: Optional[str] = None
    timings_ms: Dict[str, Any] = Field(default_factory=dict)
    access_info: Optional[Dict[str, Any]] = None

