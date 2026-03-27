from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./panditji.db"
    JWT_SECRET: str = "change-this-secret-key-in-production"
    JWT_REFRESH_SECRET: str = "change-this-refresh-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    PLATFORM_FEE_PERCENT: float = 15.0

    class Config:
        env_file = ".env"

settings = Settings()
