from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    app_name: str = "Budget App"
    version: str = "1.0.0"
    cors_origins: List[str] = ["http://localhost:3000"]
    debug: bool = True

    class Config:
        env_file = ".env"  # Environment file for configurations

settings = Settings()
