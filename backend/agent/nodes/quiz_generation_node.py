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
        key_concepts=[
            "biodiversity",
            "climate change",
            "temperature rise",
            "altered precipitation",
            "extreme weather events",
            "habitat loss",
            "range shifts",
            "species migration",
            "extinction risk",
            "conservation",
            "protection",
            "restoration",
            "adaptive planning",
        ],
        generated_questions=[
            "Define biodiversity and explain how climate change threatens it through temperature rise, altered precipitation, and extreme weather events.",
            "Which climate-change-related changes are identified as drivers of habitat loss and higher extinction risk (temperature rise, altered precipitation, extreme weather events)?",
            "How does a rise in temperature cause species to shift or migrate their geographic ranges (range shifts)?",
            "What is meant by altered precipitation, and how can it impact habitats and biodiversity?",
            "What are extreme weather events and how can they increase extinction risk for species?",
            "Define habitat loss and describe how climate change contributes to it.",
            "What are range shifts and species migration, and why do they occur in response to climate change?",
            "What is extinction risk, and how is it affected by climate change?",
            "What are the three main components of conservation actions to mitigate climate-change impacts (protection, restoration, adaptive planning)?",
            "How do protection and restoration differ in the context of conservation?",
            "What is adaptive planning in conservation, and why is it important under climate-change conditions?",
            "Scenario: If a species shifts its range to higher elevations due to warming, what conservation actions would help it persist (e.g., protect new habitats, restore degraded areas, and adjust protections through adaptive planning)?",
        ],
    )

    # Create the LLM
    llm = load_llm()

    # Pass the LLM into the node
    result = quiz_generation(state, llm)

    print(result)
