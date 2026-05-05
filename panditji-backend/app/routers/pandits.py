from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from app.database import get_db
from app.models.pandit import Pandit
from app.models.user import User
from app.models.booking import Booking
from app.schemas.pandit import PanditProfileUpdate, AvailabilityRequest
from app.services.auth_service import decode_token, get_user_by_id
from app.config import settings

router = APIRouter(prefix="/pandits", tags=["pandits"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = decode_token(token, settings.JWT_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_or_create_pandit(db: AsyncSession, current_user: User) -> Pandit:
    result = await db.execute(select(Pandit).where(Pandit.user_id == current_user.id))
    pandit = result.scalar_one_or_none()
    if not pandit:
        if current_user.role == "pandit":
            import uuid
            pandit = Pandit(id=str(uuid.uuid4()), user_id=current_user.id, city=current_user.city)
            db.add(pandit)
            await db.commit()
            await db.refresh(pandit)
        else:
            raise HTTPException(status_code=404, detail="Pandit profile not found")
    return pandit

async def pandit_to_response(pandit: Pandit, db: AsyncSession) -> dict:
    user = await get_user_by_id(db, pandit.user_id)
    return {
        "userId": pandit.id,
        "name": user.name if user else "Unknown",
        "bio": pandit.bio,
        "experience": pandit.experience_years,
        "languages": pandit.languages or [],
        "city": pandit.city,
        "rating": pandit.rating_avg,
        "reviewCount": pandit.total_bookings,
        "verified": pandit.is_verified,
        "specializations": pandit.specializations or [],
        "pricePerHour": pandit.price_per_hour,
        "availability": pandit.availability or [],
        "avatar": pandit.avatar or "🙏",
        "phone": user.phone if user else None,
    }

@router.get("", response_model=List[dict])
async def list_pandits(
    city: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db),
):
    query = select(Pandit).where(Pandit.is_verified == True, Pandit.status == "active")
    if city:
        query = query.where(Pandit.city == city)
    if min_rating:
        query = query.where(Pandit.rating_avg >= min_rating)
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    pandits = result.scalars().all()
    return [await pandit_to_response(p, db) for p in pandits]

@router.get("/me", response_model=dict)
async def get_my_pandit_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pandit = await get_or_create_pandit(db, current_user)
    return await pandit_to_response(pandit, db)

@router.get("/me/bookings", response_model=List[dict])
async def get_pandit_bookings(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pandit = await get_or_create_pandit(db, current_user)
    b_result = await db.execute(select(Booking).where(Booking.pandit_id == pandit.id))
    bookings = b_result.scalars().all()
    out = []
    for b in bookings:
        u = await get_user_by_id(db, b.user_id)
        out.append({
            "id": b.id, "userId": b.user_id,
            "userName": u.name if u else "Unknown",
            "panditId": b.pandit_id, "panditName": current_user.name,
            "pujaName": b.puja_category_id, "date": b.booking_date,
            "time": b.start_time, "address": b.address,
            "status": b.status, "totalPrice": b.total_amount,
        })
    return out

@router.get("/{pandit_id}", response_model=dict)
async def get_pandit(pandit_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Pandit).where(
            Pandit.id == pandit_id, 
            Pandit.is_verified == True, 
            Pandit.status == "active"
        )
    )
    pandit = result.scalar_one_or_none()
    if not pandit:
        raise HTTPException(status_code=404, detail="Pandit not found or not currently active")
    return await pandit_to_response(pandit, db)

@router.get("/{pandit_id}/availability", response_model=List[dict])
async def get_availability(pandit_id: str, date: Optional[str] = Query(None), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Pandit).where(
            Pandit.id == pandit_id, 
            Pandit.is_verified == True, 
            Pandit.status == "active"
        )
    )
    pandit = result.scalar_one_or_none()
    if not pandit:
        raise HTTPException(status_code=404, detail="Pandit not found or not currently active")
    
    slots = pandit.availability or []
    if date:
        slots = [s for s in slots if s.get("date") == date]
    return slots

@router.post("/profile", response_model=dict)
async def create_profile(data: PanditProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pandit = await get_or_create_pandit(db, current_user)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(pandit, field, value)
    await db.commit()
    return {"message": "Profile updated"}

@router.put("/profile", response_model=dict)
async def update_profile(data: PanditProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pandit = await get_or_create_pandit(db, current_user)
    
    update_data = data.model_dump(exclude_none=True)
    if "experience" in update_data and "experience_years" not in update_data:
        update_data["experience_years"] = update_data.pop("experience")
    elif "experience" in update_data:
        update_data.pop("experience")

    if "phone" in update_data:
        current_user.phone = update_data.pop("phone")
        db.add(current_user)

    for field, value in update_data.items():
        if hasattr(pandit, field):
            setattr(pandit, field, value)
    
    await db.commit()
    return {"message": "Profile updated"}

@router.post("/availability", response_model=dict)
async def set_availability(data: AvailabilityRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pandit = await get_or_create_pandit(db, current_user)
    
    pandit.availability = [s.model_dump() for s in data.slots]
    await db.commit()
    return {"message": "Availability saved", "slots": len(data.slots)}

@router.put("/bookings/{booking_id}/accept", response_model=dict)
async def accept_booking(booking_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "confirmed"
    await db.commit()
    return {"message": "Booking accepted"}

@router.put("/bookings/{booking_id}/reject", response_model=dict)
async def reject_booking(booking_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "rejected"
    await db.commit()
    return {"message": "Booking rejected"}