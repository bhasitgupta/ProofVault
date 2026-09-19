import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import get_settings
from app.db.base import Base

# Import all models so metadata is completely populated
import app.db.models.user  # noqa: F401
import app.db.models.case  # noqa: F401
import app.db.models.assignment  # noqa: F401
import app.db.models.document  # noqa: F401
import app.db.models.chunk  # noqa: F401
import app.db.models.incident  # noqa: F401
import app.db.models.certificate  # noqa: F401
import app.db.models.audit_log  # noqa: F401
import app.db.models.receipt  # noqa: F401
import app.db.models.role_policy  # noqa: F401

DATABASE_URL = get_settings().DATABASE_URL

connect_args = {}
engine_kwargs = {"echo": False}

if "postgresql" in DATABASE_URL or "postgres" in DATABASE_URL:
    # Essential for Supabase PgBouncer pooler (port 6543)
    connect_args["statement_cache_size"] = 0
    engine_kwargs["connect_args"] = connect_args
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_async_engine(DATABASE_URL, **engine_kwargs)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
AsyncSessionLocal = async_session_factory  # alias for direct use in tests/scripts

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Auto seed initial cases, users, assignments, and documents
    try:
        from app.db.seed import auto_seed_database
        async with async_session_factory() as session:
            await auto_seed_database(session)
    except Exception as e:
        import traceback
        print(f"[WARN] Auto-seeding encountered warning: {e}")
        traceback.print_exc()

async def get_db():
    async with async_session_factory() as session:
        yield session

