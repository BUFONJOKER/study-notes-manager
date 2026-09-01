from pydantic import BaseModel, Field

class AgentState(BaseModel):
    """State container passed between nodes in the agent's workflow."""

    note_id: str = Field(..., example="note_123")
    note_title: str = Field(..., example="My Note Title")
    note_subject: str = Field(..., example="My Note Subject")
    note_content: str = Field(..., example="This is the content of my note.")

    analysis_result: str = Field(..., example="This is the result of the analysis.")
    summary_result: str = Field(..., example="This is the result of the summary.")
    key_concepts: list[str] = Field(..., example=["concept1", "concept2", "concept3"])
    generated_questions: list[str] = Field(..., example=["What is the main idea?", "What are the key points?"])