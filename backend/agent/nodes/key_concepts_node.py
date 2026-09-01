from langchain_core.prompts import ChatPromptTemplate
from agent.schemas.main import AgentState
from agent.model.llm import load_llm
from pydantic import BaseModel, Field


class KeyConceptsState(BaseModel):
    key_concepts: list[str] = Field(
        ..., description="List of key concepts extracted from the analysis"
    )


def key_concepts(state: AgentState, llm) -> dict:
    """
    Extract key concepts from the summary result.

    Args:
        state: Current agent state.
        llm: LLM instance injected by the workflow.

    Returns:
        Dictionary containing extracted key concepts.
    """

    # Create a structured-output version of the injected LLM
    structured_llm = llm.with_structured_output(KeyConceptsState)

    # Define the prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an expert in knowledge extraction. Extract 8-15 key concepts from the provided summary.\n\n"
                "Guidelines:\n"
                "- Include only the most important and foundational terms/concepts\n"
                "- Use consistent, clear naming (single noun or short phrase)\n"
                "- Avoid redundancy - do not list similar variations\n"
                "- Order by importance/frequency of mention\n"
                "- Each concept should be fundamental to understanding the material\n\n"
                "Focus on concepts, not definitions.",
            ),
            (
                "human",
                "Extract key concepts from this summary:\n\n{summary_result}",
            ),
        ]
    )

    # Format the prompt using the current state
    formatted_prompt = prompt.invoke(
        {
            "summary_result": state.summary_result,
        }
    )

    # Invoke the structured-output LLM
    response = structured_llm.invoke(formatted_prompt)

    # response is already a KeyConceptsState object
    return {"key_concepts": response.key_concepts}


