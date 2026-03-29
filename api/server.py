import sys
import os
import traceback

# Add the current directory to sys.path so 'main' can be found
sys.path.append(os.path.dirname(__file__))

try:
    from main import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/api/v1/health")
    @app.get("/api/health")
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

# The Vercel Python runtime will look for 'app' in this module.
