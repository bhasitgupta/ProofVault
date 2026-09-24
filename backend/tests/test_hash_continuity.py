import pytest
import hashlib

def test_sequential_hash():
    h1 = hashlib.sha256(b"event_1").hexdigest()
    h2 = hashlib.sha256(h1.encode() + b"event_2").hexdigest()
    assert len(h2) == 64
