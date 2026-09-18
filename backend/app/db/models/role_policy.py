from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, Text
from app.db.base import Base, TimestampMixin

class RolePolicy(Base, TimestampMixin):
    __tablename__ = "role_policies"

    role: Mapped[str] = mapped_column(String(32), primary_key=True)
    clearance_ceiling: Mapped[str] = mapped_column(String(32), default="RESTRICTED")
    description: Mapped[str] = mapped_column(Text, default="")
    can_download: Mapped[bool] = mapped_column(Boolean, default=True)
    can_issue_cert: Mapped[bool] = mapped_column(Boolean, default=True)
    can_query_rag: Mapped[bool] = mapped_column(Boolean, default=True)
    can_ingest: Mapped[bool] = mapped_column(Boolean, default=True)
