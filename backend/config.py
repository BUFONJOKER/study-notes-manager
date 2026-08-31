"""Configuration module for loading environment variables from .env file."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# API Keys
DATABASE_URL = os.getenv("DATABASE_URL")

# Validate required API keys
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env file")
