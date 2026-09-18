from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.db.session import get_db
from app.db.models.user import User
from app.core.security import verify_password
from app.core.mfa import verify_totp_code, generate_totp_secret, get_totp_uri
from app.core.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    partial_token: str
    mfa_required: bool
    totp_uri: Optional[str] = None   # Only on first enrolment


class MFAVerifyRequest(BaseModel):
    partial_token: str
    totp_code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, session: AsyncSession = Depends(get_db)):
    """Phase 1: Verify username + password. Return partial JWT (mfa_verified=False)."""
    stmt = select(User).where(User.username == req.username)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    # Issue partial token — mfa_verified=False
    partial_token = create_access_token(
        sub=user.id,
        role=user.role,
        mfa_verified=False,
        expires_delta_minutes=10,  # short-lived pending MFA
    )

    totp_uri = None
    if not user.mfa_enrolled:
        # First enrolment — return the QR URI so the frontend can display it
        totp_uri = get_totp_uri(user.totp_secret, user.username)

    return LoginResponse(
        partial_token=partial_token,
        mfa_required=True,
        totp_uri=totp_uri,
    )


@router.post("/mfa/verify", response_model=TokenResponse)
async def mfa_verify(req: MFAVerifyRequest, session: AsyncSession = Depends(get_db)):
    """Phase 2: Verify TOTP code. Issue full JWT with mfa_verified=True."""
    from app.core.jwt import decode_access_token

    payload = decode_access_token(req.partial_token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Partial token invalid or expired")

    user_id = payload["sub"]
    stmt = select(User).where(User.id == user_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    if not verify_totp_code(user.totp_secret, req.totp_code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid TOTP code")

    # Mark enrolled if first time
    if not user.mfa_enrolled:
        user.mfa_enrolled = True
        await session.commit()

    # Issue full token
    full_token = create_access_token(
        sub=user.id,
        role=user.role,
        mfa_verified=True,
    )
    return TokenResponse(access_token=full_token)
