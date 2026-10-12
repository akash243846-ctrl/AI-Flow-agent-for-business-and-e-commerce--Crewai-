"""
Application configuration for AgentFlow AI.
Loads settings from environment variables and provides sensible defaults.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Base Directory: agentflow-ai project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "AgentFlow AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Gemini Configuration
    GEMINI_API_KEY: str = Field(default="", validation_alias="GEMINI_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini/gemini-3.1-flash-lite", validation_alias="GEMINI_MODEL")
    DEFAULT_TEMPERATURE: float = 0.2
    
    # Serper Search API
    SERPER_API_KEY: str = Field(default="", validation_alias="SERPER_API_KEY")
    
    # File Paths & Storage
    BASE_DIR_PATH: Path = BASE_DIR
    OUTPUTS_DIR: Path = BASE_DIR / "outputs"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'agentflow.db'}"
    
    # Server & Security
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

settings = Settings()

# Ensure outputs directory exists
settings.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
