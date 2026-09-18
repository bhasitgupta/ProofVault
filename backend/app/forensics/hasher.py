import hashlib

def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def compute_sha512(data: bytes) -> str:
    return hashlib.sha512(data).hexdigest()

def compute_dual_hashes(data: bytes) -> dict:
    return {'sha256': compute_sha256(data), 'sha512': compute_sha512(data)}

def verify_bitstream(original_hash: str, new_data: bytes) -> bool:
    return compute_sha256(new_data) == original_hash.lower()
