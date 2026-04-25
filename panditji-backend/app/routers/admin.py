from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.pandit import Pandit
from app.models.booking import Booking
from app.models.puja import PujaCategory
from app.schemas.puja import PujaCategoryCreate
from app.services.auth_service import decode_token, get_user_by_id
from app.services.email_service import send_pandit_approval_email
from app.config import settings
import uuid

router = APIRouter(prefix="/admin", tags=["admin"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_admin_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = decode_token(token, settings.JWT_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("sub")
    user = await get_user_by_id(db, user_id)
    
    # 🛡️ Hardened Admin Check: Must have is_superuser=True
    if not user or not user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser access required for admin operations")
    
    return user

@router.get("/users", response_model=List[dict])
async def get_users(current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_superuser": u.is_superuser,
            "city": u.city,
            "phone": u.phone,
            "createdAt": str(u.created_at),
        }
        for u in users
    ]

@router.get("/pandits/pending", response_model=List[dict])
async def get_pending_pandits(current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Pandit, User).join(User, Pandit.user_id == User.id).where(Pandit.is_verified == False)
    result = await db.execute(stmt)
    rows = result.all()
    out = []
    for p, user in rows:
        out.append({
            "userId": p.id,
            "name": user.name if user else "Unknown",
            "phone": user.phone if user else None,
            "city": p.city,
            "experience": p.experience_years,
            "rating": p.rating_avg,
            "reviewCount": p.total_bookings,
            "verified": p.is_verified,
            "languages": p.languages or [],
            "specializations": p.specializations or [],
            "pricePerHour": p.price_per_hour,
            "avatar": p.avatar or "🙏",
            "bio": p.bio,
            "availability": p.availability or [],
            "status": p.status,
        })
    return out

@router.put("/pandits/{pandit_id}/verify", response_model=dict)
async def verify_pandit(pandit_id: str, current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pandit).where(Pandit.id == pandit_id))
    pandit = result.scalar_one_or_none()
    if not pandit:
        raise HTTPException(status_code=404, detail="Pandit not found")
    
    pandit.is_verified = True
    pandit.status = "active"
    await db.commit()
    
    # Send approval email
    try:
        user = await get_user_by_id(db, pandit.user_id)
        if user:
            send_pandit_approval_email(user.email, user.name)
    except Exception:
        pass
        
    return {"message": "Pandit verified and activated"}

@router.put("/pandits/{pandit_id}/suspend", response_model=dict)
async def suspend_pandit(pandit_id: str, current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pandit).where(Pandit.id == pandit_id))
    pandit = result.scalar_one_or_none()
    if not pandit:
        raise HTTPException(status_code=404, detail="Pandit not found")
    pandit.status = "suspended"
    pandit.is_verified = False
    await db.commit()
    return {"message": "Pandit suspended"}

@router.delete("/pandits/{pandit_id}", response_model=dict)
async def delete_pandit_profile(pandit_id: str, current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import delete
    result = await db.execute(select(Pandit).where(Pandit.id == pandit_id))
    pandit = result.scalar_one_or_none()
    if not pandit:
        raise HTTPException(status_code=404, detail="Pandit profile not found")
    
    await db.execute(delete(Booking).where(Booking.pandit_id == pandit_id))
    await db.delete(pandit)
    await db.commit()
    return {"message": "Pandit profile removed successfully"}

@router.get("/pandits", response_model=List[dict])
async def get_all_pandits(current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Pandit, User).join(User, Pandit.user_id == User.id)
    result = await db.execute(stmt)
    rows = result.all()
    out = []
    for p, user in rows:
        out.append({
            "id": p.id,
            "userId": p.user_id,
            "name": user.name if user else "Unknown",
            "phone": user.phone if user else None,
            "city": p.city,
            "experience": p.experience_years,
            "rating": p.rating_avg,
            "reviewCount": p.total_bookings,
            "verified": p.is_verified,
            "status": p.status,
            "languages": p.languages or [],
            "specializations": p.specializations or [],
            "pricePerHour": p.price_per_hour,
            "avatar": p.avatar or "🙏",
            "bio": p.bio,
            "availability": p.availability or [],
        })
    return out

@router.get("/bookings", response_model=List[dict])
async def get_all_bookings(current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import aliased
    PanditUser = aliased(User)
    
    stmt = (
        select(Booking, User, Pandit, PanditUser)
        .outerjoin(User, Booking.user_id == User.id)
        .outerjoin(Pandit, Booking.pandit_id == Pandit.id)
        .outerjoin(PanditUser, Pandit.user_id == PanditUser.id)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    out = []
    for b, user, pandit, pandit_user in rows:
        out.append({
            "id": b.id,
            "userId": b.user_id,
            "userName": user.name if user else "Unknown",
            "panditId": b.pandit_id,
            "panditName": pandit_user.name if pandit_user else "Unknown",
            "pujaName": b.puja_category_id,
            "date": b.booking_date,
            "time": b.start_time,
            "address": b.address,
            "status": b.status,
            "totalPrice": b.total_amount,
        })
    return out

@router.get("/analytics", response_model=dict)
async def get_analytics(current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    users = await db.execute(select(func.count(User.id)).where(User.role == "user"))
    pandits = await db.execute(select(func.count(Pandit.id)))
    verified = await db.execute(select(func.count(Pandit.id)).where(Pandit.is_verified == True))
    bookings = await db.execute(select(func.count(Booking.id)))
    pending = await db.execute(select(func.count(Booking.id)).where(Booking.status == "pending"))
    revenue_result = await db.execute(
        select(func.sum(Booking.total_amount)).where(Booking.status == "confirmed")
    )
    revenue = revenue_result.scalar() or 0
    return {
        "totalUsers": users.scalar(),
        "activePandits": pandits.scalar(),
        "verifiedPandits": verified.scalar(),
        "totalBookings": bookings.scalar(),
        "pendingBookings": pending.scalar(),
        "totalRevenue": revenue,
    }

@router.post("/puja-categories", response_model=dict)
async def create_puja_category(data: PujaCategoryCreate, current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    db_dict = data.to_db_dict()
    puja = PujaCategory(id=str(uuid.uuid4()), **db_dict)
    db.add(puja)
    await db.commit()
    return {"message": "Puja category created", "id": puja.id}

@router.delete("/puja-categories/{puja_id}", response_model=dict)
async def delete_puja_category(puja_id: str, current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PujaCategory).where(PujaCategory.id == puja_id))
    puja = result.scalar_one_or_none()
    if not puja:
        raise HTTPException(status_code=404, detail="Puja category not found")
    await db.delete(puja)
    await db.commit()
    return {"message": "Deleted"}

@router.delete("/users/{user_id}", response_model=dict)
async def delete_user(user_id: str, current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import delete
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.execute(delete(Booking).where(Booking.user_id == user_id))
    pandit_result = await db.execute(select(Pandit).where(Pandit.user_id == user_id))
    pandit = pandit_result.scalar_one_or_none()
    if pandit:
        await db.execute(delete(Booking).where(Booking.pandit_id == pandit.id))
        await db.delete(pandit)
    
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}

@router.put("/bookings/{booking_id}/cancel", response_model=dict)
async def cancel_booking(booking_id: str, current_user=Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "cancelled"
    await db.commit()
    return {"message": "Booking cancelled successfully"}