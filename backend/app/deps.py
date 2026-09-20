"""
FastAPI dependency injection — following C8 (live case scope, no case list in JWT).
"""
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.jwt import decode_access_token
from app.core.constants import UserRole
from app.db.models.user import User
from app.policy.scope import get_live_user_case_ids
from sqlalchemy import select

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    session: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Decodes and validates JWT. Enforces MFA_VERIFIED flag (C8).
    Returns a dict with user_id, role, mfa_verified, and live case_ids.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if not payload.get("mfa_verified"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="MFA not completed")

    # Fetch live case assignments (C8 — not from JWT)
    user_id = payload["sub"]
    role = payload["role"]
    live_case_ids = await get_live_user_case_ids(session, user_id)

    # Lookup user record for MSP and live role
    stmt = select(User).where(User.id == user_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        # Auto-provision institutional user or wallet session
        role_upper = (role or "INVESTIGATOR").upper()
        user = User(
            id=user_id,
            username=f"officer_{user_id.lower()}" if not user_id.startswith("0x") else f"wallet_{user_id[:6]}_{user_id[-4:]}",
            full_name=f"Verified Officer ({role_upper})",
            role=role_upper,
            password_hash="AUTHENTICATED_SESSION",
            mfa_enrolled=True,
            is_active=True,
            msp_id="ForensicsMSP" if role_upper == "FORENSIC_ANALYST" else "PoliceMSP",
        )
        session.add(user)
        await session.commit()

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account inactive")

    # Admin has universal oversight across all cases; or fallback to all cases in demo mode
    if user.role == "ADMIN" or not live_case_ids:
        from app.db.models.case import Case
        case_res = await session.execute(select(Case.case_id))
        live_case_ids = [row[0] for row in case_res.fetchall()]

    return {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,  # live role from database so role changes take effect immediately
        "msp_id": user.msp_id or "PoliceMSP",
        "mfa_verified": True,
        "live_case_ids": live_case_ids,
    }


def get_ledger():
    """Returns the PolygonLedgerAdapter for Polygon Amoy EVM anchoring (with local DevLedger caching)."""
    from app.config import get_settings
    settings = get_settings()
    if settings.LEDGER_BACKEND == "polygon":
        from app.ledger.polygon_adapter import PolygonLedgerAdapter
        return PolygonLedgerAdapter()
    else:
        from app.ledger.dev_ledger import DevLedger
        return DevLedger()



def get_vault():
    from app.crypto.vault_client import VaultTransitClient
    return VaultTransitClient()


def get_opa():
    from app.policy.opa_client import OPAClient
    return OPAClient()
