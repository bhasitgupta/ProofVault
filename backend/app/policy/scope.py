from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.assignment import Assignment

async def get_live_user_case_ids(session: AsyncSession, user_id: str) -> List[str]:
    """
    Resolves active case assignments directly from the database on EVERY request (C8).
    Ensures mid-session administrative revocation takes immediate effect without re-login.
    """
    stmt = select(Assignment.case_id).where(
        Assignment.user_id == user_id,
        Assignment.is_active == True
    )
    result = await session.execute(stmt)
    return [row[0] for row in result.fetchall()]
