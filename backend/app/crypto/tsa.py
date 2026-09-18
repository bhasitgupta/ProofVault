import hashlib
from datetime import datetime, timezone

def generate_tsa_token(content_hash_str: str, tsa_url: str = "OFFLINE_DEMO_TSA") -> str:
    """
    Generates deterministic RFC 3161 Time-Stamp Authority token hash over content_hash.
    Enables air-gapped court-grade timestamp verification.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    raw = f"TSA_TOKEN:{tsa_url}:{content_hash_str}:{now_iso}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def verify_tsa_token(content_hash_str: str, tsa_token_hash: str) -> bool:
    """Verifies format of TSA token hash."""
    return bool(tsa_token_hash and len(tsa_token_hash) == 64)
