from typing import Optional, Tuple

async def check_content_duplicate(session, content_hash: str) -> Optional[str]:
    """
    Checks if a document with this content_hash already exists in storage.
    Returns the existing doc_id if duplicate, else None.

    C9 FIX: We deduplicate STORAGE only (return existing storage path).
    A new custody event is ALWAYS written regardless — the fact that a second
    officer re-uploaded the same evidence to a different case is audit-significant.
    """
    from sqlalchemy import select
    from app.db.models.document import Document

    stmt = select(Document.id).where(Document.content_hash == content_hash)
    result = await session.execute(stmt)
    row = result.fetchone()
    return row[0] if row else None
