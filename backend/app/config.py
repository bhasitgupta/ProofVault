from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///sdms_metadata.db"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production-use-strong-random-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Ledger
    LEDGER_BACKEND: str = "dev"   # "dev" | "fabric"

    # Vault (prod: Hashicorp Vault Transit)
    VAULT_DEV_MODE: bool = True
    VAULT_ADDR: str = "http://127.0.0.1:8200"
    VAULT_TOKEN: str = "dev-root-token"

    # Object Storage
    STORAGE_DIR: str = "storage_data"
    QUARANTINE_DIR: str = "storage_data/quarantine"

    # OPA
    OPA_URL: str = ""   # empty = fallback embedded ABAC

    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "sdms_evidence"

    # LLM
    OLLAMA_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "qwen2.5:1.5b"

    # Feature flags
    MFA_REQUIRED: bool = True
    DEMO_MODE: bool = True   # disables some strict production checks


@lru_cache()
def get_settings() -> Settings:
    return Settings()
