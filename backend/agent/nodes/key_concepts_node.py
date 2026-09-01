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


if __name__ == "__main__":

    # Example state for testing the node independently
    state = AgentState(
        note_id="note_001",
        note_title="The Impact of Climate Change on Biodiversity",
        note_subject="Environmental Science",
        note_content=(
            "Climate change has significant effects on biodiversity. "
            "Rising temperatures, changing precipitation patterns, and "
            "increased frequency of extreme weather events can lead to "
            "habitat loss, species migration, and extinction. "
            "Conservation efforts are essential to mitigate these impacts."
        ),
        analysis_result="""
        Analysis Report: The Impact of Climate Change on Biodiversity

        1) Summary

        Climate change profoundly affects biodiversity through rising
        temperatures, altered precipitation patterns, and more frequent
        extreme weather events.

        These changes drive habitat loss, force species to migrate or
        shift ranges, and increase the risk of extinction.

        Conservation efforts are essential to mitigate these impacts.

        2) Key Concepts

        - Biodiversity
        - Climate Change
        - Temperature Rise
        - Altered Precipitation Patterns
        - Extreme Weather Events
        - Habitat Loss
        - Species Migration
        - Extinction
        - Conservation Efforts
        """,
        summary_result="""
        Climate change deeply affects biodiversity through rising
        temperatures, altered precipitation, and more extreme events.

        These changes drive habitat loss, force species to move or shift
        ranges, and increase extinction risk.

        Conservation actions are essential to mitigate these impacts,
        combining protection, restoration, and adaptive planning.

        Important concepts include biodiversity, climate change,
        temperature rise, altered precipitation, extreme weather events,
        habitat loss, species migration, extinction, and conservation.
        """,
        key_concepts=[],
        generated_questions=[],
    )

    # Create the LLM
    llm = load_llm()

    # Pass the LLM into the node
    result = key_concepts(state, llm)

    print(result)
