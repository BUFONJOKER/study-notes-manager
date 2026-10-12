# Task: Implement Secure, Non-Persistent OpenAI API Key Management

Analyze my existing **Study Notes Manager** project and implement user-provided OpenAI API key management across the FastAPI backend, LangGraph workflow, and Next.js frontend.

**Important requirement:** I do not want to store users' OpenAI API keys in any database, Redis, localStorage, sessionStorage, cookies, `.env` files, or other persistent storage. Each user must provide their own API key, which should remain in frontend memory and be sent to the backend whenever an OpenAI operation requires it.

Before making changes, inspect the existing project structure, routes, schemas, authentication utilities, LangGraph nodes, LLM initialization code, frontend API utilities, and quiz-generation SSE implementation. Reuse the existing architecture and naming conventions wherever possible.

## 1. Backend: OpenAI API key routes

Implement or update the following routes under `/openai`:

### `POST /openai/set-key`

* Require the existing JWT authentication using `get_current_user`.
* Accept the API key using the existing `OpenAIKeyRequest` schema, or update the schema if necessary.
* Perform basic input and format validation.
* Do not store the API key in a database, Redis, ContextVar intended to persist across requests, environment variable, or any other storage.
* Return a suitable response using `OpenAIKeyResponse`.
* Make the endpoint's behavior clear: it acknowledges receipt but does not save the key for future requests.
* Do not claim that the key has been validated with OpenAI unless an actual validation request has been made.
* Never return the API key in the response.

### `GET /openai/validate-key`

* Require JWT authentication.
* Receive the API key through the `X-OpenAI-API-Key` request header.
* Use FastAPI dependency injection to obtain the key.
* Validate it by making an appropriate request to the official OpenAI API using the existing SDK or add the official `openai` package if necessary.
* Handle invalid authentication, network failures, rate limits, and other OpenAI errors with appropriate HTTP responses.
* Never expose the raw API key, request headers containing it, or sensitive upstream error details.
* Do not store the key after validation.

Keep the existing response schemas where practical. Update them only when necessary.

## 2. Backend: API key dependency

Update the existing `get_openai_key` function in `api/utils/auth.py` or its current equivalent.

* Read the key from the `X-OpenAI-API-Key` request header.
* Return an appropriate HTTP error if the key is missing or empty.
* Define or reuse an `OpenAIKeyDep` type alias using `Annotated` and `Depends`.
* Preserve the existing `get_current_user` authentication behavior.
* Do not rely on a key previously set by `/openai/set-key`.
* Do not use a global mutable variable or a persistent ContextVar as a cross-request key store.

Inspect the current `api/utils/context.py` and all references to `openai_key_context`. Remove obsolete usage if safe, or refactor it only if required by the existing architecture. Do not break unrelated functionality.

## 3. Backend: LangChain and LangGraph integration

Find every location where OpenAI models are initialized, including LLM factories, LangGraph nodes, workflow builders, quiz generation, and any other OpenAI-powered features.

Refactor the code so that the API key is passed explicitly from the authenticated HTTP request into the LLM initialization and workflow execution.

For example, follow this pattern where appropriate:

```python
from langchain_openai import ChatOpenAI

def create_llm(api_key: str) -> ChatOpenAI:
    return ChatOpenAI(
        model="gpt-4o-mini",
        api_key=api_key,
    )
```

Adapt this example to the project's existing model configuration instead of blindly replacing model names or settings.

Requirements:

* Every OpenAI operation must use the key supplied for that specific request.
* Do not accidentally fall back to a globally configured API key or another user's key.
* Avoid creating global LLM clients that permanently capture a user's API key.
* Keep existing model names, prompts, structured output schemas, LangGraph state, checkpoints, and workflow behavior unless a change is necessary.
* Do not place API keys in LangGraph state, checkpoints, workflow events, generated output, or logs.
* If the current workflow nodes create their own LLM clients, update their dependencies appropriately.
* Ensure concurrent requests from different users cannot share or leak API keys.

## 4. Quiz-generation route and SSE streaming

Inspect the existing endpoint, especially:

`POST /notes/quiz_generation/{note_id}`

Update it to receive `OpenAIKeyDep` in addition to its existing database and authentication dependencies.

Requirements:

* Pass the API key explicitly into the LangGraph workflow or its request-scoped LLM factory.
* Preserve the existing SSE implementation, including `StreamingResponse` or `EventSourceResponse`, whichever the project currently uses.
* Preserve existing event names, payload formats, workflow progress updates, completion events, and error events.
* Do not replace streaming with `response.json()` or a normal non-streaming response.
* Handle exceptions raised while the streaming generator or workflow is running.
* Ensure the key remains available to the workflow throughout that request's asynchronous execution without relying on a previous HTTP request.
* Ensure the key is not included in SSE events or error messages.
* Preserve existing note ownership checks and JWT authentication.
* Ensure users can generate quizzes only for notes they are authorized to access.

Inspect other OpenAI-dependent endpoints and update them consistently where appropriate.

## 5. Frontend: API key management UI

Inspect the existing Next.js application and implement an API key management interface that fits its current UI, component structure, styling, and routing conventions.

Provide a Settings or AI Provider section containing:

* A password-style API key input.
* A button to acknowledge or configure the key.
* A button to validate the key.
* Loading states and clear success/error messages.
* A way to clear the key from frontend memory.
* Appropriate input validation and disabled states.

Requirements:

* Store the key only in React component state or an appropriate in-memory state manager already used by the application.
* Do not store it in localStorage, sessionStorage, cookies, IndexedDB, URL parameters, or any persistent browser storage.
* Do not place it in a global store that persists to browser storage.
* Do not expose it in console logs, error messages, analytics, or frontend telemetry.
* Do not hardcode a user's key in source code or environment variables.
* Make it clear that the user must enter the key again after a page refresh if it is no longer held in memory.
* Never display the full key after entry.
* Reuse the project's existing UI components, authentication mechanism, API client, and notification system where available.

If the frontend needs to share the in-memory key across pages, use an appropriate React context or existing in-memory state solution without persistence. Avoid unnecessary architectural rewrites.

## 6. Frontend: API requests

Update the frontend API functions to support the following request sequence:

### Configure key

Send the key in the request body to:

`POST /openai/set-key`

Include the user's existing JWT authentication token.

### Validate key

Send the key in the `X-OpenAI-API-Key` header to:

`GET /openai/validate-key`

Include the user's existing JWT authentication token.

### Generate quiz

Send the same header with the existing request to:

`POST /notes/quiz_generation/{note_id}`

Include the user's existing JWT authentication token and preserve the existing SSE reader and event handling.

Use the existing API base URL configuration. Do not hardcode backend URLs.

If there are multiple API clients or duplicated quiz-generation functions, consolidate or update them appropriately without breaking existing functionality.

## 7. Security requirements

Treat the API key as a secret.

* Never persist API keys in any database, Redis, browser storage, cookies, environment variables, or files.
* Never include keys in logs, traces, exception messages, analytics, or SSE payloads.
* Redact `X-OpenAI-API-Key` from HTTP access logs, reverse-proxy logs, and monitoring systems where configurable.
* Use HTTPS in production.
* Do not return keys from backend endpoints.
* Do not use the key as a user identifier.
* Maintain existing JWT authentication and authorization.
* Do not log entire request objects if they contain API keys.
* Avoid unsafe error handling that exposes upstream OpenAI responses.
* Clear the frontend key when the user explicitly removes it or logs out.
* Do not implement any mechanism to retrieve a previously entered key.

Note: Basic prefix checking is not sufficient to verify that a key is valid. Use an actual OpenAI API request for validation. Also, a valid key does not guarantee that the account has sufficient credits or permission to use a particular model.

## 8. Dependencies and configuration

* Inspect `pyproject.toml` and the existing dependency manager before installing or changing packages.
* Use `uv` if the project already uses it.
* Avoid unnecessary dependency changes.
* Preserve existing `.env` configuration for non-secret application settings, but remove any application-level reliance on a shared OpenAI key if the project is being converted fully to user-provided keys.
* Do not remove unrelated environment variables or break other existing model providers.

## 9. Testing and verification

Add or update tests following the existing testing framework.

Cover at least:

1. Unauthenticated users cannot configure or validate keys.
2. Missing API key headers produce an appropriate error.
3. Empty or malformed keys are handled appropriately.
4. `/openai/set-key` does not persist the submitted key.
5. `/openai/validate-key` makes an actual validation request and handles invalid credentials.
6. Quiz generation receives the current request's key.
7. Two concurrent users with different API keys cannot leak keys across requests.
8. SSE progress, completion, and error events still work as before.
9. API keys never appear in responses, logs, or workflow state.
10. Existing note ownership and authorization checks still work.

Mock OpenAI calls in automated tests; do not require real API credits to run the test suite.

Run the available tests, linting, and type checks where possible. Fix regressions caused by your changes.

## 10. Final deliverables

After implementing the changes:

1. Summarize the files created, modified, and removed.
2. Explain the new end-to-end API key flow.
3. Show the exact frontend request headers and request bodies expected by each route.
4. Explain how the key reaches LangGraph without being persisted.
5. Explain how SSE streaming was preserved.
6. List the tests and checks executed, including any that could not be run.
7. Identify any remaining security limitations or required production configuration.
8. Do not claim a test passed unless you actually ran it successfully.

**Implementation approach:** First inspect the codebase, then make the smallest coherent set of changes across the backend and frontend. Follow existing conventions, preserve unrelated features, and avoid replacing files wholesale when targeted edits are sufficient. Implement the changes rather than merely explaining what should be changed.
