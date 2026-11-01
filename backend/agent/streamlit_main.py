"""Workflow definition for the study notes analysis and quiz-generation process."""
from functools import partial

from langgraph.graph import START, END, StateGraph
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

import streamlit as st

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


def quiz_generation(state: AgentState, llm) -> dict:
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
                You are an expert educator creating multiple-choice quiz questions.

                Generate exactly 10 questions based on the supplied summary and key concepts.

                Requirements:
                - Test understanding and application.
                - For each question, provide 4 distinct answer options.
                - Specify the exact correct answer in `correct_answer` (must match one of the options in `answer_options`).
                - Do not introduce facts unsupported by the material.
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

    result = (prompt | structured_llm).invoke(
        {
            "summary_result": state.summary_result,
            "key_concepts": "\n".join(
                f"- {concept}" for concept in state.key_concepts
            ),
        }
    )

    return {"generated_questions": result.generated_questions}


def key_concepts(state: AgentState, llm) -> dict:
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

    result = (prompt | structured_llm).invoke(
        {"summary_result": state.summary_result}
    )

    return {"key_concepts": result.key_concepts}


def summary(state: AgentState, llm) -> dict:
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

    result = (prompt | structured_llm).invoke(
        {
            "analysis_result": state.analysis_result.model_dump_json(
                indent=2
            )
        }
    )

    return {"summary_result": result.summary_result}


def analyze(state: AgentState, llm) -> dict:
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

    result = (prompt | structured_llm).invoke(
        {
            "title": state.note_title,
            "subject": state.note_subject,
            "content": state.note_content,
        }
    )

    return {"analysis_result": result}


def build_workflow(llm):
    """Build the study notes analysis and quiz-generation workflow."""

    graph = StateGraph(AgentState)

    graph.add_node("analyze", partial(analyze, llm=llm))
    graph.add_node("summary", partial(summary, llm=llm))
    graph.add_node("key_concepts", partial(key_concepts, llm=llm))
    graph.add_node("quiz_generation", partial(quiz_generation, llm=llm))

    graph.add_edge(START, "analyze")
    graph.add_edge("analyze", "summary")
    graph.add_edge("summary", "key_concepts")
    graph.add_edge("key_concepts", "quiz_generation")
    graph.add_edge("quiz_generation", END)

    return graph.compile()


if __name__ == "__main__":

    st.title("Study Notes Analysis & Interactive Quiz")

    # Initialize Session State
    if "quiz_questions" not in st.session_state:
        st.session_state["quiz_questions"] = []
    if "quiz_submitted" not in st.session_state:
        st.session_state["quiz_submitted"] = False

    note_id = st.text_input("Note ID", value="note123")
    note_title = st.text_input("Note Title", value="Introduction to Quantum Mechanics")
    note_subject = st.text_input("Note Subject", value="Physics")
    note_content = st.text_area(
        "Note Content",
        value=(
            "Quantum mechanics is a fundamental theory in physics that "
            "describes nature at the smallest scales of energy levels of "
            "atoms and subatomic particles. It introduces concepts such "
            "as wave-particle duality, quantization of energy, and the "
            "uncertainty principle."
        ),
        height=200,
    )

    llm = load_llm()
    workflow = build_workflow(llm)

    if st.button("Run Analysis & Generate Quiz"):
        st.session_state["quiz_submitted"] = False
        st.session_state["quiz_questions"] = []

        state = AgentState(
            note_id=note_id,
            note_title=note_title,
            note_subject=note_subject,
            note_content=note_content,
        )

        analysis_placeholder = st.empty()
        summary_placeholder = st.empty()
        concepts_placeholder = st.empty()
        quiz_placeholder = st.empty()

        with st.spinner("Processing workflow nodes..."):
            for chunk in workflow.stream(state, stream_mode="updates"):
                for node_name, node_output in chunk.items():

                    if node_name == "analyze":
                        analysis_result = node_output.get("analysis_result")
                        data = analysis_result.model_dump() if hasattr(analysis_result, "model_dump") else analysis_result or {}

                        md = "### Analysis Result\n\n"
                        if data.get("main_theme"):
                            md += f"**Main Theme:**\n{data['main_theme']}\n\n"
                        if data.get("key_points"):
                            md += "**Key Points:**\n"
                            for kp in data["key_points"]:
                                md += f"- {kp}\n"
                            md += "\n"
                        if data.get("interconnections"):
                            md += f"**Interconnections:**\n{data['interconnections']}\n\n"
                        if data.get("practical_applications"):
                            md += "**Practical Applications:**\n"
                            for pa in data["practical_applications"]:
                                md += f"- {pa}\n"
                            md += "\n"
                        if data.get("critical_insights"):
                            md += "**Critical Insights:**\n"
                            for ci in data["critical_insights"]:
                                md += f"- {ci}\n"

                        analysis_placeholder.markdown(md)

                    elif node_name == "summary":
                        summary_result = node_output.get("summary_result")
                        summary_placeholder.markdown("### Summary Result")
                        summary_placeholder.write(summary_result)

                    elif node_name == "key_concepts":
                        kc = node_output.get("key_concepts", [])
                        concepts_placeholder.markdown("### Key Concepts")
                        concepts_placeholder.write(kc)

                    elif node_name == "quiz_generation":
                        questions = node_output.get("generated_questions", [])
                        # Store in session state for interactive rendering
                        st.session_state["quiz_questions"] = questions

    # Interactive Quiz UI Section
    if st.session_state["quiz_questions"]:
        st.divider()
        st.header(" Take the Quiz")

        user_answers = {}

        with st.form("quiz_form"):
            for idx, q in enumerate(st.session_state["quiz_questions"], start=1):
                # Ensure objects can be accessed either as Pydantic models or dicts
                q_text = q.question_text if hasattr(q, "question_text") else q["question_text"]
                q_opts = q.answer_options if hasattr(q, "answer_options") else q["answer_options"]

                st.subheader(f"Q{idx}: {q_text}")
                user_answers[idx] = st.radio(
                    f"Select an answer for Question {idx}:",
                    options=q_opts,
                    key=f"q_{idx}"
                )
                st.markdown("---")

            submitted = st.form_submit_button("Submit Quiz")
            if submitted:
                st.session_state["quiz_submitted"] = True

        # Show Quiz Results
        if st.session_state["quiz_submitted"]:
            correct_count = 0
            total_questions = len(st.session_state["quiz_questions"])

            st.header(" Quiz Results")

            for idx, q in enumerate(st.session_state["quiz_questions"], start=1):
                q_text = q.question_text if hasattr(q, "question_text") else q["question_text"]
                correct_ans = q.correct_answer if hasattr(q, "correct_answer") else q["correct_answer"]
                user_ans = user_answers.get(idx)

                is_correct = user_ans == correct_ans
                if is_correct:
                    correct_count += 1

                with st.expander(f"Question {idx}: {' Correct' if is_correct else ' Incorrect'}", expanded=True):
                    st.write(f"**Question:** {q_text}")
                    if is_correct:
                        st.success(f"**Your Answer:** {user_ans}")
                    else:
                        st.error(f"**Your Answer:** {user_ans}")
                        st.info(f"**Correct Answer:** {correct_ans}")

            # Score Summary
            percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
            st.markdown(f"### **Total Score:** {correct_count} / {total_questions} ({percentage:.1f}%)")
            st.progress(percentage / 100)