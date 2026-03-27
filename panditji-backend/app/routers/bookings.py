from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.booking import Booking
from app.models.pandit import Pandit
from app.models.payment import Review
from app.models.puja import PujaCategory
from app.schemas.booking import BookingCreate, ReviewCreate
from app.services.auth_service import decode_token, get_user_by_id
from app.config import settings
import uuid

router = APIRouter(prefix="/bookings", tags=["bookings"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = decode_token(token, settings.JWT_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("", response_model=dict)
async def create_booking(data: BookingCreate, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pandit_result = await db.execute(select(Pandit).where(Pandit.id == data.pandit_id))
    pandit = pandit_result.scalar_one_or_none()
    if not pandit:
        raise HTTPException(status_code=404, detail="Pandit not found")
    total = pandit.price_per_hour * data.duration_hours
    platform_fee = total * settings.PLATFORM_FEE_PERCENT / 100
    booking = Booking(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        pandit_id=data.pandit_id,
        puja_category_id=data.puja_category_id,
        booking_date=data.booking_date,
        start_time=data.start_time,
        duration_hours=data.duration_hours,
        address=data.address,
        notes=data.notes,
        total_amount=total,
        platform_fee=platform_fee,
        status="pending",
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return {"id": booking.id, "status": booking.status, "totalAmount": booking.total_amount}

@router.get("/my", response_model=List[dict])
async def my_bookings(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.user_id == current_user.id))
    bookings = result.scalars().all()
    out = []
    for b in bookings:
        pandit_result = await db.execute(select(Pandit).where(Pandit.id == b.pandit_id))
        pandit = pandit_result.scalar_one_or_none()
        pandit_user = await get_user_by_id(db, pandit.user_id) if pandit else None
        puja_result = await db.execute(select(PujaCategory).where(PujaCategory.id == b.puja_category_id))
        puja = puja_result.scalar_one_or_none()
        out.append({
            "id": b.id,
            "userId": b.user_id,
            "userName": current_user.name,
            "panditId": b.pandit_id,
            "panditName": pandit_user.name if pandit_user else "Unknown",
            "pujaName": puja.name if puja else "Puja",
            "date": b.booking_date,
            "time": b.start_time,
            "address": b.address,
            "status": b.status,
            "totalPrice": b.total_amount,
        })
    return out

@router.get("/{booking_id}", response_model=dict)
async def get_booking(booking_id: str, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"id": booking.id, "status": booking.status, "totalAmount": booking.total_amount}

@router.put("/{booking_id}/cancel", response_model=dict)
async def cancel_booking(booking_id: str, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    booking.status = "cancelled"
    await db.commit()
    return {"message": "Booking cancelled"}

@router.post("/{booking_id}/review", response_model=dict)
async def submit_review(booking_id: str, data: ReviewCreate, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    review = Review(
        id=str(uuid.uuid4()),
        booking_id=booking_id,
        user_id=current_user.id,
        pandit_id=booking.pandit_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    await db.commit()
    return {"message": "Review submitted"}
