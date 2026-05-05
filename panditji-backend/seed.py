import asyncio
from app.database import AsyncSessionLocal, create_tables
from app.models.user import User
from app.models.pandit import Pandit
from app.models.puja import PujaCategory
from app.services.auth_service import hash_password
import uuid

PUJAS = [
    {"name": "Satyanarayan Puja", "description": "A sacred ritual dedicated to Lord Vishnu, performed for prosperity and well-being.", "duration": "2-3 hours", "price": 3100, "image": "🙏", "category": "Prosperity"},
    {"name": "Griha Pravesh", "description": "Traditional house-warming ceremony to bless a new home with positive energy.", "duration": "3-4 hours", "price": 5100, "image": "🏠", "category": "Home"},
    {"name": "Ganesh Puja", "description": "Worship of Lord Ganesha, the remover of obstacles, before starting new ventures.", "duration": "1-2 hours", "price": 2100, "image": "🐘", "category": "Auspicious Beginning"},
    {"name": "Navgraha Shanti", "description": "Planetary peace ritual to harmonize the effects of nine celestial bodies.", "duration": "3-4 hours", "price": 5500, "image": "✨", "category": "Astrology"},
    {"name": "Rudra Abhishek", "description": "Sacred bathing ritual of Shiva Linga with milk, honey, and holy water.", "duration": "2-3 hours", "price": 4100, "image": "🔱", "category": "Devotional"},
    {"name": "Car Puja", "description": "Blessing ceremony for a new vehicle for safe journeys ahead.", "duration": "30-45 min", "price": 1100, "image": "🚗", "category": "Vehicle"},
    {"name": "Vastu Shanti", "description": "Ritual to purify and harmonize the energy flow in your home or office.", "duration": "2-3 hours", "price": 3500, "image": "🏛️", "category": "Home"},
    {"name": "Vivah Sanskar", "description": "Complete wedding ceremony conducted with authentic Vedic rituals.", "duration": "4-6 hours", "price": 11000, "image": "💍", "category": "Wedding"},
]

async def seed():
    await create_tables()
    async with AsyncSessionLocal() as db:
        # Seed puja categories
        from sqlalchemy import select
        existing = await db.execute(select(PujaCategory))
        if not existing.scalars().first():
            for p in PUJAS:
                db.add(PujaCategory(id=str(uuid.uuid4()), **p))
            print("Puja categories seeded")

        # Seed admin user
        from app.services.auth_service import get_user_by_email
        admin = await get_user_by_email(db, "admin@nanaconnect.com")
        if not admin:
            admin_user = User(
                id=str(uuid.uuid4()),
                name="Admin User",
                email="admin@nanaconnect.com",
                password_hash=hash_password("admin123"),
                role="admin",
                city="Mumbai",
            )
            db.add(admin_user)
            print("Admin user created: admin@nanaconnect.com / admin123")

        # Seed test pandit
        pandit_user_email = "ramesh@nanaconnect.com"
        existing_pandit = await get_user_by_email(db, pandit_user_email)
        if not existing_pandit:
            pandit_user = User(
                id=str(uuid.uuid4()),
                name="Pandit Ramesh Shastri",
                email=pandit_user_email,
                password_hash=hash_password("pandit123"),
                role="pandit",
                city="Mumbai",
            )
            db.add(pandit_user)
            await db.flush()
            pandit = Pandit(
                id=str(uuid.uuid4()),
                user_id=pandit_user.id,
                bio="Experienced Vedic priest specializing in traditional rituals.",
                experience_years=15,
                languages=["Hindi", "Sanskrit", "Marathi"],
                city="Mumbai",
                rating_avg=4.8,
                total_bookings=124,
                is_verified=True,
                status="active",
                price_per_hour=1500,
                specializations=["Satyanarayan Puja", "Griha Pravesh"],
                avatar="🙏",
            )
            db.add(pandit)
            print("Test pandit created: ramesh@pujaconnect.com / pandit123")

        # Seed test user
        test_user_email = "rahul@nanaconnect.com"
        existing_user = await get_user_by_email(db, test_user_email)
        if not existing_user:
            test_user = User(
                id=str(uuid.uuid4()),
                name="Rahul Sharma",
                email=test_user_email,
                password_hash=hash_password("user123"),
                role="user",
                city="Mumbai",
            )
            db.add(test_user)
            print("Test user created: rahul@pujaconnect.com / user123")

        await db.commit()
        print("\nSeed complete!")
        print("Test accounts:")
        print("  Admin:  admin@nanaconnect.com / admin123")
        print("  Pandit: ramesh@nanaconnect.com / pandit123")
        print("  User:   rahul@nanaconnect.com / user123")

if __name__ == "__main__":
    asyncio.run(seed())

