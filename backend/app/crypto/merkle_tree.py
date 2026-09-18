import hashlib
from typing import List, Optional

class MerkleTree:
    """
    Cryptographic Merkle Tree for batching evidentiary logs into a single root hash.
    Used for Polygon Amoy blockchain commitments.
    """
    def __init__(self, leaves: List[bytes]):
        self.leaves = [self._hash(l) for l in leaves] if leaves else [bytes(32)]
        self.levels = [self.leaves]
        self._build_tree()

    @staticmethod
    def _hash(data: bytes) -> bytes:
        return hashlib.sha256(data).digest()

    @staticmethod
    def _combine(left: bytes, right: bytes) -> bytes:
        if left <= right:
            return hashlib.sha256(left + right).digest()
        return hashlib.sha256(right + left).digest()

    def _build_tree(self):
        current = self.leaves
        while len(current) > 1:
            next_level = []
            for i in range(0, len(current), 2):
                left = current[i]
                right = current[i + 1] if i + 1 < len(current) else left
                next_level.append(self._combine(left, right))
            self.levels.append(next_level)
            current = next_level

    @property
    def root(self) -> bytes:
        return self.levels[-1][0]

    @property
    def root_hex(self) -> str:
        return self.root.hex()

    def get_proof(self, index: int) -> List[str]:
        proof = []
        for level in self.levels[:-1]:
            is_right = index % 2 == 1
            sibling_index = index - 1 if is_right else index + 1
            if sibling_index < len(level):
                proof.append(level[sibling_index].hex())
            else:
                proof.append(level[index].hex())
            index //= 2
        return proof
