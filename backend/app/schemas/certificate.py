from pydantic import BaseModel

class CertificateIssueResponse(BaseModel):
    cert_id: str
    doc_id: str
    pdf_hash: str
    issued_at: str
    ledger_tx_id: str
    download_url: str
