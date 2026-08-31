from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    notes_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)