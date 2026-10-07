from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):

   DATABASE_URL: str
   OPENAI_API_KEY: str | None = None

   LANGSMITH_TRACING: bool
   LANGSMITH_ENDPOINT: str
   LANGSMITH_API_KEY: str
   LANGSMITH_PROJECT: str
   SECRET_KEY: str

   model_config = SettingsConfigDict(env_file=".env")

@lru_cache()
def get_settings() -> Settings:
    return Settings()