"""
Configuration module for JanSetu backend.
Loads settings from environment variables using pydantic-settings.
"""
from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str
    
    # API Keys
    nvidia_api_key: Optional[str] = None
    nvidia_asr_api_key: Optional[str] = None
    nvidia_tts_api_key: Optional[str] = None
    dashboard_api_key: Optional[str] = None
    
    # CORS
    allowed_origins: str = "http://localhost:5173"
    
    # Application
    environment: str = "development"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    def get_allowed_origins(self) -> List[str]:
        """Parse comma-separated allowed origins."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Global settings instance
settings = Settings()
