"""Node for generating quiz questions based on the study notes summary and key concepts."""

from langchain_core.prompts import ChatPromptTemplate

from agent.schemas.agent_state import AgentState
from agent.schemas.quiz_generation import QuizGenerationOutput


async def quiz_generation(state: AgentState, llm) -> dict:
    """Generate quiz questions from the summary and key concepts."""

    if not state.summary_result.strip():
        raise ValueError("Summary result is required to generate a quiz.")

    if not state.key_concepts:
        raise ValueError("Key concepts are required to generate a quiz.")

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You are an expert educator creating quiz questions.

                Generate 8-12 questions based on the supplied summary
                and key concepts.

                Requirements:
                - Test understanding and application, not only memorization.
                - Cover different difficulty levels.
                - Use clear, specific, unambiguous wording.
                - Preserve the terminology used in the summary.
                - Progress from simpler to more challenging questions.
                - Do not introduce facts unsupported by the material.
                - Include multiple-choice or short-answer questions.
                - For multiple-choice questions, include answer options
                  in the question text.
                """,
            ),
            (
                "human",
                """
                Summary:
                {summary_result}

                Key Concepts:
                {key_concepts}
                """,
            ),
        ]
    )

    structured_llm = llm.with_structured_output(QuizGenerationOutput)

    result = await (prompt | structured_llm).ainvoke(
        {
            "summary_result": state.summary_result,
            "key_concepts": "\n".join(
                f"- {concept}" for concept in state.key_concepts
            ),
        }
    )

    return {"generated_questions": result.generated_questions}