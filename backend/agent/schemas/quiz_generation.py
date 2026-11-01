"""Schema definition for structured output containing quiz questions."""

from pydantic import BaseModel, Field

class QuizQuestion(BaseModel):
    """Structured representation of a quiz question."""

    question_text: str = Field(
        description="The text of the quiz question."
    )
    answer_options: list[str] = Field(
        description="List of 4 answer options for multiple-choice questions."
    )
    correct_answer: str = Field(
        description="The exact string matching the correct answer option from answer_options."
    )


class QuizGenerationOutput(BaseModel):
    """Structured output containing quiz questions."""

    generated_questions: list[QuizQuestion] = Field(
        min_length=10,
        max_length=10,
        description=(
            "Ten clear quiz questions covering different "
            "difficulty levels, including understanding and application."
        )
    )