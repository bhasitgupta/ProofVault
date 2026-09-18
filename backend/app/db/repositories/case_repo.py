from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.case import Case

class CaseRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, case_id: str) -> Optional[Case]:
        res = await self.session.execute(select(Case).where(Case.case_id == case_id))
        return res.scalar_one_or_none()

    async def list_by_ids(self, case_ids: List[str]) -> List[Case]:
        res = await self.session.execute(select(Case).where(Case.case_id.in_(case_ids)))
        return res.scalars().all()
