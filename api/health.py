import sys
import os
import traceback

# Add the current directory to sys.path
sys.path.append(os.path.dirname(__file__))

try:
    from app_main import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/api/v1/health")
    @app.get("/v1/health")
    @app.get("/")
    def health_error():
        return {
            "error": "Initialization failed",
            "message": str(e),
            "traceback": traceback.format_exc(),
            "sys_path": sys.path,
            "cwd": os.getcwd(),
            "ls": os.listdir(os.getcwd()) if os.path.exists(os.getcwd()) else "n/a"
        }
