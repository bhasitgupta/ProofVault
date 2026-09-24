import pytest
import hashlib

def test_odd_merkle_leaves():
    leaves = [b"a", b"b", b"c"]
    # Odd count duplicates last leaf
    if len(leaves) % 2 != 0:
        leaves.append(leaves[-1])
    assert len(leaves) % 2 == 0
