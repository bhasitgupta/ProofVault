from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.incident import Incident

class IncidentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, incident_id: str) -> Optional[Incident]:
        res = await self.session.execute(select(Incident).where(Incident.id == incident_id))
        return res.scalar_one_or_none()

    async def list_open(self) -> List[Incident]:
        res = await self.session.execute(select(Incident).where(Incident.status == "OPEN"))
        return res.scalars().all()
