from pydantic import BaseModel, Field, field_serializer
from datetime import datetime


class NoteCreate(BaseModel):
    """Schema for creating a new note."""

    user_id: int = Field(
        ..., example=1, description="ID of the user creating the note."
    )
    note_id: str = Field(
        ..., example="note_123", description="Unique identifier for the note."
    )
    title: str = Field(..., example="My Note Title", description="Title of the note.")
    subject: str = Field(
        ..., example="My Note Subject", description="Subject of the note."
    )
    content: str = Field(
        ...,
        example="This is the content of my note.",
        description="Content of the note.",
    )
    quiz: str | None = Field(
        default=None,
        example=["What is concept1?", "Explain concept2.", "Describe concept3."],
        description="Quiz generated related to the note. which will be generated later in the workflow and can be updated later.",
    )


class NoteUpdate(BaseModel):
    """Schema for updating an existing note."""

    title: str = Field(
        ..., example="Updated Note Title", description="Title of the note."
    )
    subject: str = Field(
        ..., example="Updated Note Subject", description="Subject of the note."
    )
    content: str = Field(
        ...,
        example="This is the updated content of my note.",
        description="Content of the note.",
    )
    quiz: str | None = Field(
        default=None,
        example=["What is concept1?", "Explain concept2.", "Describe concept3."],
        description="Quiz generated related to the note. which will be generated later in the workflow and can be updated later.",
    )


class NoteResponse(BaseModel):
    """Schema for returning note data in responses."""

    user_id: int = Field(
        ..., example=1, description="ID of the user who created the note."
    )
    note_id: str = Field(
        ..., example="note_123", description="Unique identifier for the note."
    )
    title: str = Field(..., example="My Note Title", description="Title of the note.")
    subject: str = Field(
        ..., example="My Note Subject", description="Subject of the note."
    )
    content: str = Field(
        ...,
        example="This is the content of my note.",
        description="Content of the note.",
    )
    quiz: str | None = Field(
        default=None,
        example=["What is concept1?", "Explain concept2.", "Describe concept3."],
        description="Quiz generated related to the note. which will be generated later in the workflow and can be updated later.",
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
    execution_time_seconds: float = Field(
        ..., example=1.23, description="Time taken to process the note in seconds."
    )
    tokens: dict = Field(
        ...,
        example={"input_tokens": 100, "output_tokens": 50},
        description="Token usage details.",
    )


class QuizGenerationResponse(BaseModel):
    """Result returned after running the complete note-processing workflow."""

    user_id: int = Field(
        ..., example=1, description="ID of the user who created the note."
    )
    note_id: str = Field(..., example="note_123")
    title: str = Field(..., example="My Note Title")
    analysis_result: str = Field(
        ..., example="This is the analysis result of the note."
    )
    summary_result: str = Field(..., example="This is the summary result of the note.")
    key_concepts: list[str] = Field(..., example=["concept1", "concept2", "concept3"])
    generated_questions: list[str] = Field(
        ..., example=["What is concept1?", "Explain concept2.", "Describe concept3."]
    )
    telemetry: UsageTelemetry = Field(
        ..., description="Telemetry data related to the note processing workflow."
    )
