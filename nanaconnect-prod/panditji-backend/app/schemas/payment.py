from pydantic import BaseModel

class CreateOrderRequest(BaseModel):
    booking_id: str

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str = "INR"
    key_id: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str