"""Schema definition for structured output containing key concepts."""

from pydantic import BaseModel, Field

class KeyConceptsOutput(BaseModel):
    """Structured output containing key concepts."""

    key_concepts: list[str] = Field(
        min_length=8,
        max_length=15,
        description=(
            "Eight to fifteen distinct, foundational concepts, "
            "ordered by importance."
        )
    )