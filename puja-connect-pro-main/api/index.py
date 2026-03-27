import sys
import os

# Add the current directory to sys.path so 'main' can be found
sys.path.append(os.path.dirname(__file__))

try:
    from main import app
except ImportError as e:
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/api/v1/health")
    def health():
        return {"error": "Import failed", "details": str(e), "sys_path": sys.path}
