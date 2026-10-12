
from pydantic import BaseModel, Field


class QuizGenerationOutput(BaseModel):
    """Structured output containing quiz questions."""

    generated_questions: list[str] = Field(
        min_length=8,
        max_length=12,
        description=(
            "Eight to twelve clear quiz questions covering different "
            "difficulty levels, including understanding and application."
        )
    )