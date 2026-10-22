"""Node for extracting key concepts from the study notes summary."""

from langchain_core.prompts import ChatPromptTemplate

from agent.schemas.agent_state import AgentState
from agent.schemas.key_concepts import KeyConceptsOutput


async def key_concepts(state: AgentState, llm) -> dict:
    """Extract key concepts from the summary."""

    if not state.summary_result.strip():
        raise ValueError("Summary result is required to extract key concepts.")

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You are an expert in knowledge extraction.

                Extract 8-15 important concepts from the supplied summary.

                Guidelines:
                - Select foundational terms and important ideas.
                - Use clear, consistent names or short phrases.
                - Avoid duplicate or closely related concepts.
                - Order concepts by importance.
                - Focus on concepts, not their definitions.
                - Use only concepts supported by the summary.
                """,
            ),
            (
                "human",
                "Extract key concepts from this summary:\n\n{summary_result}",
            ),
        ]
    )

    structured_llm = llm.with_structured_output(KeyConceptsOutput)

    result = await (prompt | structured_llm).ainvoke(
        {"summary_result": state.summary_result}
    )

    return {"key_concepts": result.key_concepts}