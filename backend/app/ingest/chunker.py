import hashlib
import struct
from typing import List, Dict, Any

CHUNK_TARGET_TOKENS = 700   # ~700 word tokens per chunk
OVERLAP_RATIO = 0.15         # 15% overlap
WORDS_PER_TOKEN = 0.75       # approximate

def _approx_tokens(text: str) -> int:
    return max(1, int(len(text.split()) / WORDS_PER_TOKEN))

def chunk_pages(
    pages: List[Dict[str, Any]],   # [{"page_number": int, "text": str}]
    doc_id: str
) -> List[Dict[str, Any]]:
    """
    Splits pages into overlapping chunks of ~700 tokens carrying
    page_number, chunk_index, and chunk_hash per the merkle-spec.

    chunk_hash = SHA-256(0x00 || docId_utf8 || uint32be(i) || chunk_text_utf8)
    — matches the leaf hash used in MerkleTree so DevLedger proofs stay consistent.
    """
    full_text = "\n".join(p["text"] for p in pages)
    words = full_text.split()

    chunk_size_words = int(CHUNK_TARGET_TOKENS * WORDS_PER_TOKEN)
    overlap_words = int(chunk_size_words * OVERLAP_RATIO)
    step = chunk_size_words - overlap_words

    chunks: List[Dict[str, Any]] = []
    word_idx = 0
    chunk_index = 0

    while word_idx < len(words):
        chunk_words = words[word_idx: word_idx + chunk_size_words]
        chunk_text = " ".join(chunk_words)

        # Approximate which page this chunk is from
        char_offset = len(" ".join(words[:word_idx]))
        page_number = _estimate_page(char_offset, pages)

        # Domain-separated chunk hash (0x00 prefix matches MerkleTree leaf formula)
        h = hashlib.sha256()
        h.update(b"\x00")
        h.update(doc_id.encode("utf-8"))
        h.update(struct.pack(">I", chunk_index))
        h.update(chunk_text.encode("utf-8"))
        chunk_hash = h.hexdigest()

        chunks.append({
            "chunk_index": chunk_index,
            "chunk_text": chunk_text,
            "chunk_hash": chunk_hash,
            "page_number": page_number,
        })

        chunk_index += 1
        word_idx += step
        if word_idx >= len(words):
            break

    # Handle very short documents
    if not chunks and words:
        text = full_text
        h = hashlib.sha256()
        h.update(b"\x00")
        h.update(doc_id.encode("utf-8"))
        h.update(struct.pack(">I", 0))
        h.update(text.encode("utf-8"))
        chunks.append({
            "chunk_index": 0,
            "chunk_text": text,
            "chunk_hash": h.hexdigest(),
            "page_number": 1,
        })

    return chunks


def _estimate_page(char_offset: int, pages: List[Dict[str, Any]]) -> int:
    running = 0
    for p in pages:
        running += len(p["text"])
        if char_offset <= running:
            return p["page_number"]
    return pages[-1]["page_number"] if pages else 1
