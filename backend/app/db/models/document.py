from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey
from app.db.base import Base, TimestampMixin

class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    case_id: Mapped[str] = mapped_column(String(64), ForeignKey("cases.case_id"), index=True)
    filename: Mapped[str] = mapped_column(String(256))
    content_hash: Mapped[str] = mapped_column(String(64), index=True)  # Plaintext hash (BSA Sec 63)
    blob_hash: Mapped[str] = mapped_column(String(64), index=True)     # Ciphertext hash
    chunk_merkle_root: Mapped[str] = mapped_column(String(64))         # Chunk Merkle Root
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    size_bytes: Mapped[int] = mapped_column(Integer)
    mime_type: Mapped[str] = mapped_column(String(64), default="application/pdf")
    doc_type: Mapped[str] = mapped_column(String(32))                  # FIR, CHARGESHEET, etc.
    classification: Mapped[str] = mapped_column(String(32))            # RESTRICTED, CONFIDENTIAL, SECRET
    uploader_id: Mapped[str] = mapped_column(String(64))
    storage_path: Mapped[str] = mapped_column(String(512))
    wrapped_dek: Mapped[str] = mapped_column(String(512))              # Vault wrapped key
    nonce_hex: Mapped[str] = mapped_column(String(64))                 # AES-GCM nonce
    ledger_tx_id: Mapped[str] = mapped_column(String(128))             # Anchoring tx on dochash channel
    tsa_token_hash: Mapped[str] = mapped_column(String(64), default="")
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")
