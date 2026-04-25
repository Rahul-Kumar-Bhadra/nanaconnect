from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models.user import User, PasswordResetToken
from app.models.pandit import Pandit
from app.schemas.auth import (
    UserRegister, TokenResponse, RefreshRequest, UserUpdate, 
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.auth_service import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token, get_user_by_email, user_to_dict,
    store_refresh_token, verify_refresh_token, revoke_refresh_token, get_user_by_id
)
from app.services.email_service import send_welcome_email, send_password_reset
from app.config import settings
from datetime import datetime, timedelta, timezone
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    if data.role not in ["user", "pandit"]:
        data.role = "user"

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
    
    refresh_token = create_refresh_token({"sub": user.id, "role": user.role})
    await store_refresh_token(db, user.id, refresh_token)
    await db.commit()
    await db.refresh(user)
    
    # Send welcome email asynchronously (fire and forget for responsiveness)
    try:
        send_welcome_email(user.email, user.name)
    except Exception:
        pass
        
    token_data = {"sub": user.id, "role": user.role}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=refresh_token,
        user=user_to_dict(user),
    )

@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, form.username)
    
    # Super Admin Bootstrap
    if form.username == "adminofnana@gmail.com" and form.password == "Jay_Jagannath":
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                name="Subha",
                email=form.username,
                password_hash=hash_password(form.password),
                role="admin",
                is_superuser=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            user.role = "admin"
            user.is_superuser = True
            await db.commit()

    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    refresh_token = create_refresh_token({"sub": user.id, "role": user.role})
    await store_refresh_token(db, user.id, refresh_token)
    
    token_data = {"sub": user.id, "role": user.role}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=refresh_token,
        user=user_to_dict(user),
    )

@router.post("/refresh")
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token, settings.JWT_REFRESH_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    if not await verify_refresh_token(db, user_id, data.refresh_token):
        raise HTTPException(status_code=401, detail="Token revoked or expired")
    
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    token_data = {"sub": user.id, "role": user.role}
    return {
        "access_token": create_access_token(token_data),
        "token_type": "bearer"
    }

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, data.email)
    if not user:
        # Don't reveal user existence
        return {"message": "If this email is registered, you will receive a reset link shortly."}
    
    # Create reset token
    token = str(uuid.uuid4())
    expiry = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Cleanup old tokens
    await db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id))
    
    reset_token = PasswordResetToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=token,
        expires_at=expiry
    )
    db.add(reset_token)
    await db.commit()
    
    # Send email
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    send_password_reset(user.email, reset_link)
    
    return {"message": "Reset link sent."}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.token == data.token))
    token_obj = result.scalar_one_or_none()
    
    if not token_obj or token_obj.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    user = await get_user_by_id(db, token_obj.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user.password_hash = hash_password(data.new_password)
    await db.delete(token_obj)
    await db.commit()
    
    return {"message": "Password updated successfully."}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = decode_token(token, settings.JWT_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid access token")
    user = await get_user_by_id(db, payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/logout")
async def logout_user(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await revoke_refresh_token(db, current_user.id)
    return {"message": "Logged out successfully"}

@router.put("/profile", response_model=dict)
async def update_profile(data: UserUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if data.name is not None: current_user.name = data.name
    if data.city is not None: current_user.city = data.city
    if data.phone is not None: current_user.phone = data.phone
    await db.commit()
    return {"message": "Profile updated", "user": user_to_dict(current_user)}