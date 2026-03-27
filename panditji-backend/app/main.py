from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables
from app.routers import auth, pandits, bookings, payments, admin
from app.routers.pandits import router as pandits_router
from app.routers.bookings import router as bookings_router
from app.routers.payments import router as payments_router
from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.puja import PujaCategory
import uuid

app = FastAPI(title="NanaConnect API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(pandits_router, prefix="/api/v1")
app.include_router(bookings_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

@app.get("/api/v1/puja-categories")
async def get_puja_categories():
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

@app.on_event("startup")
async def startup():
    await create_tables()
    print("Database tables created")

@app.get("/")
async def root():
    return {"message": "NanaConnect API is running!", "docs": "/docs"}