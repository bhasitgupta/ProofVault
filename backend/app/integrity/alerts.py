import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.ledger.records import AuditEvent
from app.db.models.incident import Incident
from app.core.constants import AuditAction, AuditOutcome


async def raise_tamper_alert(
    *,
    doc_id: str,
    failing_check: str,
    actor_id: str,
    actor_msp: str,
    details: str,
    session: AsyncSession,
    ledger,
) -> str:
    """
    Raises a TAMPER_ALERT:
    1. Writes TAMPER_ALERT AuditEvent to the access-channel (on-chain, immutable)
    2. Creates an Incident row in Postgres for the UI alert banner
    Returns the ledger transaction ID.
    """
    # 1. On-chain tamper alert
    evt = AuditEvent(
        eventId=str(uuid.uuid4()),
        actorId=actor_id,
        actorRole="SYSTEM",
        actorMSP=actor_msp,
        action=AuditAction.TAMPER_ALERT.value,
        docIds=[doc_id],
        outcome=AuditOutcome.ERROR.value,
        reason=f"TAMPER DETECTED — failing check: {failing_check}. {details}",
    )
    tx_id = await ledger.append_event(evt)

    # 2. Incident row for UI
    incident = Incident(
        id=str(uuid.uuid4()),
        doc_id=doc_id,
        failing_check=failing_check,
        actor_id=actor_id,
        details=details,
        status="OPEN",
        ledger_tx_id=tx_id,
    )
    session.add(incident)
    await session.commit()

    return tx_id
