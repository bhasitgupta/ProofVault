from pydantic import BaseModel
from typing import List, Optional

class AuditEventResponse(BaseModel):
    eventId: str
    actorId: str
    actorRole: str
    actorMSP: str
    action: str
    caseId: Optional[str] = None
    docIds: List[str] = []
    queryHash: Optional[str] = None
    resultHash: Optional[str] = None
    outcome: str
    reason: Optional[str] = None
    timestamp: Optional[str] = None

class CaseTimelineResponse(BaseModel):
    case_id: str
    event_count: int
    events: List[dict]
