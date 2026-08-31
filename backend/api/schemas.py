from pydantic import BaseModel, Field, field_serializer
from datetime import datetime


class NoteCreate(BaseModel):
    """Schema for creating a new note."""

    user_name: str = Field(..., example="john_doe")
    note_id: str = Field(..., example="note_123")
    title: str = Field(..., example="My Note Title")
    subject: str = Field(..., example="My Note Subject")
    content: str = Field(..., example="This is the content of my note.")


class NoteUpdate(BaseModel):
    """Schema for updating an existing note."""

    title: str = Field(..., example="Updated Note Title")
    subject: str = Field(..., example="Updated Note Subject")
    content: str = Field(..., example="This is the updated content of my note.")


class NoteResponse(BaseModel):
    """Schema for returning note data in responses."""

    user_name: str = Field(..., example="john_doe")
    note_id: str = Field(..., example="note_123")
    title: str = Field(..., example="My Note Title")
    subject: str = Field(..., example="My Note Subject")
    content: str = Field(..., example="This is the content of my note.")
    created_at: datetime = Field(..., example="2023-01-01T12:00:00Z")
    updated_at: datetime = Field(..., example="2023-01-02T12:00:00Z")

    class Config:
        from_attributes = True

    @field_serializer("created_at", "updated_at")
    def serialize_datetime(self, value: datetime) -> str:
        """Serialize datetime to ISO format string."""
        return value.isoformat() if isinstance(value, datetime) else value
