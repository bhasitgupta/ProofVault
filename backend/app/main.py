import os
import uuid
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db.session import init_models
from app.api.v1.router import router as v1_router
from app.core.exceptions import SDMSException


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialise DB schema, warm up models."""
    await init_models()
    yield
    # Shutdown: cleanup resources


app = FastAPI(
    title="Proof Vault — Secure Digital Evidence Management System",
    version="1.0.0",
    description="Cryptographic chain-of-custody, Merkle-verified RAG, and BSA §63 certificate generation.",
    lifespan=lifespan,
)

# CORS (supports local dev and Vercel domains)
cors_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()] if cors_env else ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://.*" if not cors_env else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request-ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# SDMS domain exception handler
@app.exception_handler(SDMSException)
async def sdms_exception_handler(request: Request, exc: SDMSException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message, "code": exc.code, "detail": exc.message})

# Catch-all exception handler for debugging and clean error reporting
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    error_msg = str(exc) or "An internal error occurred"
    return JSONResponse(
        status_code=500,
        content={"error": error_msg, "code": "INTERNAL_SERVER_ERROR", "detail": error_msg}
    )

# Mount API v1 routes
app.include_router(v1_router, prefix="/api/v1")

@app.get("/")
@app.get("/api")
@app.get("/api/health")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "sdms-backend", "version": "1.0.0"}


"""ProofVault Sovereign Digital Evidence Management System - FastAPI Application."""
