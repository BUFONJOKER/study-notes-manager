from langchain_core.prompts import ChatPromptTemplate

from agent.schemas.main import AgentState
from agent.model.llm import load_llm


def analyze(state: AgentState) -> dict:

    model = load_llm()

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an expert in analyzing study notes. Your task is to analyze the provided study notes and generate a comprehensive analysis report. The report should include the following sections:\n"
                "1. Summary: Provide a concise summary of the study notes, highlighting the main points and key takeaways.\n"
                "2. Key Concepts: Identify and explain the key concepts, theories, or ideas presented in the study notes. Provide clear definitions and explanations for each concept.\n"
                "3. Important Details: Highlight any important details, examples, or supporting information that are crucial for understanding the study notes. Include relevant examples or case studies if applicable.",
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

    return {"analysis": response.content}


if __name__ == "__main__":
    # Example usage
    state = AgentState(
        note_id="note_001",
        note_title="The Impact of Climate Change on Biodiversity",
        note_subject="Environmental Science",
        note_content="Climate change has significant effects on biodiversity. Rising temperatures, changing precipitation patterns, and increased frequency of extreme weather events can lead to habitat loss, species migration, and extinction. Conservation efforts are essential to mitigate these impacts.",
        analysis_result="",
        summary_result="",
        key_concepts=[],
        generated_questions=[],
    )
    analysis_result = analyze(state)
    print(analysis_result)
