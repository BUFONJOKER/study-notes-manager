from langchain_core.prompts import ChatPromptTemplate
from agent.schemas.main import AgentState
from agent.model.llm import load_llm
from pydantic import BaseModel, Field


class QuizGenerationState(BaseModel):
    generated_questions: list[str] = Field(
        ..., description="List of quiz questions generated based on the key concepts"
    )


def quiz_generation(state: AgentState, llm) -> dict:
    """
    Use key concepts to generate quiz questions.

    Args:
        state: Current agent state.
        llm: LLM instance injected by the workflow.

    Returns:
        Dictionary containing generated quiz questions.
    """

    # Create a structured-output version of the injected LLM
    structured_llm = llm.with_structured_output(QuizGenerationState)

    # Define the prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an expert educator creating quiz questions. Generate 8-12 multiple-choice or short-answer questions that:\n\n"
                "- Test understanding of the key concepts (not just memorization)\n"
                "- Cover different difficulty levels (basic recall to application)\n"
                "- Are clear and unambiguous\n"
                "- Use the exact terminology from the summary\n"
                "- Build from simpler to more complex understanding\n\n"
                "Format each question clearly and concisely.",
            ),
            (
                "human",
                "Create quiz questions based on:\n\nSummary:\n{summary_result}\n\nKey Concepts: {key_concepts}",
            ),
        ]
    )

    # Format the prompt using the current state
    formatted_prompt = prompt.invoke(
        {
            "summary_result": state.summary_result,
            "key_concepts": state.key_concepts,
        }
    )

    # Invoke the structured-output LLM
    response = structured_llm.invoke(formatted_prompt)

    # response is already a QuizGenerationState object
    return {"generated_questions": response.generated_questions}


