"""Workflow definition for the study notes analysis and quiz-generation process."""
from functools import partial
from langgraph.graph import START, END, StateGraph
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

def load_llm() -> ChatOpenAI:
    """Create a request-scoped ChatOpenAI client for the supplied API key."""

    return ChatOpenAI(
        model="gpt-5-nano",
        temperature=0
    )



class StudyNotesAnalysis(BaseModel):
    """Structured analysis of study notes."""

    main_theme: str = Field(
        description="The central topic or concept of the study notes."
    )
    key_points: list[str] = Field(
        min_length=3,
        max_length=5,
        description="Three to five essential ideas from the notes."
    )
    interconnections: str = Field(
        description="How the main concepts relate to each other."
    )
    practical_applications: list[str] = Field(
        description="Real-world applications of the concepts."
    )
    critical_insights: list[str] = Field(
        description="Important observations, implications, or deeper insights."
    )


class QuizQuestion(BaseModel):
    """Structured representation of a quiz question."""

    question_text: str = Field(
        description="The text of the quiz question."
    )
    answer_options: list[str] = Field(
        description="List of 4 answer options for multiple-choice questions."
    )
    correct_answer: str = Field(
        description="The exact string matching the correct answer option from answer_options."
    )


class AgentState(BaseModel):
    """State passed between nodes in the study notes workflow."""

    note_id: str = Field(description="Unique identifier of the note.")
    note_title: str = Field(description="Title of the note.")
    note_subject: str = Field(description="Subject of the note.")
    note_content: str = Field(description="Content of the note.")

    analysis_result: StudyNotesAnalysis | None = Field(
        default=None,
        description="Structured analysis of the study notes."
    )
    summary_result: str = Field(
        default="",
        description="Concise summary of the analysis."
    )
    key_concepts: list[str] = Field(
        default_factory=list,
        description="Extracted key concepts."
    )
    generated_questions: list[QuizQuestion] = Field(
        default_factory=list,
        description="Generated structured quiz questions."
    )


class SummaryOutput(BaseModel):
    """Structured output for the study notes summary."""

    summary_result: str = Field(
        min_length=1,
        description=(
            "A concise summary of the analysis in 2-3 paragraphs, "
            "under 250 words."
        )
    )


class KeyConceptsOutput(BaseModel):
    """Structured output containing key concepts."""

    key_concepts: list[str] = Field(
        min_length=8,
        max_length=15,
        description=(
            "Eight to fifteen distinct, foundational concepts, "
            "ordered by importance."
        )
    )


class QuizGenerationOutput(BaseModel):
    """Structured output containing quiz questions."""

    generated_questions: list[QuizQuestion] = Field(
        min_length=10,
        max_length=10,
        description="List of structured multiple-choice quiz questions."
    )



async def quiz_generation(state: AgentState, llm) -> dict:
    """Generate quiz questions from the summary and key concepts."""

    if not state.summary_result.strip():
        raise ValueError("Summary result is required to generate a quiz.")

    if not state.key_concepts:
        raise ValueError("Key concepts are required to generate a quiz.")

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You are an expert educator creating quiz questions.

                Generate 8-12 questions based on the supplied summary
                and key concepts.

                Requirements:
                - Test understanding and application, not only memorization.
                - Cover different difficulty levels.
                - Use clear, specific, unambiguous wording.
                - Preserve the terminology used in the summary.
                - Progress from simpler to more challenging questions.
                - Do not introduce facts unsupported by the material.
                - Include multiple-choice or short-answer questions.
                - For multiple-choice questions, include answer options
                  in the question text.
                """,
            ),
            (
                "human",
                """
                Summary:
                {summary_result}

                Key Concepts:
                {key_concepts}
                """,
            ),
        ]
    )

    structured_llm = llm.with_structured_output(QuizGenerationOutput)

    result = await (prompt | structured_llm).ainvoke(
        {
            "summary_result": state.summary_result,
            "key_concepts": "\n".join(
                f"- {concept}" for concept in state.key_concepts
            ),
        }
    )

    return {"generated_questions": result.generated_questions}

async def key_concepts(state: AgentState, llm) -> dict:
    """Extract key concepts from the summary."""

    if not state.summary_result.strip():
        raise ValueError("Summary result is required to extract key concepts.")

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You are an expert in knowledge extraction.

                Extract 8-15 important concepts from the supplied summary.

                Guidelines:
                - Select foundational terms and important ideas.
                - Use clear, consistent names or short phrases.
                - Avoid duplicate or closely related concepts.
                - Order concepts by importance.
                - Focus on concepts, not their definitions.
                - Use only concepts supported by the summary.
                """,
            ),
            (
                "human",
                "Extract key concepts from this summary:\n\n{summary_result}",
            ),
        ]
    )

    structured_llm = llm.with_structured_output(KeyConceptsOutput)

    result = await (prompt | structured_llm).ainvoke(
        {"summary_result": state.summary_result}
    )

    return {"key_concepts": result.key_concepts}


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

async def build_workflow(llm):
    """Build the study notes analysis and quiz-generation workflow."""

    graph = StateGraph(AgentState)

    graph.add_node("analyze", partial(analyze, llm=llm))
    graph.add_node("summary", partial(summary, llm=llm))
    graph.add_node("key_concepts", partial(key_concepts, llm=llm))
    graph.add_node(
        "quiz_generation",
        partial(quiz_generation, llm=llm),
    )

    graph.add_edge(START, "analyze")
    graph.add_edge("analyze", "summary")
    graph.add_edge("summary", "key_concepts")
    graph.add_edge("key_concepts", "quiz_generation")
    graph.add_edge("quiz_generation", END)

    return graph.compile()


if __name__ == "__main__":
    import asyncio
    import os

    async def main():



        llm = load_llm()
        workflow = await build_workflow(llm)

        # Example input data
        state = AgentState(
            note_id="note123",
            note_title="Introduction to Quantum Mechanics",
            note_subject="Physics",
            note_content=(
                "Quantum mechanics is a fundamental theory in physics that "
                "describes nature at the smallest scales of energy levels of "
                "atoms and subatomic particles. It introduces concepts such "
                "as wave-particle duality, quantization of energy, and the "
                "uncertainty principle."
            ),
        )

        # Execute the workflow
        result = await workflow.ainvoke(state, stream_mode='values')
        print(result)

    asyncio.run(main())