from contextvars import ContextVar

openai_key_context: ContextVar[str | None] = ContextVar("openai_key_context", default=None)