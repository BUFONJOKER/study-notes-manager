## Current validation results

### Frontend

`pnpm --dir frontend exec tsc --noEmit --incremental false` currently reports **10 TypeScript errors**.

#### Route/component prop mismatches

- `edit/page.tsx`
  - `EditNote` expects a `note_id` prop, but the page passes `id`.

- `note/page.tsx`
  - `NoteDetail` expects `note_id`, but the page passes `id`.

#### Invalid `NoteResponse.id` usage

- `notes-list.tsx`
- `notes-list.tsx`

Both use `note.id`, but the type and backend use `note.note_id`.

#### Incorrect mock note shape

- `data/notes.ts`
- `data/notes.ts`
- `data/notes.ts`
- `data/notes.ts`
- `data/notes.ts`

The mock data uses fields such as:

```ts
id
updated
created
tone
hasQuiz
```

Those fields are not part of `NoteResponse`. The backend response uses:

```ts
note_id
created_at
updated_at
analysis_result
summary_result
key_concepts
quiz
```

#### Incorrect quiz component export

- `generating/page.tsx`

It imports:

```ts
import { QuizProgress } from "@/components/quiz/quiz-progress";
```

But `quiz-progress.tsx` exports:

```ts
export default function QuizProgress()
```

This causes:

```text
TS2614: Module has no exported member 'QuizProgress'
```

The frontend JavaScript compilation succeeds, but the production build fails during TypeScript validation because of these errors.

---

## Backend validation

### Python syntax

All backend Python files pass AST parsing:

```text
Backend Python AST parse: OK
```

### Backend startup/import failure

Importing the backend application currently fails when required environment variables are absent.

`config.py` requires:

- `DATABASE_URL`
- `LANGSMITH_TRACING`
- `LANGSMITH_ENDPOINT`
- `LANGSMITH_API_KEY`
- `LANGSMITH_PROJECT`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

The import fails with eight Pydantic `ValidationError` entries when those variables are not available.

`OPENAI_API_KEY` is optional in the settings model, but the other listed settings are mandatory.

---

## API integration errors

### Notes API

The current frontend note routes are now mostly aligned:

| Operation | Frontend | Backend | Result |
|---|---|---|---|
| Load notes | `GET /notes/{user_id}` | `GET /notes/{user_id}` | ✅ |
| Create note | `POST /notes/create_note` | `POST /notes/create_note` | ✅ |
| Update note | `PATCH /notes/update_note/{note_id}` | `PATCH /notes/update_note/{note_id}` | ✅ |
| Delete note | `DELETE /notes/delete_note/{note_id}` | `DELETE /notes/delete_note/{note_id}` | ✅ |

The main remaining issue is the TypeScript/UI mismatch between `id` and `note_id`.

### Quiz streaming route is incorrect

The Next.js proxy at `quiz stream route` forwards to:

```text
{BACKEND_API_URL}/quiz_generation/{noteId}
```

But the backend route is mounted under the `/notes` router:

```text
POST /notes/quiz_generation/{note_id}
```

Therefore the proxy should reach:

```text
{BACKEND_API_URL}/notes/quiz_generation/{noteId}
```

The current proxy will normally receive a backend `404`.

### OpenAI header is not forwarded

The backend requires the user key through:

```text
X-OpenAI-API-Key
```

The Next.js quiz proxy forwards only:

```text
Authorization
Accept
```

It does not forward `X-OpenAI-API-Key`.

Consequences:

- In production, quiz generation fails with `400: OpenAI API key is required`.
- In development, it only works if `OPENAI_API_KEY` is configured in the backend environment.
- The user-entered browser key is never used by the backend.

### API key modal performs fake validation

`api-key-modal.tsx` only:

1. Checks whether the key starts with `sk-`.
2. Checks its length.
3. Waits 1.1 seconds.
4. Marks the key as accepted locally.

It does not call:

```text
POST /openai/set-key
GET /openai/validate-key
```

The message “Connection verified” is therefore not currently proof that OpenAI accepted the key.

### API key is discarded before it can be used

The modal clears the key:

```ts
setKey("");
```

but does not save it in context, session storage, a server session, or an HTTP header. As a result, quiz generation has no access to the key.

### `apiConfigured` is only local UI state

`apiConfigured` is set from the modal callbacks and resets when the page/session state resets. It is not connected to backend validation and is not persisted.

---

## Where the OpenAI API key is used

### 1. Backend environment configuration

`config.py` defines:

```python
OPENAI_API_KEY: str | None = None
```

This loads the optional `OPENAI_API_KEY` environment variable.

### 2. Request key extraction

`auth.py` defines `get_openai_key()`.

It checks the following in order:

1. `X-OpenAI-API-Key` request header.
2. `OPENAI_API_KEY` from backend settings, but only when:

```python
settings.APP_ENV != "production"
```

3. Otherwise it returns HTTP 400.

The reusable dependency is:

```python
OpenAIKeyDep = Annotated[str, Depends(get_openai_key)]
```

### 3. OpenAI key validation

`openai.py` uses the key in:

```python
client = OpenAI(api_key=api_key)
client.models.list()
```

This is exposed through:

```text
GET /openai/validate-key
```

It checks whether the key can authenticate with OpenAI.

### 4. `set-key` endpoint

`openai.py` accepts:

```text
POST /openai/set-key
```

It only:

- Trims the key.
- Checks that it is non-empty.
- Checks that it starts with `sk-`.
- Returns a success message.

It does **not** store the key, validate it against OpenAI, or make it available to later requests.

### 5. Quiz generation

`notes.py` receives `OpenAIKeyDep` for:

```text
POST /notes/quiz_generation/{note_id}
```

Then it passes the key to:

`llm.py`

```python
load_llm(api_key)
```

That creates:

```python
ChatOpenAI(
    model="gpt-5-nano",
    temperature=0,
    api_key=api_key.strip(),
)
```

The key is then used by the LangGraph workflow for:

- Note analysis
- Summary generation
- Key concept extraction
- Quiz question generation

The workflow is built in `workflow.py`.

---

## Current OpenAI key flow

### Intended flow

```text
User enters key
  → frontend validates it
  → frontend sends X-OpenAI-API-Key
  → backend get_openai_key()
  → OpenAIKeyDep
  → ChatOpenAI
  → LangGraph workflow
  → streamed quiz result
```

### Actual flow

```text
User enters key
  → frontend performs local format check
  → frontend discards key
  → apiConfigured becomes true
  → quiz request starts without X-OpenAI-API-Key
  → proxy also uses the wrong backend URL
  → quiz generation fails
```

---

## Main verified problems

1. **10 frontend TypeScript errors.**
2. **Backend import fails without eight required environment variables.**
3. **Quiz proxy omits the `/notes` route prefix.**
4. **Quiz proxy does not forward `X-OpenAI-API-Key`.**
5. **API-key modal never calls the backend.**
6. **API-key modal reports success without OpenAI validation.**
7. **The entered key is discarded and unavailable to quiz generation.**
8. **`/openai/set-key` does not store or validate the key.**
9. **`apiConfigured` is only a local UI flag and does not represent real backend configuration.**
10. **Frontend and backend use different mock/production note shapes in several files.**
11. **The backend itself is syntactically valid, but cannot start without the required environment configuration.**

No files were edited during this audit.