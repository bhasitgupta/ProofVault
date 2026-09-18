import hashlib

def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def compute_sha512(data: bytes) -> str:
    return hashlib.sha512(data).hexdigest()
