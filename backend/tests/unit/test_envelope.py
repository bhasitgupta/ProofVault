import pytest
from cryptography.exceptions import InvalidTag
from app.crypto.envelope import generate_dek, encrypt_blob, decrypt_blob

def test_envelope_encryption_roundtrip():
    plaintext = b"Highly confidential forensic data 9999"
    doc_id = "doc-uuid-1234"
    dek = generate_dek()
    assert len(dek) == 32

    ciphertext, nonce = encrypt_blob(plaintext, dek, doc_id)
    assert ciphertext != plaintext

    decrypted = decrypt_blob(ciphertext, nonce, dek, doc_id)
    assert decrypted == plaintext

def test_aad_mismatch_raises_invalid_tag():
    plaintext = b"Authenticity payload"
    doc_id = "doc-original"
    dek = generate_dek()
    ciphertext, nonce = encrypt_blob(plaintext, dek, doc_id)

    # Swapping AAD (doc_id) must raise InvalidTag
    with pytest.raises(InvalidTag):
        decrypt_blob(ciphertext, nonce, dek, "doc-forged")
