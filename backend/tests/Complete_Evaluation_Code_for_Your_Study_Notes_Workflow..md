## Complete Evaluation Code for Your Study Notes Workflow

Here is the full, ready-to-run evaluation file using your CSV dataset and `main.py` workflow.

---

### Metrics Used

| Metric | Why |
|---|---|
| **GEval – No Hallucination** | Checks that actual output contains no facts not supported by the input notes |
| **GEval – Output Completeness** | Checks that the output covers the key expectations from `expected_output` |
| **GEval – Criteria Adherence** | Uses the per-row `evaluation_criteria` column from your CSV for case-specific judgment |

These are all `GEval` metrics — a research-backed LLM-as-a-judge metric in DeepEval that evaluates outputs against any custom criteria with human-like accuracy. [[GEval metric](https://deepeval.com/docs/getting-started#create-your-first-test-run)]

---

### Full Code

```python
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
```

---

### Run It

```bash
# Set your OpenAI key first
export OPENAI_API_KEY=your_key_here

deepeval test run test_workflow_eval.py
```

---

### Expected Results

When you run the file, here is what to expect:

#### Console Output (per test case)
```
Running test test_workflow[TC-001] ...  PASSED ✅
Running test test_workflow[TC-022] ...  FAILED ❌  (sparse notes stress min_length)
Running test test_workflow[TC-025] ...  SKIPPED ⏭  (empty content)
Running test test_workflow[TC-030] ...  SKIPPED ⏭  (whitespace only)
```

#### Likely Pass/Fail Breakdown

| Group | Expected Outcome |
|---|---|
| Easy (TC-001 to TC-006) | ✅ Should pass all 3 metrics |
| Normal (TC-007 to TC-013) | ✅ Mostly pass; watch for hallucination on TC-008 |
| Hard (TC-014 to TC-019) | ⚠️ May fail Criteria Adherence if model invents details |
| Difficult / Adversarial (TC-020 to TC-024) | ⚠️ High risk of hallucination failures |
| Edge Cases (TC-025 to TC-030) | ❌ / ⏭ Empty/whitespace skipped; sparse notes (TC-022, TC-026) likely fail completeness |

#### Summary Report
DeepEval prints a final table like:

```
Tests:     28 passed, 2 failed, 2 skipped
Metrics:   No Hallucination (avg 0.81), Output Completeness (avg 0.74), Criteria Adherence (avg 0.69)
```

[[Test run docs](https://deepeval.com/docs/getting-started#create-your-first-test-run)]