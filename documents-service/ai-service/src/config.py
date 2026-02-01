"""
Configuration management using Pydantic Settings.
All configuration is loaded from environment variables.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # HTTP Server Configuration
    http_port: int = Field(default=8000, description="Port for HTTP server")

    # MinIO Configuration
    minio_endpoint: str = Field(default="minio:9000", description="MinIO server endpoint")
    minio_access_key: str = Field(default="minioadmin", description="MinIO access key")
    minio_secret_key: str = Field(default="minioadmin", description="MinIO secret key")
    minio_bucket_name: str = Field(default="documents", description="MinIO bucket name")
    minio_secure: bool = Field(default=False, description="Use HTTPS for MinIO connection")

    # Groq AI Configuration
    groq_api_key: str = Field(..., description="Groq API key")
    groq_model: str = Field(default="openai/gpt-oss-120b", description="Groq model to use")
    groq_max_tokens: int = Field(default=1024, description="Maximum tokens for AI response")
    groq_temperature: float = Field(default=0.1, description="Temperature for AI response")

    # Retry Configuration
    max_retries: int = Field(default=3, description="Maximum retry attempts for external services")
    retry_delay_seconds: float = Field(default=1.0, description="Initial delay between retries")

    # Logging Configuration
    log_level: str = Field(default="INFO", description="Logging level")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log format string"
    )


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache for singleton pattern.
    """
    return Settings()
