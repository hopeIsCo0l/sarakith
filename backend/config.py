import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BOT_TOKEN: str = "DEFAULT_BOT_TOKEN"
    ALLOWED_ADMIN_IDS: str = ""  # Comma-separated Telegram User IDs, e.g. "12345,67890"
    
    SUPABASE_URL: str = "https://example.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY: str = "DEFAULT_SERVICE_ROLE_KEY"

    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = ""  # Optional extra comma-separated CORS origins

    PORT: int = 8000
    ENVIRONMENT: str = "development"

    @property
    def admin_id_list(self) -> List[int]:
        if not self.ALLOWED_ADMIN_IDS:
            return []
        return [int(x.strip()) for x in self.ALLOWED_ADMIN_IDS.split(",") if x.strip().isdigit()]

    @property
    def cors_origins(self) -> List[str]:
        origins = set()
        if self.FRONTEND_URL:
            origins.add(self.FRONTEND_URL.rstrip("/"))
        if self.ALLOWED_ORIGINS:
            origins.update(
                origin.strip().rstrip("/")
                for origin in self.ALLOWED_ORIGINS.split(",")
                if origin.strip()
            )
        return sorted(origins)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
