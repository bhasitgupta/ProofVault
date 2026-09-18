from pydantic import BaseModel, Field
from typing import List, Optional

class CaseDossierCreate(BaseModel):
    case_id: str = Field(..., description='Official FIR or court case docket number')
    title: str
    classification: str = 'CONFIDENTIAL'

class CaseDossierResponse(CaseDossierCreate):
    created_at: str
    total_documents: int = 0
    is_sealed: bool = False

class CaseDossierSealRequest(BaseModel):
    court_order_reference: str
    magistrate_badge: str
    seal_duration_days: int = 365

class CaseDossierAuditTrail(BaseModel):
    case_id: str
    merkle_root: str
    polygon_tx_hash: Optional[str] = None

class CustodyTransferPayload(BaseModel):
    document_id: str
    from_custodian: str
    to_custodian: str
    statutory_reason: str
