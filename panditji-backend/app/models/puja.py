from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime, timezone
import uuid
from app.database import Base

class PujaCategory(Base):
    __tablename__ = "puja_categories"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    duration = Column(String(50), nullable=True)
    price = Column(Float, nullable=False)
    image = Column(String(500), default="🙏")
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))