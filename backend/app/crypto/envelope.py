import os
from typing import Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def generate_dek() -> bytes:
    """Generates a cryptographically secure random 256-bit DEK."""
    return AESGCM.generate_key(bit_length=256)

def encrypt_blob(plaintext: bytes, dek: bytes, doc_id: str) -> Tuple[bytes, bytes]:
    """
    Encrypts plaintext with AES-256-GCM.
    AAD is bound to doc_id (C3 / C4 in Plan): swapping ciphertext between two doc_ids fails decryption.
    Returns (ciphertext_with_tag, nonce).
    """
    aesgcm = AESGCM(dek)
    nonce = os.urandom(12)  # Standard 96-bit nonce for GCM
    aad = doc_id.encode("utf-8")
    ciphertext = aesgcm.encrypt(nonce, plaintext, aad)
    return (ciphertext, nonce)

def decrypt_blob(ciphertext: bytes, nonce: bytes, dek: bytes, doc_id: str) -> bytes:
    """
    Decrypts ciphertext with AES-256-GCM verifying AAD against doc_id.
    """
    aesgcm = AESGCM(dek)
    aad = doc_id.encode("utf-8")
    return aesgcm.decrypt(nonce, ciphertext, aad)
