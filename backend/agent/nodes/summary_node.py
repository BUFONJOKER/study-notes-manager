
from langchain_core.prompts import ChatPromptTemplate

from agent.schemas.agent_state import AgentState
from agent.schemas.summary import SummaryOutput


async def summary(state: AgentState, llm) -> dict:
    """Generate a concise summary from the analysis."""

    if state.analysis_result is None:
        raise ValueError("Analysis result is required for summarization.")

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You are an expert summarizer.

                Summarize the provided analysis in 2-3 paragraphs,
                using fewer than 250 words.

                Requirements:
                - Capture the main theme and purpose.
                - Highlight the three to five most important points.
                - Use clear, accessible language.
                - Preserve essential technical terminology.
                - Do not introduce unsupported information.
                - Avoid repetition and unnecessary details.
                """,
            ),
            (
                "human",
                "Analysis to summarize:\n\n{analysis_result}",
            ),
        ]
    )

    structured_llm = llm.with_structured_output(SummaryOutput)

    result = await (prompt | structured_llm).ainvoke(
        {
            "analysis_result": state.analysis_result.model_dump_json(
                indent=2
            )
        }
    )

    return {"summary_result": result.summary_result}