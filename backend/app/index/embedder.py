"""
Dense Embedder Module (BAAI/bge-m3 or deterministic mock for airgap/dev).
"""
import hashlib
import struct
from typing import List

class DenseEmbedder:
    def __init__(self, model_name: str = "BAAI/bge-m3"):
        self.model_name = model_name
        self._model = None
        self.dim = 1024

    def _init_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except Exception:
                self._model = "fallback"

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        self._init_model()
        if self._model != "fallback" and hasattr(self._model, "encode"):
            try:
                embeddings = self._model.encode(texts, normalize_embeddings=True)
                return [e.tolist() for e in embeddings]
            except Exception:
                pass
        
        # Fallback deterministic pseudo-embedding (1024 dim unit vector)
        results = []
        for text in texts:
            vec = []
            seed = hashlib.sha256(text.encode("utf-8")).digest()
            for i in range(self.dim):
                b_idx = (i * 2) % len(seed)
                val = struct.unpack(">h", seed[b_idx:b_idx+2])[0] / 32768.0
                vec.append(float(val))
            # Normalize
            norm = sum(x*x for x in vec) ** 0.5 or 1.0
            results.append([x / norm for x in vec])
        return results

    def embed_query(self, query: str) -> List[float]:
        return self.embed_texts([query])[0]
