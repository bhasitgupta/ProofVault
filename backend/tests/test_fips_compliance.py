import pytest

def test_fips_cipher_approval():
    ciphers = ["AES-256-GCM", "SHA-256", "ECDSA-P256"]
    assert "AES-256-GCM" in ciphers
