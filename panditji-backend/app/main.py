import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routers.pandits import router as pandits_router
from app.routers.bookings import router as bookings_router
from app.routers.payments import router as payments_router
from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from sqlalchemy import select
from app.database import AsyncSessionLocal, create_tables
from app.models.puja import PujaCategory
from app.config import settings
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

# Import all models
import app.models.user  # noqa: F401
import app.models.pandit  # noqa: F401
import app.models.booking  # noqa: F401
import app.models.payment  # noqa: F401
import app.models.puja  # noqa: F401

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    logger.info("Database tables ensured.")
    yield

app = FastAPI(title="NanaConnect API", version="1.0.0", lifespan=lifespan)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming Request: {request.method} {request.url}")
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Finished Request: {request.method} {request.url} - Status: {response.status_code} - Time: {process_time:.2f}s")
    return response

# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration (ULTRA PERMISSIVE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(pandits_router, prefix="/api/v1")
app.include_router(bookings_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

@app.get("/api/v1/puja-categories")
async def get_puja_categories():
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(PujaCategory))
            pujas = result.scalars().all()
            return [
                {
                    "id": p.id, "name": p.name, "description": p.description,
                    "duration": p.duration, "price": p.price,
                    "image": p.image, "category": p.category,
                }
                for p in pujas
            ]
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    health = {"status": "ok", "database": "unknown"}
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(select(1))
            health["database"] = "connected"
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        health["status"] = "error"
        health["database"] = f"error: {str(e)}"
    return health

@app.get("/")
@limiter.limit("5/minute")
async def root(request: Request):
    return {"message": "NanaConnect API is running!", "status": "stable"}
