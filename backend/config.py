import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):

   DATABASE_URL: str
   OPENAI_API_KEY: str | None = None

   LANGSMITH_TRACING: bool
   LANGSMITH_ENDPOINT: str
   LANGSMITH_API_KEY: str
   LANGSMITH_PROJECT: str

   SECRET_KEY: str
   ALGORITHM: str
   ACCESS_TOKEN_EXPIRE_MINUTES: int

   model_config = SettingsConfigDict(env_file=".env")

@lru_cache()
def get_settings() -> Settings:
    settings = Settings()

    # LangSmith requires lowercase "true"/"false" for LANGSMITH_TRACING
    os.environ["LANGSMITH_TRACING"] = "true" if settings.LANGSMITH_TRACING else "false"
    os.environ["LANGSMITH_ENDPOINT"] = settings.LANGSMITH_ENDPOINT
    os.environ["LANGSMITH_API_KEY"] = settings.LANGSMITH_API_KEY
    os.environ["LANGSMITH_PROJECT"] = settings.LANGSMITH_PROJECT

    return settings