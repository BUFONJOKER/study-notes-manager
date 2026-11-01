"""
Schemas for note-related data structures.
"""

from pydantic import BaseModel, Field, field_serializer, ConfigDict, field_validator
import json
from datetime import datetime

from agent.schemas.analysis import StudyNotesAnalysis
from agent.schemas.quiz_generation import QuizQuestion


class NoteCreate(BaseModel):
    """Schema for creating a new note."""

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
    analysis_result: StudyNotesAnalysis | None = Field(
        default=None, description="Structured analysis of the note."
    )
    summary_result: str | None = Field(
        default=None, example="This is the summary result of the note."
    )
    key_concepts: list[str] | None = Field(
        default=None, example=["concept1", "concept2", "concept3"]
    )

    generated_questions: list[QuizQuestion] | None = Field(
        default=None,
        description="Structured multiple-choice questions generated for the note.",
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

    model_config = ConfigDict(extra="forbid")


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

    analysis_result: StudyNotesAnalysis | None = Field(
        default=None, description="Structured analysis of the note."
    )
    summary_result: str | None = Field(
        default=None, example="This is the summary result of the note."
    )
    key_concepts: list[str] | None = Field(
        default=None, example=["concept1", "concept2", "concept3"]
    )

    generated_questions: list[QuizQuestion] | None = Field(
        default=None,
        description="Structured multiple-choice questions generated for the note.",
    )

    created_at: datetime = Field(..., example="2023-01-01T12:00:00Z")
    updated_at: datetime = Field(..., example="2023-01-02T12:00:00Z")

    class Config:
        from_attributes = True

    @field_validator("generated_questions", mode="before")
    @classmethod
    def parse_generated_questions(cls, v):
        """Safely parse stringified JSON from SQLite into a list before validation."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v

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
    analysis_result: StudyNotesAnalysis = Field(
        ..., description="Structured analysis of the note."
    )
    summary_result: str = Field(..., example="This is the summary result of the note.")
    key_concepts: list[str] = Field(..., example=["concept1", "concept2", "concept3"])
    generated_questions: list[QuizQuestion] = Field(
        ...,
        description="Structured multiple-choice questions generated for the note.",
    )
    telemetry: UsageTelemetry = Field(
        ..., description="Telemetry data related to the note processing workflow."
    )
