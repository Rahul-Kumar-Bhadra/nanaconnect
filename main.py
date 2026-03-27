import sys
import os

# Add the backend directory to Python path
backend_path = os.path.join(os.getcwd(), "panditji-backend")
sys.path.append(backend_path)

# Import the FastAPI app from the subfolder
try:
    from app.main import app
except ImportError as e:
    print(f"Error importing app from subdirectory: {e}")
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/")
    async def root():
        return {"error": "Proxy fail: Could not import backend", "details": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
