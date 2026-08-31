import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

class Base(DeclarativeBase):
    pass

# Create the database engine
engine = create_engine(
    DATABASE_URL,
    pool_size=5,          # Maintains 5 persistent connections
    max_overflow=10,      # Can create 10 additional temporary connections
    pool_timeout=30,      # Wait 30 seconds for available connection
    pool_recycle=3600,    # Recycle connections after 1 hour
    pool_pre_ping=True    # Test connection before using
)
# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)