"""Node for analyzing study notes."""

from langchain_core.prompts import ChatPromptTemplate

from agent.schemas.agent_state import AgentState
from agent.schemas.analysis import StudyNotesAnalysis


async def analyze(state: AgentState, llm) -> dict:
    """Analyze study notes and return structured analysis."""

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You are an expert educator analyzing study notes.

                Produce an accurate, concise report containing:
                1. Main theme of the notes.
                2. Three to five essential key points.
                3. Relationships between the concepts.
                4. Practical, real-world applications.
                5. Important insights and implications.

                Use simple language and clear explanations.
                Base your analysis on the supplied notes.
                Do not invent facts or unsupported information.
                If information is missing, state that clearly.
                Avoid unnecessary repetition.
                """,
            ),
            (
                "human",
                """
                Title: {title}
                Subject: {subject}

                Content:
                {content}
                """,
            ),
        ]
    )

    structured_llm = llm.with_structured_output(StudyNotesAnalysis)

    result = await (prompt | structured_llm).ainvoke(
        {
            "title": state.note_title,
            "subject": state.note_subject,
            "content": state.note_content,
        }
    )

    return {"analysis_result": result}