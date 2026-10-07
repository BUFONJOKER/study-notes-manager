from langchain_openai import ChatOpenAI
from api.utils.context import openai_key_context

def load_llm(api_key: str | None = None)-> ChatOpenAI:
    """
    Load the LLM with an API key in priority order:
    1. Directly passed api_key (from route or lifespan)
    2. ContextVar key (user provided via POST /openai/set-key)
    3. Raises error if no key found
    """
    # Priority 1: Directly passed key
    resolved_key = api_key

    # Priority 2: ContextVar key (user provided this request)
    if not resolved_key:
        resolved_key = openai_key_context.get()

    # No key found
    if not resolved_key:
        raise ValueError(
            "No OpenAI API key provided. "
            "Set OPENAI_API_KEY in .env or provide via POST /openai/set-key"
        )
    return ChatOpenAI(
        model="gpt-5-nano",
        temperature=0,
        api_key=api_key,
    )
