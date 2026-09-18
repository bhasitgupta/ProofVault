import hashlib
from typing import BinaryIO, Union

def hash_bytes(data: bytes) -> str:
    """Computes SHA-256 over raw bytes."""
    return hashlib.sha256(data).hexdigest()

def content_hash(stream_or_bytes: Union[BinaryIO, bytes]) -> str:
    """
    Streaming SHA-256 over plaintext bytes (evidentiary identity).
    Appears on BSA Section 63 Schedule certificate.
    """
    if isinstance(stream_or_bytes, bytes):
        return hashlib.sha256(stream_or_bytes).hexdigest()
    
    h = hashlib.sha256()
    while chunk := stream_or_bytes.read(65536):
        h.update(chunk)
    return h.hexdigest()

def blob_hash(ciphertext_stream_or_bytes: Union[BinaryIO, bytes]) -> str:
    """
    Streaming SHA-256 over ciphertext bytes.
    Detects at-rest storage tampering without decrypting.
    """
    return content_hash(ciphertext_stream_or_bytes)
