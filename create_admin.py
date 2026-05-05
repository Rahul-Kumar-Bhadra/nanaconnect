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
from app.services.auth_service import hash_password
from sqlalchemy import select
import uuid

async def create_admin():
    async with AsyncSessionLocal() as db:
        # Check if exists
        result = await db.execute(select(User).where(User.email == "adminofnana@gmail.com"))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                name="Admin User",
                email="adminofnana@gmail.com",
                password_hash=hash_password("rahulsubha2020"),
                role="admin",
                is_superuser=True
            )
            db.add(user)
            print("Creating new admin user...")
        else:
            user.role = "admin"
            user.is_superuser = True
            user.password_hash = hash_password("rahulsubha2020")
            print("Promoting existing user to admin and resetting password to admin123...")
            
        await db.commit()
        print("Admin account setup complete!")

asyncio.run(create_admin())
