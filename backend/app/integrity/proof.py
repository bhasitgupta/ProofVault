"""
Merkle Proof Utilities.
Builds and serializes inclusion proofs for chunk verification.
"""
from typing import List, Dict, Any
from app.crypto.merkle import MerkleTree, verify_merkle_proof

def build_chunk_proof(doc_id: str, all_chunk_texts: List[str], target_chunk_index: int) -> Dict[str, Any]:
    tree = MerkleTree(doc_id, all_chunk_texts)
    proof = tree.get_proof(target_chunk_index)
    return {
        "root": tree.root,
        "leaf_count": len(all_chunk_texts),
        "chunk_index": target_chunk_index,
        "proof": proof
    }

def verify_chunk_proof(
    doc_id: str,
    chunk_index: int,
    chunk_text: str,
    proof: List[Dict[str, Any]],
    expected_root: str
) -> bool:
    return verify_merkle_proof(
        doc_id=doc_id,
        chunk_index=chunk_index,
        chunk_text=chunk_text,
        proof=proof,
        expected_root=expected_root
    )
