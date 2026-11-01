import pytest
import asyncio
from deepeval import assert_test
from deepeval.integrations.langchain import CallbackHandler
from deepeval.dataset import EvaluationDataset, Golden
from deepeval.metrics import FaithfulnessMetric, TaskCompletionMetric

from agent.workflow import build_workflow
from langchain.chat_models import init_chat_model

llm = init_chat_model("openai:gpt-4o-mini")
graph = build_workflow(llm)

dataset = EvaluationDataset(goldens=[
    Golden(input="Photosynthesis is the process by which plants use sunlight..."),
])

@pytest.mark.parametrize("golden", dataset.goldens)
def test_study_notes_workflow(golden: Golden):
    asyncio.run(graph.ainvoke(
        {
            "note_title": "Study Notes",
            "note_subject": "General",
            "note_content": golden.input,
        },
        config={"callbacks": [CallbackHandler()]},
    ))
    assert_test(golden=golden, metrics=[
        FaithfulnessMetric(threshold=0.7),
        TaskCompletionMetric(threshold=0.7),
    ])