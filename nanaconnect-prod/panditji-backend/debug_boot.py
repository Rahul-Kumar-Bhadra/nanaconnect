from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "DEBUG BOOT SUCCESSFUL", "status": "alive"}

@app.get("/health")
async def health():
    return {"status": "ok"}
