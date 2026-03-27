import hmac
import hashlib
from config import settings

def create_razorpay_order(amount_rupees: float, receipt: str) -> dict:
    try:
        import razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        order = client.order.create({
            "amount": int(amount_rupees * 100),
            "currency": "INR",
            "receipt": receipt,
        })
        return order
    except Exception:
        return {
            "id": f"order_test_{receipt}",
            "amount": int(amount_rupees * 100),
            "currency": "INR",
        }

def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    if not settings.RAZORPAY_KEY_SECRET:
        return True
    message = f"{order_id}|{payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)