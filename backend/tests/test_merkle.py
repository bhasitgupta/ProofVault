import pytest
import hashlib

def test_merkle_leaf_hash():
    chunk = b"forensic_chunk_001"
    leaf = hashlib.sha256(chunk).hexdigest()
    assert len(leaf) == 64
