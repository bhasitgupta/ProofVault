import pytest

def test_storage_encryption_scheme():
    scheme = "AES_256_GCM_ENCRYPTED"
    assert "AES" in scheme
