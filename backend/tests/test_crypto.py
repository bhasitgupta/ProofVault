import pytest
import hashlib

def test_sha256_hash_length():
    h = hashlib.sha256(b"proofvault_forensic_payload").hexdigest()
    assert len(h) == 64
