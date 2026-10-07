from pydantic import BaseModel, Field, field_serializer
from datetime import datetime


class NoteCreate(BaseModel):
    """Schema for creating a new note."""

    user_id: int = Field(..., example=1)
    note_id: str = Field(..., example="note_123")
    title: str = Field(..., example="My Note Title")
    subject: str = Field(..., example="My Note Subject")
    content: str = Field(..., example="This is the content of my note.")
    quiz: str | None = Field(
        default=None, example="This is a quiz related to the note and can be generated later."
    )


class NoteUpdate(BaseModel):
    """Schema for updating an existing note."""

    title: str = Field(..., example="Updated Note Title")
    subject: str = Field(..., example="Updated Note Subject")
    content: str = Field(..., example="This is the updated content of my note.")
    quiz: str | None = Field(
        default=None, example="This is a quiz related to the note."
    )


class NoteResponse(BaseModel):
    """Schema for returning note data in responses."""

    user_id: int = Field(..., example=1)
    note_id: str = Field(..., example="note_123")
    title: str = Field(..., example="My Note Title")
    subject: str = Field(..., example="My Note Subject")
    content: str = Field(..., example="This is the content of my note.")
    quiz: str | None = Field(
        default=None, example="This is a quiz related to the note."
    )
    created_at: datetime = Field(..., example="2023-01-01T12:00:00Z")
    updated_at: datetime = Field(..., example="2023-01-02T12:00:00Z")

    class Config:
        from_attributes = True

    @field_serializer("created_at", "updated_at")
    def serialize_datetime(self, value: datetime) -> str:
        """Serialize datetime to ISO format string."""
        return value.isoformat() if isinstance(value, datetime) else value

class UsageTelemetry(BaseModel):
    execution_time_seconds: float
    tokens: dict

class QuizGenerationResponse(BaseModel):
    """Result returned after running the complete note-processing workflow."""

    user_id: int
    note_id: str
    analysis_result: str
    summary_result: str
    key_concepts: list[str]
    generated_questions: list[str]
    telemetry: UsageTelemetry