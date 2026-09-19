"""Configuration loaded from environment variables."""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    admin_secret: str
    dashboard_api_key: str
    google_client_id: Optional[str] = None
    whatsapp_verify_token: str
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
