from pydantic import BaseModel
from typing import Optional, List

class PanditProfileUpdate(BaseModel):
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    experience: Optional[int] = None  # To support frontend's field name
    languages: Optional[List[str]] = None
    city: Optional[str] = None
    price_per_hour: Optional[float] = None
    specializations: Optional[List[str]] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None

class PanditResponse(BaseModel):
    userId: str
    name: str
    bio: Optional[str] = None
    experience: int = 0
    languages: List[str] = []
    city: Optional[str] = None
    rating: float = 0.0
    reviewCount: int = 0
    verified: bool = False
    specializations: List[str] = []
    pricePerHour: float = 0.0
    availability: List[dict] = []
    avatar: str = "🙏"
    phone: Optional[str] = None

class AvailabilitySlot(BaseModel):
    date: str
    startTime: str
    endTime: str
    isAvailable: bool = True

class AvailabilityRequest(BaseModel):
    slots: List[AvailabilitySlot]