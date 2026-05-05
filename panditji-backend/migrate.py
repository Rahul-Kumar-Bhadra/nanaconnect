import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        try:
            # Add phone column to users table if it doesn't exist
            # Note: SQLite and PostgreSQL have different syntax for conditional column addition
            # We'll use a simple ALTER and catch the error if it already exists
            await conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(20);"))
            print("Migration successful: added phone column to users table.")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("Migration skipped: phone column already exists.")
            else:
                print(f"Migration error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
