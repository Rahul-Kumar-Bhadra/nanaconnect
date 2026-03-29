import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Intelligent Path Discovery
current_dir = os.getcwd()
backend_dir = None

# Check if we are already inside the backend folder
if os.path.exists(os.path.join(current_dir, "app", "main.py")):
    backend_dir = current_dir
# Check if we are in the repository root
elif os.path.exists(os.path.join(current_dir, "panditji-backend", "app", "main.py")):
    backend_dir = os.path.join(current_dir, "panditji-backend")

if backend_dir:
    if backend_dir not in sys.path:
        sys.path.append(backend_dir)
    try:
        from app.main import app
    except Exception as e:
        # Fallback app if the real app crashes during import (likely DB issue)
        app = FastAPI()
        app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
        @app.get("/")
        async def root():
            return {
                "status": "CRASH_DURING_IMPORT",
                "message": "The backend code exists but failed to load. This is usually due to a bad DATABASE_URL (check for @ in password).",
                "error": str(e)
            }
else:
    # Failback if folder structure is wrong
    app = FastAPI()
    @app.get("/")
    async def root():
        return {
            "status": "FOLDER_NOT_FOUND",
            "message": "The 'app/main.py' could not be found.",
            "cwd": current_dir,
            "ls": os.listdir(current_dir)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
