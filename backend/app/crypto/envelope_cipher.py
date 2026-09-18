import os
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class EnvelopeCipher:
    """
    Envelope Encryption Engine:
    Each document is encrypted with a unique Data Encryption Key (DEK).
    DEK is wrapped with Master Key (KEK) using AES-256-GCM and authenticated with doc_id AAD.
    """
    @staticmethod
    def generate_dek() -> bytes:
        return AESGCM.generate_key(bit_length=256)

    @classmethod
    def encrypt_payload(cls, plaintext: bytes, dek: bytes, aad: bytes) -> (bytes, bytes):
        aesgcm = AESGCM(dek)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext, aad)
        return nonce, ciphertext

    @classmethod
    def decrypt_payload(cls, ciphertext: bytes, nonce: bytes, dek: bytes, aad: bytes) -> bytes:
        aesgcm = AESGCM(dek)
        return aesgcm.decrypt(nonce, ciphertext, aad)
