from datetime import datetime, timezone
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, String

class Base(DeclarativeBase):
    pass

def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=_utcnow_naive
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=_utcnow_naive, onupdate=_utcnow_naive
    )

# Import all models so SQLAlchemy's metadata.create_all() knows every table.
# This file is imported by session.py before create_all is called.
from app.db.models.user import User          # noqa: F401, E402
from app.db.models.case import Case          # noqa: F401, E402
from app.db.models.assignment import Assignment  # noqa: F401, E402
from app.db.models.document import Document  # noqa: F401, E402
from app.db.models.chunk import Chunk        # noqa: F401, E402
from app.db.models.audit_log import AuditLog  # noqa: F401, E402
from app.db.models.incident import Incident  # noqa: F401, E402
from app.db.models.receipt import Receipt    # noqa: F401, E402
from app.db.models.certificate import Certificate  # noqa: F401, E402
