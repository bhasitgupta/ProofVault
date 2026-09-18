import jwt
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

JWT_SECRET = "SDMS_SECRET_KEY_FOR_JWT_DEV_DEMO_2026_MHA"
ALGORITHM = "HS256"

def create_access_token(sub: str, role: str, mfa_verified: bool = True, expires_delta_minutes: int = 60) -> str:
    """
    Creates JWT token carrying ONLY sub, role, mfa_verified, and exp.
    Enforces C8: NO case assignments are baked into JWT to allow live revocation.
    """
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {
        "sub": sub,
        "role": role,
        "mfa_verified": mfa_verified,
        "iat": now,
        "exp": now + timedelta(minutes=expires_delta_minutes),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates JWT token. Returns None on expired or invalid tokens."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
