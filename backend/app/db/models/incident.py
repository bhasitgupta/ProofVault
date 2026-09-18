from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text
from app.db.base import Base, TimestampMixin

class Incident(Base, TimestampMixin):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    doc_id: Mapped[str] = mapped_column(String(64), index=True)
    failing_check: Mapped[str] = mapped_column(String(64))  # BLOB_HASH, MERKLE_PROOF, CONTENT_HASH, AAD
    actor_id: Mapped[str] = mapped_column(String(64))
    details: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="OPEN")  # OPEN, RESOLVED
    ledger_tx_id: Mapped[str] = mapped_column(String(128), default="")
