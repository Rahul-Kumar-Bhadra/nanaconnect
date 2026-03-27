from pydantic import BaseModel
from typing import Optional

class BookingCreate(BaseModel):
    pandit_id: str
    puja_category_id: str
    booking_date: str
    start_time: str
    duration_hours: int = 2
    address: str
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    userId: str
    userName: str
    panditId: str
    panditName: str
    pujaName: str
    date: str
    time: str
    address: str
    status: str
    totalPrice: float

class ReviewCreate(BaseModel):
    rating: float
    comment: Optional[str] = None