import json
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field

class DocRecord(BaseModel):
    docId: str
    caseId: str
    contentHash: str
    blobHash: str
    chunkMerkleRoot: str
    chunkCount: int
    algo: str = "SHA-256"
    sizeBytes: int
    mimeType: str = "application/pdf"
    docType: str
    classification: str
    uploaderId: str
    uploaderMSP: str = "PoliceMSP"
    uploaderSig: str = ""
    tsaTokenHash: str = ""
    ingestTimestampUtc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    supersedesDocId: Optional[str] = None
    status: str = "ACTIVE"

    def to_canonical_json(self) -> str:
        return json.dumps(self.model_dump(), sort_keys=True, separators=(",", ":"))

class AuditEvent(BaseModel):
    eventId: str
    actorId: str
    actorRole: str
    actorMSP: str = "PoliceMSP"
    action: str
    caseId: Optional[str] = None
    docIds: List[str] = Field(default_factory=list)
    policyDecisionId: Optional[str] = None
    queryHash: str = ""
    resultHash: str = ""
    outcome: str = "ALLOW"
    reason: str = ""
    tsUtc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    prevEventHash: str = ""

    def to_canonical_json(self) -> str:
        return json.dumps(self.model_dump(), sort_keys=True, separators=(",", ":"))
