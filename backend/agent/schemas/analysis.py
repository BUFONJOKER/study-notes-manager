
from pydantic import BaseModel, Field


class StudyNotesAnalysis(BaseModel):
    """Structured analysis of study notes."""

    main_theme: str = Field(
        description="The central topic or concept of the study notes."
    )

    key_points: list[str] = Field(
        min_length=3,
        max_length=5,
        description="Three to five essential ideas from the notes."
    )

    interconnections: str = Field(
        description="How the main concepts relate to each other."
    )

    practical_applications: list[str] = Field(
        description="Real-world applications of the concepts."
    )

    critical_insights: list[str] = Field(
        description="Important observations, implications, or deeper insights."
    )