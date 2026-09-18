"""
Indexer Module.
Enforces architectural rule D2:
No chunk goes into Qdrant vector index until RegisterDocument is successfully committed on-chain.
"""
from typing import List, Dict, Any
from app.index.embedder import DenseEmbedder
from app.index.sparse import SparseEncoder
from app.index.qdrant_store import QdrantStore

class Indexer:
    def __init__(self):
        self.embedder = DenseEmbedder()
        self.sparse_encoder = SparseEncoder()
        self.qdrant_store = QdrantStore()
        self.qdrant_store.ensure_collection()

    async def index_document_chunks(
        self,
        doc_id: str,
        case_id: str,
        classification: str,
        doc_type: str,
        chunks: List[Dict[str, Any]],
        ledger_tx_id: str
    ) -> bool:
        """
        D2 GATE: Requires valid ledger_tx_id before indexing.
        """
        if not ledger_tx_id:
            raise RuntimeError(f"D2 Gate Violation: Refusing to index doc {doc_id} without ledger commit tx_id")

        if not chunks:
            return True

        texts = [c["chunk_text"] for c in chunks]
        dense_vectors = self.embedder.embed_texts(texts)

        points = []
        for i, c in enumerate(chunks):
            sparse_vec = self.sparse_encoder.encode_text(c["chunk_text"])
            point_id = c.get("id") or f"{doc_id}_{c['chunk_index']}"
            points.append({
                "id": point_id,
                "vector": dense_vectors[i],
                "sparse_vector": sparse_vec,
                "payload": {
                    "doc_id": doc_id,
                    "case_id": case_id,
                    "classification": classification,
                    "doc_type": doc_type,
                    "chunk_index": c["chunk_index"],
                    "chunk_hash": c["chunk_hash"],
                    "chunk_text": c["chunk_text"],
                    "page_number": c.get("page_number", 1),
                    "ledger_tx_id": ledger_tx_id
                }
            })

        return self.qdrant_store.upsert_chunks(points)
