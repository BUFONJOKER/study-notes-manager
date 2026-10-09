from langchain_core.prompts import ChatPromptTemplate

from agent.schemas.agent_state import AgentState



async def analyze(state: AgentState, llm) -> dict:
    """
    Analyze the study notes and generate a comprehensive analysis report.

    Args:
        state: Current agent state.
        llm: LLM instance injected by the workflow. If None, loads a default LLM.

    Returns:
        Dictionary containing the analysis result.
    """

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an expert educator tasked with analyzing study notes. Provide a comprehensive analysis that includes:\n"
                "1. Main Theme: The central topic or concept of the notes\n"
                "2. Key Points: 3-5 most important points or ideas\n"
                "3. Interconnections: How different concepts relate to each other\n"
                "4. Practical Applications: Real-world relevance or uses\n"
                "5. Critical Insights: Important observations or deeper implications\n\n"
                "Be clear, concise, and well-organized.",
            ),
            ("human", "Title: {title}\nSubject: {subject}\n\nContent:\n{content}"),
        ]
    )

    # Format the prompt using state attributes
    formatted_prompt = prompt.invoke(
        {
            "title": state.note_title,
            "subject": state.note_subject,
            "content": state.note_content,
        }
    )

    # Invoke model and return response
    response = await llm.ainvoke(formatted_prompt)

    return {"analysis_result": response.content}
