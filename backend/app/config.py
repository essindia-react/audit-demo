"""Application configuration helpers."""
from functools import lru_cache
from typing import List

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Central application configuration loaded from environment variables."""

    app_name: str = "Procurement Audit API"
    database_url: str = Field(
        default="mysql+mysqlconnector://root:root@localhost:3306/procurement_audit",
        env="DATABASE_URL",
    )
    frontend_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        env="FRONTEND_ORIGINS",
    )
    sync_schema_on_startup: bool = Field(default=False, env="SYNC_SCHEMA_ON_STARTUP")
    secret_key: str = Field(default="change-me", env="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=60 * 24, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    evidence_storage_dir: str = Field(default="storage/evidence", env="EVIDENCE_STORAGE_DIR")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()
