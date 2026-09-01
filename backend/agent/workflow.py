from langgraph.graph import START, END, StateGraph
from agent.schemas.main import AgentState
from agent.model.llm import load_llm
from agent.nodes.key_concepts_node import key_concepts
from agent.nodes.summary_node import summary
from agent.nodes.analyze_node import analyze
from agent.nodes.quiz_generation_node import quiz_generation
from functools import partial


def build_workflow(llm):
    """
    Build the workflow graph for the agent.

    Returns:
        Graph: The constructed workflow graph.
    """
    # Create a new graph
    graph = StateGraph(AgentState)

    # Define the workflow nodes
    graph.add_node('analyze', partial(analyze, llm=llm))
    graph.add_node('summary', partial(summary, llm=llm))
    graph.add_node('key_concepts', partial(key_concepts, llm=llm))
    graph.add_node('quiz_generation', partial(quiz_generation, llm=llm))

    # Define the workflow edges
    graph.add_edge(START, 'analyze')
    graph.add_edge('analyze', 'summary')
    graph.add_edge('summary', 'key_concepts')
    graph.add_edge('key_concepts', 'quiz_generation')
    graph.add_edge('quiz_generation', END)

    return graph
