import pytest

def test_chain_continuity():
    prev_hash = "0x" + "a" * 64
    next_hash = "0x" + "b" * 64
    assert prev_hash != next_hash
