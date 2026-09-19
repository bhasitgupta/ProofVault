import os
import tempfile
from functools import lru_cache
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _resolve_default_db_url() -> str:
    db_env = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    if db_env and db_env.strip():
        if db_env.startswith("postgres://"):
            return db_env.replace("postgres://", "postgresql+asyncpg://", 1)
        if db_env.startswith("postgresql://") and not db_env.startswith("postgresql+asyncpg://"):
            return db_env.replace("postgresql://", "postgresql+asyncpg://", 1)
        return db_env.strip()
    # Fallback to isolated system temp directory to prevent any .db files in repository
    p = os.path.join(tempfile.gettempdir(), "sdms_metadata.db").replace("\\", "/")
    return f"sqlite+aiosqlite:///{p}"


def _resolve_default_storage_dir() -> str:
    storage_env = os.getenv("STORAGE_DIR")
    if storage_env:
        return storage_env
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return os.path.join(tempfile.gettempdir(), "sdms_storage").replace("\\", "/")
    return "storage_data"


def _resolve_default_quarantine_dir() -> str:
    quarantine_env = os.getenv("QUARANTINE_DIR")
    if quarantine_env:
        return quarantine_env
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return os.path.join(tempfile.gettempdir(), "sdms_storage", "quarantine").replace("\\", "/")
    return "storage_data/quarantine"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database (Supabase PostgreSQL / asyncpg)
    DATABASE_URL: str = _resolve_default_db_url()
    SUPABASE_DB_URL: str = ""

    @model_validator(mode="after")
    def _validate_db_url(self) -> "Settings":
        raw = (self.SUPABASE_DB_URL or self.DATABASE_URL or "").strip()
        if raw:
            if raw.startswith("postgres://"):
                raw = raw.replace("postgres://", "postgresql+asyncpg://", 1)
            elif raw.startswith("postgresql://") and not raw.startswith("postgresql+asyncpg://"):
                raw = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
            self.DATABASE_URL = raw
        else:
            p = os.path.join(tempfile.gettempdir(), "sdms_metadata.db").replace("\\", "/")
            self.DATABASE_URL = f"sqlite+aiosqlite:///{p}"
        return self

    # Supabase Cloud Project Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""                                  # anon public key or service role key
    SUPABASE_SERVICE_ROLE_KEY: str = ""                     # elevated key for storage & admin access
    SUPABASE_STORAGE_BUCKET: str = "evidence"               # encrypted evidence storage bucket
    SUPABASE_QUARANTINE_BUCKET: str = "quarantine"          # isolated malware storage bucket
    SUPABASE_CERTIFICATES_BUCKET: str = "certificates"      # court certificates storage bucket

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production-use-strong-random-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Ledger & Blockchain (Polygon Amoy EVM)
    LEDGER_BACKEND: str = "polygon"   # "polygon" | "dev"
    POLYGON_RPC_URL: str = "https://rpc-amoy.polygon.technology/"
    POLYGON_EVIDENCE_REGISTRY_ADDRESS: str = "0xE5A9000fe858f49f4e0520b44dBCC138ba2ef05b"
    POLYGON_PROVENANCE_REGISTRY_ADDRESS: str = "0x3eD98E9e810e232342429A69f4789b9C829c0Bd7"

    # Vault (prod: Hashicorp Vault Transit)
    VAULT_DEV_MODE: bool = True
    VAULT_ADDR: str = "http://127.0.0.1:8200"
    VAULT_TOKEN: str = "dev-root-token"

    # Object Storage (Local fallback paths)
    STORAGE_DIR: str = _resolve_default_storage_dir()
    QUARANTINE_DIR: str = _resolve_default_quarantine_dir()

    # OPA
    OPA_URL: str = ""   # empty = fallback embedded ABAC

    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "sdms_evidence"

    # LLM (Cloud API - OpenAI / Groq / OpenRouter / Anthropic compatible)
    LLM_API_KEY: str = ""
    LLM_API_BASE: str = ""
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    OLLAMA_URL: str = ""   # Deprecated: offline Ollama no longer required

    # Feature flags
    MFA_REQUIRED: bool = True
    DEMO_MODE: bool = True   # disables some strict production checks


@lru_cache()
def get_settings() -> Settings:
    return Settings()
