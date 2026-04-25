from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base

class Pandit(Base):
    __tablename__ = "pandits"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    bio = Column(String, nullable=True)
    experience_years = Column(Integer, default=0)
    languages = Column(JSON, default=list)
    city = Column(String(100), nullable=True)
    rating_avg = Column(Float, default=0.0)
    total_bookings = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    status = Column(String, default="pending")
    price_per_hour = Column(Float, default=1000.0)
    specializations = Column(JSON, default=list)
    availability = Column(JSON, default=list)
    avatar = Column(String(10), default="🙏")
    profile_photo = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))