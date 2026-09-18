"""
Citation Validator module.
Extracts [doc_id:chunk_index] citations from generated answer and strictly
enforces that cited documents are within the allowed case scope.
"""
import re
from typing import List, Dict, Any, Set

CITATION_REGEX = r"\[([a-zA-Z0-9_\-]+):(\d+)\]"

def extract_citations(text: str) -> List[Dict[str, Any]]:
    matches = re.findall(CITATION_REGEX, text)
    citations = []
    seen = set()
    for doc_id, chunk_idx in matches:
        key = (doc_id, int(chunk_idx))
        if key not in seen:
            seen.add(key)
            citations.append({
                "doc_id": doc_id,
                "chunk_index": int(chunk_idx)
            })
    return citations

def validate_citations(
    citations: List[Dict[str, Any]],
    allowed_doc_ids: Set[str],
    verified_chunks: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Rejects any citation outside the allowed set. Attaches page_number and chunk_hash.
    """
    valid = []
    chunk_map = {
        (c["doc_id"], c["chunk_index"]): c
        for c in verified_chunks
    }

    for cit in citations:
        doc_id = cit["doc_id"]
        idx = cit["chunk_index"]
        if doc_id in allowed_doc_ids and (doc_id, idx) in chunk_map:
            c = chunk_map[(doc_id, idx)]
            valid.append({
                "doc_id": doc_id,
                "chunk_index": idx,
                "page_number": c.get("page_number", 1),
                "chunk_hash": c.get("chunk_hash", ""),
                "ledger_tx_id": c.get("ledger_tx_id", ""),
                "status": "VERIFIED"
            })
    return valid
