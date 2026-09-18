from pydantic import BaseModel
from typing import Dict, Any, List

class ForensicScanResult(BaseModel):
    sha256: str
    shannon_entropy: float
    is_quarantined: bool
    mime_type: str
