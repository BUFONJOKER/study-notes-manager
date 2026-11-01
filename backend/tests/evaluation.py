import asyncio
from functools import partial
from langchain.chat_models import init_chat_model
from deepeval.integrations.langchain import CallbackHandler
from deepeval.dataset import EvaluationDataset, Golden
from deepeval.metrics import (
    FaithfulnessMetric,
    TaskCompletionMetric,
    GEval,
)
from deepeval.test_case import SingleTurnParams

from agent.workflow import build_workflow  # your workflow

# 1. Build your graph
llm = init_chat_model("openai:gpt-4o-mini")
graph = build_workflow(llm)

# 2. Define your test inputs as Goldens
dataset = EvaluationDataset(goldens=[
    Golden(input="Photosynthesis is the process by which plants use sunlight, water, and CO2 to produce oxygen and energy in the form of sugar."),
    Golden(input="Newton's three laws of motion describe the relationship between a body and the forces acting upon it."),
])

# 3. Define metrics
faithfulness_metric = FaithfulnessMetric(threshold=0.7)
task_completion_metric = TaskCompletionMetric(threshold=0.7)

# 4. Run async evaluation
async def run_graph(golden: Golden):
    return await graph.ainvoke(
        {
            "note_title": "Study Notes",
            "note_subject": "General",
            "note_content": golden.input,
        },
        config={"callbacks": [CallbackHandler()]},
    )

async def main():
    for golden in dataset.evals_iterator(
        metrics=[faithfulness_metric, task_completion_metric]
    ):
        task = asyncio.create_task(run_graph(golden))
        dataset.evaluate(task)

asyncio.run(main())