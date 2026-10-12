"""Request-scoped context helpers.

The app intentionally does not persist user API keys across requests.
Keys must be passed explicitly in the current request and are never stored
in global or process-wide state.
"""

# Intentionally left empty to avoid cross-request key persistence.
# Request-scoped keys are read directly from headers and passed to LLM factories.
