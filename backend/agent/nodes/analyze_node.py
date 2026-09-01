from langchain_core.prompts import ChatPromptTemplate

from agent.schemas.main import AgentState
from agent.model.llm import load_llm


def analyze(state: AgentState, llm=None) -> dict:
    """
    Analyze the study notes and generate a comprehensive analysis report.

    Args:
        state: Current agent state.
        llm: LLM instance injected by the workflow. If None, loads a default LLM.

    Returns:
        Dictionary containing the analysis result.
    """
    if llm is None:
        model = load_llm()
    else:
        model = llm

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
    response = model.invoke(formatted_prompt)

    return {"analysis_result": response.content}


