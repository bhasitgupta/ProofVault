from pydantic import BaseModel
from typing import Dict, Any, List

class ForensicScanResult(BaseModel):
    sha256: str
    shannon_entropy: float
    is_quarantined: bool
    mime_type: str

class AntivirusScanSummary(BaseModel):
    engine: str = 'ClamAV-Forensics'
    signatures_checked: int = 84210
    threats_detected: List[str] = []

class BitstreamVerificationLog(BaseModel):
    acquisition_hash: str
    verification_hash: str
    is_match: bool

class ForensicCertificateRequest(BaseModel):
    document_id: str
    case_id: str
    format: str = 'PDF'

class BlockchainAnchorReceiptResponse(BaseModel):
    doc_hash: str
    tx_hash: str
    block_number: int
    network: str = 'Polygon-Amoy'
