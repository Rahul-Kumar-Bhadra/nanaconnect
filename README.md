# NanaConnect

NanaConnect is a professional platform connecting devotees with experienced Pandits for religious services.

## Production Ready

This project is now production-ready with the following features:
- **Database**: Neon PostgreSQL with connection retry logic.
- **Auth**: JWT with Refresh Token support and secure logout.
- **Images**: Cloudinary integration for profile photos with size/type validation.
- **Emails**: Resend integration for welcome, booking, and approval notifications.
- **Monitoring**: Sentry tracking for both backend and frontend.
- **Security**: Rate limiting and hardened admin routes.

## Go-Live Checklist

For a fast, step-by-step guide on how to launch this project for free, please see:
[**GOLIVE_CHECKLIST.md**](./GOLIVE_CHECKLIST.md)

## Local Development

1. **Backend**:
   ```bash
   cd panditji-backend
   pip install -r requirements.txt
   python main.py
   ```

2. **Frontend**:
   ```bash
   npm install
   npm run dev
   ```

## License
MIT
