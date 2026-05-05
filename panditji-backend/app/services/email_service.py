import resend
from app.config import settings
import logging

resend.api_key = settings.RESEND_API_KEY

logger = logging.getLogger(__name__)

# Branding constants
BRAND_COLOR = "#FF9933" # Saffron
BRAND_NAME = "NanaConnect"

def send_email(to: str, subject: str, html: str):
    try:
        resend.Emails.send({
            "from": f"{BRAND_NAME} <noreply@resend.dev>", # Replace with verified domain in production
            "to": to,
            "subject": subject,
            "html": html
        })
        logger.info(f"Email sent to {to}: {subject}")
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")

def send_welcome_email(user_email: str, user_name: str):
    subject = f"Welcome to {BRAND_NAME}!"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: {BRAND_COLOR};">{BRAND_NAME}</h2>
        <p>Namaste <strong>{user_name}</strong>,</p>
        <p>Welcome to {BRAND_NAME}! We are delighted to have you join our community connecting devotees with experienced Pandits.</p>
        <p>You can now browse and book Pujas with ease.</p>
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #777;">
            Best regards,<br>The {BRAND_NAME} Team
        </div>
    </div>
    """
    send_email(user_email, subject, html)

def send_booking_confirmation(user_email, user_name, pandit_name, puja_name, booking_date, booking_id):
    subject = f"Booking Confirmed - {puja_name}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: {BRAND_COLOR};">Booking Confirmed!</h2>
        <p>Namaste {user_name},</p>
        <p>Your booking for <strong>{puja_name}</strong> has been successfully confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{booking_id}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pandit:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{pandit_name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{booking_date}</td></tr>
        </table>
        <p>Thank you for choosing {BRAND_NAME}.</p>
    </div>
    """
    send_email(user_email, subject, html)

def send_booking_alert_to_pandit(pandit_email, pandit_name, user_name, puja_name, booking_date):
    subject = f"New Booking Alert - {puja_name}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: {BRAND_COLOR};">New Booking Received!</h2>
        <p>Namaste {pandit_name},</p>
        <p>You have a new booking request from <strong>{user_name}</strong> for <strong>{puja_name}</strong> on <strong>{booking_date}</strong>.</p>
        <p>Please log in to your dashboard to view full details.</p>
    </div>
    """
    send_email(pandit_email, subject, html)

def send_pandit_approval_email(pandit_email: str, pandit_name: str):
    subject = f"Your Pandit Account is Approved!"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: {BRAND_COLOR};">Account Verified!</h2>
        <p>Namaste {pandit_name},</p>
        <p>Congratulations! Your Pandit profile on {BRAND_NAME} has been verified and approved by the administrator.</p>
        <p>You are now visible to devotees and can start receiving bookings.</p>
    </div>
    """
    send_email(pandit_email, subject, html)

def send_password_reset(email: str, reset_link: str):
    subject = "Password Reset Request"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: {BRAND_COLOR};">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <a href="{reset_link}" style="display: inline-block; padding: 10px 20px; background-color: {BRAND_COLOR}; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email. The link will expire in 1 hour.</p>
    </div>
    """
    send_email(email, subject, html)
