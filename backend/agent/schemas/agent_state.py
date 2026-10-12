
from pydantic import BaseModel, Field

from agent.schemas.analysis import StudyNotesAnalysis


class AgentState(BaseModel):
    """State passed between nodes in the study notes workflow."""

    note_id: str = Field(description="Unique identifier of the note.")
    note_title: str = Field(description="Title of the note.")
    note_subject: str = Field(description="Subject of the note.")
    note_content: str = Field(description="Content of the note.")

    analysis_result: StudyNotesAnalysis | None = Field(
        default=None,
        description="Structured analysis of the study notes."
    )

    summary_result: str = Field(
        default="",
        description="Concise summary of the analysis."
    )

    key_concepts: list[str] = Field(
        default_factory=list,
        description="Extracted key concepts."
    )

    generated_questions: list[str] = Field(
        default_factory=list,
        description="Generated quiz questions."
    )