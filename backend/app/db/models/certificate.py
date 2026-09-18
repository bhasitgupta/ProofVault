from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String
from app.db.base import Base, TimestampMixin

class Certificate(Base, TimestampMixin):
    __tablename__ = "certificates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    doc_id: Mapped[str] = mapped_column(String(64), index=True)
    issuer_id: Mapped[str] = mapped_column(String(64))
    certificate_type: Mapped[str] = mapped_column(String(32), default="BSA_63_SCHEDULE")
    pdf_path: Mapped[str] = mapped_column(String(512))
    pdf_hash: Mapped[str] = mapped_column(String(64))
    ledger_tx_id: Mapped[str] = mapped_column(String(128), default="")
