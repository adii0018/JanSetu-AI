"""Configuration loaded from environment variables."""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./jansetu_dev.db"
    jwt_secret: str = "jansetu-secret-jwt-key-2026"
    admin_secret: str = "jansetu-admin-2026"
    dashboard_api_key: str = "jansetu_dev_key_2026"
    google_client_id: Optional[str] = None
    whatsapp_verify_token: str = "jansetu_whatsapp_verify_token_2026"
    whatsapp_app_secret: Optional[str] = None
    nvidia_api_key: Optional[str] = None
    nvidia_asr_api_key: Optional[str] = None
    nvidia_tts_api_key: Optional[str] = None
    viasocket_webhook_url: Optional[str] = None
    breeth_api_key: Optional[str] = None
    allowed_origins: str = "http://localhost:5173"
    environment: str = "development"
    debug: bool = False

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    def get_allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
