from fastapi import APIRouter
from app.config import get_settings

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
async def health_check():
    settings = get_settings()
    return {
        "status": "healthy",
        "service": "sdms-backend",
        "ledger_backend": settings.LEDGER_BACKEND,
        "vault_dev_mode": settings.VAULT_DEV_MODE,
        "demo_mode": settings.DEMO_MODE,
    }
