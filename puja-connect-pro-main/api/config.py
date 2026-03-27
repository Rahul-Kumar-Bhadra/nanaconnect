from pydantic_settings import BaseSettings, SettingsConfigDict
from urllib.parse import quote_plus
import pydantic
import os

class Settings(BaseSettings):
    # Field definitions
    DATABASE_URL: str = "sqlite+aiosqlite:///./panditji.db"
    JWT_SECRET: str = "change-this-secret-key-in-production"
    JWT_REFRESH_SECRET: str = "change-this-refresh-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    PLATFORM_FEE_PERCENT: float = 15.0

    # Pydantic v2 Configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # FORCE FIX: URL-encode the password part of the DATABASE_URL if it contains @
        if "://" in self.DATABASE_URL:
            protocol, rest = self.DATABASE_URL.split("://", 1)
            if "@" in rest:
                try:
                    auth_part, host_part = rest.rsplit("@", 1)
                    if ":" in auth_part:
                        user, password = auth_part.split(":", 1)
                        if "@" in password or ":" in password:
                            encoded_password = quote_plus(password)
                            self.DATABASE_URL = f"{protocol}://{user}:{encoded_password}@{host_part}"
                except Exception:
                    pass

settings = Settings()
