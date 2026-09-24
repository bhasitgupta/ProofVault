import hashlib
import struct
from typing import List, Dict, Any, Tuple

# Domain separation prefixes (C2 / docs/merkle-spec.md)
LEAF_PREFIX = b"\x00"
NODE_PREFIX = b"\x01"

def hash_leaf(doc_id: str, chunk_index: int, chunk_text: str) -> str:
    """
    leaf_i = SHA-256(0x00 || docId_utf8 || uint32be(i) || chunk_text_utf8)
    """
    h = hashlib.sha256()
    h.update(LEAF_PREFIX)
    h.update(doc_id.encode("utf-8"))
    h.update(struct.pack(">I", chunk_index))
    h.update(chunk_text.encode("utf-8"))
    return h.hexdigest()

def hash_nodes(left_hex: str, right_hex: str) -> str:
    """
    node = SHA-256(0x01 || left_bytes || right_bytes)
    """
    h = hashlib.sha256()
    h.update(NODE_PREFIX)
    h.update(bytes.fromhex(left_hex))
    h.update(bytes.fromhex(right_hex))
    return h.hexdigest()

class MerkleTree:
    def __init__(self, doc_id: str, chunk_texts: List[str]):
        self.doc_id = doc_id
        self.chunk_texts = chunk_texts
        self.leaves: List[str] = [
            hash_leaf(doc_id, i, text) for i, text in enumerate(chunk_texts)
        ]
        if not self.leaves:
            self.root = hashlib.sha256(LEAF_PREFIX).hexdigest()
            self.levels: List[List[str]] = [[self.root]]
        else:
            self.levels: List[List[str]] = self._build_tree(self.leaves)
            self.root = self.levels[-1][0]

    def _build_tree(self, leaves: List[str]) -> List[List[str]]:
        levels = [leaves]
        current = leaves
        while len(current) > 1:
            next_level: List[str] = []
            for i in range(0, len(current), 2):
                if i + 1 < len(current):
                    next_level.append(hash_nodes(current[i], current[i + 1]))
                else:
                    # Odd node promoted directly without duplication
                    next_level.append(current[i])
            levels.append(next_level)
            current = next_level
        return levels

    def get_proof(self, chunk_index: int) -> List[Dict[str, str]]:
        """
        Generates inclusion proof for leaf at chunk_index.
        Each proof item is: {"hash": sibling_hash, "side": "left" | "right"}
        """
        if chunk_index < 0 or chunk_index >= len(self.leaves):
            raise IndexError("Chunk index out of bounds")

        proof: List[Dict[str, str]] = []
        idx = chunk_index
        for level in self.levels[:-1]:
            is_odd = (idx % 2 == 1)
            if is_odd:
                sibling_idx = idx - 1
                proof.append({"hash": level[sibling_idx], "side": "left"})
            else:
                sibling_idx = idx + 1
                if sibling_idx < len(level):
                    proof.append({"hash": level[sibling_idx], "side": "right"})
                # If there is no right sibling (promoted node), nothing added to proof at this level
            idx //= 2
        return proof

def verify_merkle_proof(
    doc_id: str, chunk_index: int, chunk_text: str, root_hex: str, proof: List[Dict[str, str]]
) -> bool:
    """
    Verifies that chunk_text at chunk_index belongs to tree with root_hex using proof.
    """
    current_hash = hash_leaf(doc_id, chunk_index, chunk_text)
    for step in proof:
        sibling = step["hash"]
        side = step["side"]
        if side == "left":
            current_hash = hash_nodes(sibling, current_hash)
        else:
            current_hash = hash_nodes(current_hash, sibling)
    return current_hash.lower() == root_hex.lower()

"""Merkle Tree: Deterministic binary Merkle tree engine for evidence chunks."""
