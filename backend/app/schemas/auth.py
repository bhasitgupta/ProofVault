from pydantic import BaseModel, Field
from typing import Optional

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)

class LoginResponse(BaseModel):
    partial_token: str
    mfa_required: bool = True
    totp_uri: Optional[str] = None

class MFAVerifyRequest(BaseModel):
    partial_token: str
    totp_code: str = Field(..., min_length=6, max_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
