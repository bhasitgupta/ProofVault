"""
Reranker module.
Scores retrieved chunks against the query using token overlap or cross-encoder.
"""
from typing import List, Dict, Any

class Reranker:
    def __init__(self):
        pass

    def rerank(self, query: str, chunks: List[Dict[str, Any]], top_k: int = 6) -> List[Dict[str, Any]]:
        if not chunks:
            return []
        
        q_tokens = set(query.lower().split())
        scored = []
        for c in chunks:
            text = c.get("chunk_text", "")
            t_tokens = set(text.lower().split())
            overlap = len(q_tokens & t_tokens)
            scored.append((overlap, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:top_k]]
