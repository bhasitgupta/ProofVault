"""
Sparse / Lexical Vector Generation (BM25 token frequency style).
"""
import re
from typing import Dict, List, Tuple, Any
from collections import Counter

class SparseEncoder:
    def __init__(self):
        pass

    def encode_text(self, text: str) -> Dict[str, Any]:
        words = re.findall(r"\w+", text.lower())
        counts = Counter(words)
        total = len(words) or 1
        
        # indices / values representation for Qdrant sparse vector
        indices = []
        values = []
        for word, count in counts.items():
            # Hash word to an integer index (32-bit positive)
            idx = abs(hash(word)) % (2**31 - 1)
            tf = count / total
            indices.append(idx)
            values.append(float(tf))
            
        return {
            "indices": indices,
            "values": values
        }

    def encode_query(self, query: str) -> Dict[str, Any]:
        return self.encode_text(query)
