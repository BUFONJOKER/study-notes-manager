from langchain_openai import ChatOpenAI


def load_llm(api_key: str | None = None) -> ChatOpenAI:
    """Create a request-scoped ChatOpenAI client for the supplied API key."""
    if not api_key or not api_key.strip():
        raise ValueError("A valid OpenAI API key is required.")

    return ChatOpenAI(
        model="gpt-5-nano",
        temperature=0,
        api_key=api_key.strip(),
    )
