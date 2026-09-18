from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.document import Document

class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, doc_id: str) -> Optional[Document]:
        res = await self.session.execute(select(Document).where(Document.id == doc_id))
        return res.scalar_one_or_none()

    async def list_by_case(self, case_id: str) -> List[Document]:
        res = await self.session.execute(select(Document).where(Document.case_id == case_id))
        return res.scalars().all()
