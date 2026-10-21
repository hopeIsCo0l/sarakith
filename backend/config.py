import os
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Environment configuration for the Sara Power Solution status service."""

    SUPABASE_URL: str = "https://example.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY: str = "DEFAULT_SERVICE_ROLE_KEY"

    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = ""  # Optional extra comma-separated CORS origins

    PORT: int = 8000
    ENVIRONMENT: str = "development"

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
