# ⚠️ Backend Flaws & 🔧 Improvement Suggestions

This document records issues identified in the current backend implementation. Critical issues should be addressed before exposing the API beyond a trusted local environment.

## 🔴 Critical Issues

### 1. No authentication or authorization

**Problem:** Notes are retrieved using `user_name`, and the create, update, delete, and quiz routes do not verify the caller's identity or permissions.

**Why it matters:** Anyone who can reach the API may be able to read, modify, delete, or generate a quiz for another user's notes by guessing a username or note ID.

**Potential impact:** Unauthorized disclosure or modification of study notes, deletion of user data, and unauthorized OpenAI usage.

**Recommended improvement:** Add authentication, such as session-based authentication or JWTs, and enforce ownership checks on every note operation. Replace client-supplied identity with the authenticated user's identity where appropriate.

### 2. Database credentials are hardcoded in Docker Compose

**Problem:** `docker-compose.yml` contains a fixed PostgreSQL username, password, and database name.

**Why it matters:** Credentials stored in source control can be copied by anyone with repository access and are difficult to rotate safely.

**Potential impact:** Unauthorized database access, data loss, and credential reuse across environments.

**Recommended improvement:** Read Docker credentials from an ignored `.env` file or deployment secret manager. Use separate credentials for development, staging, and production, and rotate any credentials that have already been exposed.

### 3. `quiz` request fields are accepted but ignored by CRUD operations

**Problem:** `NoteCreate` and `NoteUpdate` include an optional `quiz` field, but `create_note()` does not assign it and `update_note()` does not update it.

**Why it matters:** The API contract suggests that clients can create or update saved quiz data, but the database silently discards those values.

**Potential impact:** Data loss and confusing client behavior when the response does not reflect the submitted request.

**Recommended improvement:** Either remove `quiz` from the CRUD request schemas and make it workflow-managed, or explicitly persist and validate it. Add API tests for both choices.

### 4. Synchronous database work runs inside async endpoints

**Problem:** Several `async` route handlers use a synchronous SQLAlchemy `Session` and synchronous database queries.

**Why it matters:** Blocking database operations can block the FastAPI event loop while requests are waiting for PostgreSQL.

**Potential impact:** Reduced concurrency, slower responses, and request timeouts under load, especially while quiz-generation requests are active.

**Recommended improvement:** Either make database-only route handlers synchronous or migrate consistently to SQLAlchemy's async engine and `AsyncSession`. Do not mix the two approaches without a deliberate boundary.

### 5. AI workflow construction and model loading happen for every quiz request

**Problem:** `quiz_generation()` calls `load_llm()` and builds and compiles the LangGraph workflow for each request.

**Why it matters:** Model and graph setup adds avoidable overhead and makes resource reuse harder.

**Potential impact:** Higher latency and unnecessary initialization work during concurrent quiz requests.

**Recommended improvement:** Initialize reusable model and workflow objects during application startup, while keeping request-specific note data in the workflow state. Add configuration for timeouts and bounded concurrency.

### 6. Quiz-generation failures are not converted into reliable API or SSE errors

**Problem:** The AI workflow is awaited without a route-level timeout or error handling. The streaming generator does not emit a documented error event if a workflow node fails.

**Why it matters:** A provider failure, timeout, or malformed model response can leave clients with an incomplete response and no clear recovery signal.

**Potential impact:** Requests that appear stuck, incomplete UI progress indicators, and difficulty diagnosing failed generations.

**Recommended improvement:** Add timeouts, structured exception handling, safe error responses, and an SSE `error` event. Do not expose provider credentials or sensitive prompt data in error messages.

## 🟡 Important Improvements

### 7. The notes query is executed twice

**Problem:** `read_notes()` first queries for `user_notes` to check whether the user exists, then runs the same filtered query again to retrieve the notes.

**Why it matters:** The second query is unnecessary because the first query already contains the requested notes.

**Potential impact:** Extra database round trips and avoidable latency for every note-list request.

**Recommended improvement:** Execute one query, return the result when it is non-empty, and raise the existing 404 response when it is empty.

### 8. Quiz data is stored as serialized JSON in a string column

**Problem:** Generated questions are serialized with `json.dumps()` into the `quiz` string column.

**Why it matters:** The database cannot easily validate, query, or index individual questions, and column size behavior depends on the database type and schema.

**Potential impact:** Difficult migrations, fragile parsing, and problems as quiz data grows or needs richer structure.

**Recommended improvement:** Use a PostgreSQL JSON/JSONB column for structured quiz data, or create related quiz and question tables if questions need independent metadata, answers, or scoring.

### 9. Timestamps are naive local datetimes

**Problem:** Notes use `datetime.now()` for `created_at` and `updated_at` without timezone information.

**Why it matters:** Local timestamps are ambiguous when the API, database, and users operate in different time zones.

**Potential impact:** Incorrect sorting or display of note dates and difficult incident investigation across environments.

**Recommended improvement:** Store timezone-aware UTC timestamps, use a timezone-aware database column, and serialize them consistently as ISO 8601 values.

### 10. Automated tests are not included

**Problem:** The backend currently has no automated test suite for CRUD routes, migrations, AI responses, or SSE behavior.

**Why it matters:** Changes to schemas, database operations, and the LangGraph workflow can introduce regressions without being detected.

**Potential impact:** Broken API contracts, unnoticed data-loss bugs, and unreliable deployments.

**Recommended improvement:** Add tests for note CRUD behavior, duplicate and missing IDs, request validation, migration setup, mocked AI workflow results, and streaming success and failure events.

### 11. Production deployment configuration is not provided

**Problem:** The documented server command uses `uvicorn --reload`, and Docker Compose starts only PostgreSQL rather than the API service.

**Why it matters:** Auto-reload is intended for development, and the repository does not yet define a repeatable production process for running the backend.

**Potential impact:** Unsafe or inconsistent deployments and manual configuration drift between environments.

**Recommended improvement:** Add a production deployment guide with a process manager or appropriately configured Uvicorn workers, health checks, secret injection, resource limits, and a separate production Docker setup.

### 12. Application-level logging is minimal

**Problem:** The backend does not define structured application logging around requests, database failures, or AI workflow stages. LangSmith tracing is available through environment variables but is optional.

**Why it matters:** Failures in CRUD requests and long-running AI workflows are difficult to diagnose without useful, non-sensitive operational context.

**Potential impact:** Longer incident resolution times and limited visibility into latency, failures, and provider usage.

**Recommended improvement:** Add structured logs with request and note IDs, duration, workflow stage, and error categories. Redact API keys, note content, and other sensitive data, and use LangSmith tracing selectively for AI debugging.
