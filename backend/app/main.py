import uuid
from contextlib import asynccontextmanager
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
    title="SIH26190 — Secure Digital Document Management System",
    version="1.0.0",
    description="Cryptographic chain-of-custody, Merkle-verified RAG, and BSA §63 certificate generation.",
    lifespan=lifespan,
)

# CORS (restrict to frontend origin in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message, "code": exc.code})

# Mount API v1 routes
app.include_router(v1_router, prefix="/api/v1")
