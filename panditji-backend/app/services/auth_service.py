from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.config import settings
from app.models.user import User, RefreshToken
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire}, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({**data, "exp": expire}, settings.JWT_REFRESH_SECRET, algorithm=settings.JWT_ALGORITHM)

async def store_refresh_token(db: AsyncSession, user_id: str, token: str):
    # Optional: Delete old tokens for the user to prevent bloat
    await db.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
    
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_token = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user_id,
        token=hash_password(token), # Store hashed for security
        expires_at=expire
    )
    db.add(db_token)
    await db.commit()

async def verify_refresh_token(db: AsyncSession, user_id: str, token: str) -> bool:
    result = await db.execute(select(RefreshToken).where(RefreshToken.user_id == user_id))
    db_tokens = result.scalars().all()
    for db_token in db_tokens:
        if db_token.expires_at.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
            if verify_password(token, db_token.token):
                return True
    return False

async def revoke_refresh_token(db: AsyncSession, user_id: str):
    await db.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
    await db.commit()

def decode_token(token: str, secret: str) -> Optional[dict]:
    try:
        return jwt.decode(token, secret, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_superuser": user.is_superuser,
        "city": user.city,
        "phone": user.phone,
        "createdAt": str(user.created_at),
    }