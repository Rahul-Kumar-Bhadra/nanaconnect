import asyncio
import aiosqlite

async def migrate():
    async with aiosqlite.connect('panditji.db') as db:
        try:
            await db.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20);")
            await db.commit()
            print("Migration successful: added phone column to users table.")
        except Exception as e:
            print(f"Migration error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
