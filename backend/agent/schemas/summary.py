"""Schema definition for structured output of the study notes summary."""

from pydantic import BaseModel, Field

class SummaryOutput(BaseModel):
    """Structured output for the study notes summary."""

    summary_result: str = Field(
        min_length=1,
        description=(
            "A concise summary of the analysis in 2-3 paragraphs, "
            "under 250 words."
        )
    )