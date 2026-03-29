from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    pandit_id = Column(String, ForeignKey("pandits.id"), nullable=False)
    puja_category_id = Column(String, ForeignKey("puja_categories.id"), nullable=False)
    booking_date = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    duration_hours = Column(Integer, default=2)
    address = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    total_amount = Column(Float, nullable=False)
    platform_fee = Column(Float, default=0.0)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))