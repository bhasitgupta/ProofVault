import pytest
import uuid
from app.db.session import init_models, AsyncSessionLocal
from app.ledger.dev_ledger import DevLedger
from app.db.models.assignment import Assignment
from app.db.models.case import Case
from app.policy.scope import get_live_user_case_ids
from sqlalchemy import select

@pytest.mark.anyio
async def test_redteam_immediate_revocation_enforced():
    """
    C8 Requirement: Case assignments are evaluated live against DB on every request.
    Revoking assignment in DB immediately blocks user access without waiting for JWT expiry.
    """
    await init_models()
    case_id = f"CASE-REVOKE-{uuid.uuid4().hex[:6]}"
    
    async with AsyncSessionLocal() as session:
        # Create case & active assignment
        case = Case(case_id=case_id, title="Revocation Test Case", classification_ceiling="SECRET")
        session.add(case)
        assign = Assignment(user_id="USR-REVOKE-ME", case_id=case_id, is_active=True)
        session.add(assign)
        await session.commit()

        # Check live assignment before revocation
        assigned_cases = await get_live_user_case_ids(session, "USR-REVOKE-ME")
        assert case_id in assigned_cases

        # Supervisor revokes assignment
        stmt = select(Assignment).where(Assignment.user_id == "USR-REVOKE-ME", Assignment.case_id == case_id)
        active_assign = (await session.execute(stmt)).scalar_one()
        active_assign.is_active = False
        await session.commit()

        # Immediate check (e.g. on next incoming request with same old JWT)
        post_revocation_cases = await get_live_user_case_ids(session, "USR-REVOKE-ME")
        assert case_id not in post_revocation_cases
