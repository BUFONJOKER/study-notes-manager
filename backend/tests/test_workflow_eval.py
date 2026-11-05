# test_workflow_eval.py

import pytest
import asyncio

from deepeval import assert_test
from deepeval.dataset import EvaluationDataset
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, SingleTurnParams

# ── Import your workflow ──────────────────────────────────────────────────────
from main import build_workflow, load_llm, AgentState

# ── Load golden dataset from CSV ──────────────────────────────────────────────
dataset = EvaluationDataset()
dataset.add_goldens_from_csv_file(
    file_path="golden_evaluation_dataset_grok.csv",
    input_col_name="note_content",
    expected_output_col_name="expected_output",
    additional_metadata_col_name="evaluation_criteria",
)

# ── Helper: run the workflow and collect all outputs ──────────────────────────
def run_workflow(note_content: str) -> dict:
    async def _run():
        llm = load_llm()
        workflow = await build_workflow(llm)
        state = AgentState(
            note_id="eval-run",
            note_title="Evaluation Note",
            note_subject="General",
            note_content=note_content,
        )
        return await workflow.ainvoke(state)
    return asyncio.run(_run())


# ── Metrics ───────────────────────────────────────────────────────────────────

no_hallucination_metric = GEval(
    name="No Hallucination",
    criteria=(
        "The actual output must not contain any facts, claims, or concepts "
        "that are not supported by or derivable from the input notes. "
        "Penalise any invented information."
    ),
    evaluation_params=[
        SingleTurnParams.INPUT,
        SingleTurnParams.ACTUAL_OUTPUT,
    ],
    threshold=0.7,
)

completeness_metric = GEval(
    name="Output Completeness",
    criteria=(
        "The actual output should cover the key expectations described in "
        "the expected output. Check that required fields (analysis, summary, "
        "key concepts, quiz questions) are present and satisfy the length "
        "constraints mentioned in the expected output."
    ),
    evaluation_params=[
        SingleTurnParams.INPUT,
        SingleTurnParams.ACTUAL_OUTPUT,
        SingleTurnParams.EXPECTED_OUTPUT,
    ],
    threshold=0.6,
)


# ── Parametrised test ─────────────────────────────────────────────────────────

@pytest.mark.parametrize("golden", dataset.goldens)
def test_workflow(golden):

    # Skip empty / whitespace-only content (TC-025, TC-030)
    if not golden.input or not golden.input.strip():
        pytest.skip("Empty content — expected to raise ValueError in workflow.")

    # Run the workflow
    result = run_workflow(golden.input)

    # Build a single string representing the full pipeline output
    actual_output_parts = []

    if result.get("analysis_result"):
        analysis = result["analysis_result"]
        actual_output_parts.append(
            f"ANALYSIS:\n"
            f"Main theme: {analysis.main_theme}\n"
            f"Key points: {analysis.key_points}\n"
            f"Interconnections: {analysis.interconnections}\n"
            f"Practical applications: {analysis.practical_applications}\n"
            f"Critical insights: {analysis.critical_insights}"
        )

    if result.get("summary_result"):
        actual_output_parts.append(f"SUMMARY:\n{result['summary_result']}")

    if result.get("key_concepts"):
        actual_output_parts.append(
            f"KEY CONCEPTS:\n" + "\n".join(f"- {c}" for c in result["key_concepts"])
        )

    if result.get("generated_questions"):
        actual_output_parts.append(
            f"QUIZ QUESTIONS:\n"
            + "\n".join(f"{i+1}. {q}" for i, q in enumerate(result["generated_questions"]))
        )

    actual_output = "\n\n".join(actual_output_parts)

    # Per-case criteria metric from the CSV evaluation_criteria column
    criteria_metric = GEval(
        name="Criteria Adherence",
        criteria=golden.additional_metadata or (
            "The output should be accurate, grounded, and complete."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.ACTUAL_OUTPUT,
            SingleTurnParams.EXPECTED_OUTPUT,
        ],
        threshold=0.6,
    )

    test_case = LLMTestCase(
        input=golden.input,
        actual_output=actual_output,
        expected_output=golden.expected_output,
    )

    assert_test(test_case, [
        no_hallucination_metric,
        completeness_metric,
        criteria_metric,
    ])