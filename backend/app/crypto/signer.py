import base64
import hashlib
from typing import Tuple
from cryptography.hazmat.primitives.asymmetric import ed25519

def generate_officer_keypair() -> Tuple[bytes, bytes]:
    """Generates Ed25519 officer signing keypair (private_bytes, public_bytes)."""
    priv = ed25519.Ed25519PrivateKey.generate()
    pub = priv.public_key()
    priv_bytes = priv.private_bytes_raw()
    pub_bytes = pub.public_bytes_raw()
    return (priv_bytes, pub_bytes)

def sign_content_hash(private_key_bytes: bytes, content_hash_str: str) -> str:
    """Signs content_hash using officer private key."""
    priv = ed25519.Ed25519PrivateKey.from_private_bytes(private_key_bytes)
    sig = priv.sign(content_hash_str.encode("utf-8"))
    return base64.b64encode(sig).decode("utf-8")

def verify_officer_signature(public_key_bytes: bytes, content_hash_str: str, sig_b64: str) -> bool:
    """Verifies signature over content_hash."""
    try:
        pub = ed25519.Ed25519PublicKey.from_public_bytes(public_key_bytes)
        sig = base64.b64decode(sig_b64)
        pub.verify(sig, content_hash_str.encode("utf-8"))
        return True
    except Exception:
        return False
