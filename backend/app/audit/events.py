"""
Audit Event definitions and helper factories.
"""
import uuid
from typing import List, Optional
from app.ledger.records import AuditEvent
from app.core.constants import AuditAction, AuditOutcome

def create_audit_event(
    actor_id: str,
    actor_role: str,
    actor_msp: str,
    action: AuditAction,
    outcome: AuditOutcome,
    case_id: Optional[str] = None,
    doc_ids: Optional[List[str]] = None,
    query_hash: Optional[str] = None,
    result_hash: Optional[str] = None,
    reason: Optional[str] = None
) -> AuditEvent:
    return AuditEvent(
        eventId=str(uuid.uuid4()),
        actorId=actor_id,
        actorRole=actor_role,
        actorMSP=actor_msp,
        action=action.value if hasattr(action, 'value') else action,
        caseId=case_id,
        docIds=doc_ids or [],
        queryHash=query_hash,
        resultHash=result_hash,
        outcome=outcome.value if hasattr(outcome, 'value') else outcome,
        reason=reason or ""
    )
