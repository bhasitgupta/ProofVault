from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.audit_log import AuditLog

class AuditRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_by_case(self, case_id: str, limit: int = 100) -> List[AuditLog]:
        res = await self.session.execute(
            select(AuditLog).where(AuditLog.case_id == case_id).limit(limit)
        )
        return res.scalars().all()
