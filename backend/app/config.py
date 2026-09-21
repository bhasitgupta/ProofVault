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

        # Resolve Supabase key aliases
        if self.SUPABASE_PUBLISHABLE_KEY and not self.SUPABASE_KEY:
            self.SUPABASE_KEY = self.SUPABASE_PUBLISHABLE_KEY
        if self.SUPABASE_SECRET_KEY and not self.SUPABASE_SERVICE_ROLE_KEY:
            self.SUPABASE_SERVICE_ROLE_KEY = self.SUPABASE_SECRET_KEY
        return self

    # Supabase Cloud Project Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""                                  # anon public key or service role key
    SUPABASE_PUBLISHABLE_KEY: str = ""                      # publishable key alias
    SUPABASE_SERVICE_ROLE_KEY: str = ""                     # elevated key for storage & admin access
    SUPABASE_SECRET_KEY: str = ""                           # secret key alias
    SUPABASE_JWKS_URL: str = ""                             # jwks url
    SUPABASE_STORAGE_BUCKET: str = "evidence"               # encrypted evidence storage bucket
    SUPABASE_QUARANTINE_BUCKET: str = "quarantine"          # isolated malware storage bucket
    SUPABASE_CERTIFICATES_BUCKET: str = "certificates"      # court certificates storage bucket

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production-use-strong-random-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Ledger & Blockchain (Polygon Amoy EVM)
    LEDGER_BACKEND: str = "polygon"   # "polygon" | "dev"
    POLYGON_RPC_URL: str = "https://polygon-amoy-bor-rpc.publicnode.com"
    POLYGON_EVIDENCE_REGISTRY_ADDRESS: str = "0xE5A9000fe858f49f4e0520b44dBCC138ba2ef05b"
    POLYGON_PROVENANCE_REGISTRY_ADDRESS: str = "0x5D94C63ABfAEFf3758A51642A03912F73a064ADA"

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

    # Cascading 4-Tier Cloud AI Gateway
    # Tier 1: GPT-6 Astra (Primary)
    AI_TIER1_NAME: str = "GPT-6 Astra"
    AI_TIER1_MODEL: str = "openai/gpt-6-astra"
    AI_TIER1_BASE_URL: str = "https://openrouter.ai/api/v1"
    AI_TIER1_API_KEY: str = ""

    # Tier 2: Grok 4.6 (Secondary Failover)
    AI_TIER2_NAME: str = "Grok 4.6"
    AI_TIER2_MODEL: str = "x-ai/grok-4.6"
    AI_TIER2_BASE_URL: str = "https://openrouter.ai/api/v1"
    AI_TIER2_API_KEY: str = ""

    # Tier 3: Nemotron 3 Ultra (Tertiary Failover)
    AI_TIER3_NAME: str = "Nemotron 3 Ultra"
    AI_TIER3_MODEL: str = "nvidia/nemotron-3-ultra-550b-a55b"
    AI_TIER3_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    AI_TIER3_API_KEY: str = ""

    # Tier 4: Gemini 3.8 Flash (Quaternary Cloud Failover)
    AI_TIER4_NAME: str = "Gemini 3.8 Flash"
    AI_TIER4_MODEL: str = "google/gemini-3.8-flash"
    AI_TIER4_BASE_URL: str = "https://openrouter.ai/api/v1"
    AI_TIER4_API_KEY: str = ""

    # Aliases
    AI_PRIMARY_API_KEY: str = ""
    AI_PRIMARY_MODEL: str = "openai/gpt-6-astra"
    AI_PRIMARY_BASE_URL: str = "https://openrouter.ai/api/v1"

    AI_SECONDARY_API_KEY: str = ""
    AI_SECONDARY_MODEL: str = "x-ai/grok-4.6"
    AI_SECONDARY_BASE_URL: str = "https://openrouter.ai/api/v1"

    AI_TERTIARY_API_KEY: str = ""
    AI_TERTIARY_MODEL: str = "nvidia/nemotron-3-ultra-550b-a55b"
    AI_TERTIARY_BASE_URL: str = "https://integrate.api.nvidia.com/v1"

    AI_QUATERNARY_API_KEY: str = ""
    AI_QUATERNARY_MODEL: str = "google/gemini-3.8-flash"
    AI_QUATERNARY_BASE_URL: str = "https://openrouter.ai/api/v1"

    # Legacy / alias settings
    LLM_API_KEY: str = ""
    LLM_API_BASE: str = "https://openrouter.ai/api/v1"
    LLM_MODEL: str = "openai/gpt-6-astra"

    # Feature flags
    MFA_REQUIRED: bool = True
    DEMO_MODE: bool = True   # disables some strict production checks


@lru_cache()
def get_settings() -> Settings:
    return Settings()
