"""
Retriever module.
Queries Qdrant with hybrid vectors and falls back to SQLite DB if Qdrant is offline.
"""
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.index.embedder import DenseEmbedder
from app.index.sparse import SparseEncoder
from app.index.qdrant_store import QdrantStore
from app.db.models.chunk import Chunk
from app.db.models.document import Document

class HybridRetriever:
    def __init__(self):
        self.embedder = DenseEmbedder()
        self.sparse_encoder = SparseEncoder()
        self.qdrant_store = QdrantStore()

    async def retrieve(
        self,
        query: str,
        case_ids: List[str],
        classification_ceiling: str,
        session: AsyncSession,
        limit: int = 8
    ) -> List[Dict[str, Any]]:
        # 1. Try Qdrant hybrid search
        dense_q = self.embedder.embed_query(query)
        sparse_q = self.sparse_encoder.encode_query(query)
        hits = self.qdrant_store.hybrid_search(
            query_dense=dense_q,
            query_sparse=sparse_q,
            case_ids=case_ids,
            classification_ceiling=classification_ceiling,
            limit=limit
        )

        if hits:
            return [h["payload"] for h in hits]

        # 2. Fallback to SQL DB retrieval
        return await self._db_fallback(query, case_ids, classification_ceiling, session, limit)

    async def _db_fallback(
        self,
        query: str,
        case_ids: List[str],
        classification_ceiling: str,
        session: AsyncSession,
        limit: int
    ) -> List[Dict[str, Any]]:
        cls_weights = {"RESTRICTED": 1, "CONFIDENTIAL": 2, "SECRET": 3}
        max_w = cls_weights.get(classification_ceiling, 1)

        stmt = (
            select(Chunk, Document)
            .join(Document, Chunk.doc_id == Document.id)
            .where(Document.case_id.in_(case_ids))
            .where(Document.status == "ACTIVE")
            .limit(30)
        )
        res = await session.execute(stmt)
        rows = res.fetchall()

        q_terms = set(query.lower().split())
        scored = []
        for chunk, doc in rows:
            if cls_weights.get(doc.classification, 1) > max_w:
                continue
            c_terms = set(chunk.chunk_text.lower().split())
            score = len(q_terms & c_terms)
            scored.append((score, chunk, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [
            {
                "doc_id": c.doc_id,
                "case_id": d.case_id,
                "classification": d.classification,
                "doc_type": d.doc_type,
                "chunk_index": c.chunk_index,
                "chunk_hash": c.chunk_hash,
                "chunk_text": c.chunk_text,
                "page_number": c.page_number,
                "ledger_tx_id": d.ledger_tx_id
            }
            for _, c, d in scored[:limit]
        ]
