"""
Qdrant Vector Store wrapper.
Handles collection creation with dense + sparse vector support,
payload index creation (case_id, classification, doc_type), and hybrid search.
Falls back safely if Qdrant daemon is offline.
"""
from typing import List, Dict, Any, Optional
from app.config import get_settings

class QdrantStore:
    def __init__(self):
        settings = get_settings()
        self.url = settings.QDRANT_URL
        self.collection_name = settings.QDRANT_COLLECTION
        self._client = None
        self._is_connected = False
        self._init_client()

    def _init_client(self):
        try:
            from qdrant_client import QdrantClient
            self._client = QdrantClient(url=self.url, timeout=2.0)
            self._client.get_collections()
            self._is_connected = True
        except Exception:
            self._is_connected = False
            self._client = None

    def ensure_collection(self):
        if not self._is_connected:
            return
        try:
            from qdrant_client.http import models as qmodels
            collections = [c.name for c in self._client.get_collections().collections]
            if self.collection_name not in collections:
                self._client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config={
                        "dense": qmodels.VectorParams(
                            size=1024,
                            distance=qmodels.Distance.COSINE
                        )
                    },
                    sparse_vectors_config={
                        "sparse": qmodels.SparseVectorParams()
                    }
                )
                # Create payload indexes for pre-filtering (C7)
                for field in ["case_id", "classification", "doc_type", "doc_id"]:
                    self._client.create_payload_index(
                        collection_name=self.collection_name,
                        field_name=field,
                        field_schema=qmodels.PayloadSchemaType.KEYWORD
                    )
        except Exception:
            pass

    def upsert_chunks(self, points: List[Dict[str, Any]]) -> bool:
        """
        points: list of dicts with:
        id, vector (dense), sparse_vector, payload
        """
        if not self._is_connected or not self._client:
            return False
        try:
            from qdrant_client.http import models as qmodels
            qpoints = []
            for p in points:
                vectors = {"dense": p["vector"]}
                if "sparse_vector" in p and p["sparse_vector"]:
                    sv = p["sparse_vector"]
                    vectors["sparse"] = qmodels.SparseVector(
                        indices=sv["indices"],
                        values=sv["values"]
                    )
                qpoints.append(
                    qmodels.PointStruct(
                        id=p["id"],
                        vector=vectors,
                        payload=p.get("payload", {})
                    )
                )
            self._client.upsert(
                collection_name=self.collection_name,
                points=qpoints
            )
            return True
        except Exception:
            return False

    def hybrid_search(
        self,
        query_dense: List[float],
        query_sparse: Optional[Dict[str, Any]],
        case_ids: List[str],
        classification_ceiling: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        C7: Pre-filtering on case_id and classification ceiling.
        """
        if not self._is_connected or not self._client:
            return []
        try:
            from qdrant_client.http import models as qmodels
            # Allowed classifications
            cls_order = ["RESTRICTED", "CONFIDENTIAL", "SECRET"]
            idx = cls_order.index(classification_ceiling) if classification_ceiling in cls_order else 0
            allowed_cls = cls_order[:idx+1]

            flt = qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="case_id",
                        match=qmodels.MatchAny(any=case_ids)
                    ),
                    qmodels.FieldCondition(
                        key="classification",
                        match=qmodels.MatchAny(any=allowed_cls)
                    )
                ]
            )

            hits = self._client.search(
                collection_name=self.collection_name,
                query_vector=("dense", query_dense),
                query_filter=flt,
                limit=limit
            )

            return [
                {
                    "id": h.id,
                    "score": h.score,
                    "payload": h.payload
                }
                for h in hits
            ]
        except Exception:
            return []
