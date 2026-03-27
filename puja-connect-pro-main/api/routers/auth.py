from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.pandit import Pandit
from app.schemas.auth import UserRegister, TokenResponse, RefreshRequest, UserUpdate
from app.services.auth_service import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token, get_user_by_email, user_to_dict
)
from app.config import settings
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="You have already registered with this email. Please login instead.")
    user = User(
        id=str(uuid.uuid4()),
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        city=data.city,
        phone=data.phone,
    )
    db.add(user)
    await db.flush()
    if data.role == "pandit":
        pandit = Pandit(id=str(uuid.uuid4()), user_id=user.id, city=data.city)
        db.add(pandit)
    await db.commit()
    await db.refresh(user)
    token_data = {"sub": user.id, "role": user.role}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=user_to_dict(user),
    )

@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, form.username)
    
    # Hardcoded Admin check
    if form.username == "subharahuladmin2026@gmail.com" and form.password == "brocode@2006":
        if not user:
            # Create the super admin if not exists
            user = User(
                id=str(uuid.uuid4()),
                name="Subha",
                email=form.username,
                password_hash=hash_password(form.password),
                role="admin"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        # Force role update and name sync for the specific admin
        elif user.role != "admin" or not verify_password(form.password, user.password_hash) or user.name == "Subha Admin":
            user.role = "admin"
            user.name = "Subha"
            user.password_hash = hash_password(form.password)
            await db.commit()
            await db.refresh(user)
    
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")
    token_data = {"sub": user.id, "role": user.role}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=user_to_dict(user),
    )

@router.post("/refresh")
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token, settings.JWT_REFRESH_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    from app.services.auth_service import get_user_by_id
    user = await get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    token_data = {"sub": user.id, "role": user.role}
    return {"access_token": create_access_token(token_data), "token_type": "bearer"}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = decode_token(token, settings.JWT_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    from app.services.auth_service import get_user_by_id
    user = await get_user_by_id(db, payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.put("/profile", response_model=dict)
async def update_profile(data: UserUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if data.name is not None: current_user.name = data.name
    if data.city is not None: current_user.city = data.city
    if data.phone is not None: current_user.phone = data.phone
    await db.commit()
    return {"message": "Profile updated", "user": user_to_dict(current_user)}