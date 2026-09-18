from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean
from app.db.base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(128))
    role: Mapped[str] = mapped_column(String(32))  # INVESTIGATOR, FORENSIC_ANALYST, etc.
    password_hash: Mapped[str] = mapped_column(String(256))
    totp_secret: Mapped[str] = mapped_column(String(64), default="")
    mfa_enrolled: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    msp_id: Mapped[str] = mapped_column(String(64), default="PoliceMSP")
