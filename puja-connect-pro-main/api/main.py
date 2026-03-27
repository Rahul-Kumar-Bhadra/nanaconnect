from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.pandits import router as pandits_router
from routers.bookings import router as bookings_router
from routers.payments import router as payments_router
from routers.admin import router as admin_router
from routers.auth import router as auth_router
from sqlalchemy import select
from database import AsyncSessionLocal
from models.puja import PujaCategory

app = FastAPI(title="NanaConnect API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.get("/")
async def root():
    return {"message": "NanaConnect API is running!", "status": "stable"}