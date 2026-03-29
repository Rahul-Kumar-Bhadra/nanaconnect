from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.booking import Booking
from models.payment import Payment
from schemas.payment import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest
from services.auth_service import decode_token, get_user_by_id
from services.razorpay_service import create_razorpay_order, verify_signature
from config import settings
import uuid

router = APIRouter(prefix="/payments", tags=["payments"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = decode_token(token, settings.JWT_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order(data: CreateOrderRequest, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).where(Booking.id == data.booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    order = create_razorpay_order(booking.total_amount, booking.id)
    payment = Payment(
        id=str(uuid.uuid4()),
        booking_id=booking.id,
        razorpay_order_id=order["id"],
        amount=booking.total_amount,
        status="created",
    )
    db.add(payment)
    await db.commit()
    return CreateOrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency="INR",
        key_id=settings.RAZORPAY_KEY_ID,
    )

@router.post("/verify", response_model=dict)
async def verify_payment(data: VerifyPaymentRequest, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    is_valid = verify_signature(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    result = await db.execute(select(Payment).where(Payment.razorpay_order_id == data.razorpay_order_id))
    payment = result.scalar_one_or_none()
    if payment:
        payment.razorpay_payment_id = data.razorpay_payment_id
        payment.status = "captured"
        booking_result = await db.execute(select(Booking).where(Booking.id == payment.booking_id))
        booking = booking_result.scalar_one_or_none()
        if booking:
            booking.status = "confirmed"
        await db.commit()
    return {"message": "Payment verified successfully"}