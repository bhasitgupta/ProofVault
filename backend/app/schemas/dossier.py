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
