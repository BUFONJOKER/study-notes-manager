from langchain_core.prompts import ChatPromptTemplate

from agent.schemas.main import AgentState
from agent.model.llm import load_llm


def summary(state: AgentState, llm=None) -> dict:
    """
    Generate a concise summary based on the analysis result.

    Args:
        state: Current agent state.
        llm: LLM instance injected by the workflow. If None, loads a default LLM.

    Returns:
        Dictionary containing the summary result.
    """
    if llm is None:
        model = load_llm()
    else:
        model = llm

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an expert summarizer. Create a concise 2-3 paragraph summary that:\n"
                "1. Captures the main theme and purpose\n"
                "2. Highlights the 3-5 most critical points\n"
                "3. Uses clear, accessible language\n"
                "4. Maintains key technical terms where necessary\n"
                "5. Is structured for easy reading and retention\n\n"
                "Keep it under 250 words.",
            ),
            ("human", "Analysis to summarize:\n\n{analysis_result}"),
        ]
    )

    # Format the prompt using state attributes
    formatted_prompt = prompt.invoke(
        {
            "analysis_result": state.analysis_result,
        }
    )

    # Invoke model and return response
    response = model.invoke(formatted_prompt)

    return {"summary_result": response.content}


