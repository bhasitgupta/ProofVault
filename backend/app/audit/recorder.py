"""
Audit Recorder.
Handles dual-write audit logging:
1. Canonical AuditEvent committed immutably to ledger access-channel
2. Query/result metadata in off-chain database
"""
import uuid
import hashlib
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.ledger.records import AuditEvent
from app.db.models.audit_log import AuditLog
from app.core.constants import AuditAction, AuditOutcome

class AuditRecorder:
    def __init__(self, ledger):
        self.ledger = ledger

    async def record_event(
        self,
        actor_id: str,
        actor_role: str,
        actor_msp: str,
        action: AuditAction,
        outcome: AuditOutcome,
        session: AsyncSession,
        case_id: Optional[str] = None,
        doc_ids: Optional[List[str]] = None,
        query: Optional[str] = None,
        result_text: Optional[str] = None,
        reason: Optional[str] = None
    ) -> str:
        event_id = str(uuid.uuid4())
        q_hash = hashlib.sha256(query.encode("utf-8")).hexdigest() if query else None
        r_hash = hashlib.sha256(result_text.encode("utf-8")).hexdigest() if result_text else None

        # 1. On-chain ledger event
        event = AuditEvent(
            eventId=event_id,
            actorId=actor_id,
            actorRole=actor_role,
            actorMSP=actor_msp,
            action=action.value if hasattr(action, 'value') else action,
            caseId=case_id,
            docIds=doc_ids or [],
            queryHash=q_hash,
            resultHash=r_hash,
            outcome=outcome.value if hasattr(outcome, 'value') else outcome,
            reason=reason or ""
        )
        tx_id = await self.ledger.append_event(event)

        # 2. Local DB audit log
        log_entry = AuditLog(
            id=event_id,
            actor_id=actor_id,
            actor_role=actor_role,
            action=action.value if hasattr(action, 'value') else action,
            case_id=case_id,
            doc_id=doc_ids[0] if doc_ids else None,
            query_hash=q_hash,
            result_hash=r_hash,
            outcome=outcome.value if hasattr(outcome, 'value') else outcome,
            ledger_tx_id=tx_id
        )
        session.add(log_entry)
        await session.commit()

        return tx_id
