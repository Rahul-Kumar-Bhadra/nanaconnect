import asyncio
from app.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import update, select

async def fix():
    async with AsyncSessionLocal() as db:
        await db.execute(
            update(User)
            .where(User.email == "admin@pujaconnect.com")
            .values(role="admin")
        )
        await db.commit()
        result = await db.execute(
            select(User).where(User.email == "admin@pujaconnect.com")
        )
        user = result.scalar_one_or_none()
        print(f"Done! Admin role is now: {user.role}")

asyncio.run(fix())