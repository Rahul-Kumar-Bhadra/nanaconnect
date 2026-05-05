import asyncio
import os
import sys

# Ensure we can load from app
current_dir = os.getcwd()
backend_dir = None
if os.path.exists(os.path.join(current_dir, "app", "main.py")):
    backend_dir = current_dir
elif os.path.exists(os.path.join(current_dir, "panditji-backend", "app", "main.py")):
    backend_dir = os.path.join(current_dir, "panditji-backend")

if backend_dir and backend_dir not in sys.path:
    sys.path.append(backend_dir)

from app.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def get_users():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        for u in result.scalars().all():
            print(f"User: {u.email} | Role: {u.role} | Superuser: {u.is_superuser}")

asyncio.run(get_users())
