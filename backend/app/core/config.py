# backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union
import os

class Settings(BaseSettings):
    # App Configuration
    app_name: str = "Budget App"
    version: str = "1.0.0"
    debug: bool = True
    
    # CORS Configuration - Handle both JSON and comma-separated strings
    cors_origins: Union[List[str], str] = ["http://localhost:3000", "http://localhost"]
    
    # JWT Configuration
    jwt_secret_key: str = "your-secret-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # Database Configuration
    db_host: str = "mysql"
    db_user: str = "budget_user" 
    db_password: str = "budget_password"
    db_name: str = "budget_db"

    # Model configuration - This is the KEY FIX!
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Allow extra environment variables without errors
        case_sensitive=False,  # Environment variables are case-insensitive
        validate_default=False,  # Don't validate default values
    )

    def model_post_init(self, __context) -> None:
        """Convert CORS origins to list if it's a string"""
        if isinstance(self.cors_origins, str):
            # Handle comma-separated string from environment variables
            self.cors_origins = [origin.strip() for origin in self.cors_origins.split(',')]

    def get_database_url(self) -> str:
        """Get the complete database URL"""
        return f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}/{self.db_name}"

settings = Settings()

# Export JWT settings for use in auth modules
JWT_SECRET_KEY = settings.jwt_secret_key
JWT_ALGORITHM = settings.jwt_algorithm  
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = settings.jwt_access_token_expire_minutes