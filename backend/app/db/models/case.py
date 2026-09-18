from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String
from app.db.base import Base, TimestampMixin

class Case(Base, TimestampMixin):
    __tablename__ = "cases"

    case_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(256))
    description: Mapped[str] = mapped_column(String(1024), default="")
    classification_ceiling: Mapped[str] = mapped_column(String(32), default="CONFIDENTIAL")
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")
    owning_msp: Mapped[str] = mapped_column(String(64), default="PoliceMSP")
