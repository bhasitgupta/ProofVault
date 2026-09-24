from fastapi import APIRouter
from app.api.v1 import auth, documents, query, verify, cases, certificate, audit, admin

router = APIRouter()
router.include_router(auth.router)
router.include_router(documents.router)
router.include_router(query.router)
router.include_router(verify.router)
router.include_router(cases.router)
router.include_router(certificate.router)
router.include_router(audit.router)
router.include_router(admin.router)

"""V1 API Router: Consolidated routing aggregator for all judicial endpoints."""
