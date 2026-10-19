## 1. The OpenAI key is never sent to the backend

File: `api-key-modal.tsx`

The modal only checks the key format:

```ts
candidate.startsWith("sk-")
```

Then it waits 1.1 seconds and reports success:

```ts
onAccepted();
```

It does **not**:

- Call `/openai/validate-key`
- Call `/openai/set-key`
- Save the key anywhere
- Add the key to a request header

The key is explicitly discarded:

```ts
setKey("");
```

However, the backend quiz endpoint requires:

```http
X-OpenAI-API-Key: <key>
```

Backend location: `auth.py`

### Result

Quiz generation will fail with:

```text
OpenAI API key is required in the X-OpenAI-API-Key header.
```

Usually this becomes HTTP `400`.

---

## 2. `apiConfigured` means only “the user passed local validation”

Files:

- `app-context.tsx`
- `app-shell.tsx`
- `api-key-modal.tsx`

The frontend sets:

```ts
setApiConfigured(true)
```

after a timeout, even if the key is fake, expired, revoked, or invalid.

So the UI can say:

```text
Connection verified
```

while the backend still has no API key.

---

## 3. The Next.js quiz proxy expects the wrong environment variable

File: `route.ts`

The proxy reads:

```ts
const backendUrl = process.env.BACKEND_API_URL;
```

But your frontend `.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

There is no `BACKEND_API_URL` in the environment shown earlier.

### Result

The proxy returns:

```text
Backend API URL is not configured.
```

with HTTP `500`.

The proxy should use the same backend URL configuration consistently, or `BACKEND_API_URL` must be added to `.env.local`.

---

## 4. The proxy does not forward the OpenAI API key

File: `route.ts`

The proxy forwards only:

```ts
headers: {
  Authorization: `Bearer ${token}`,
  Accept: "text/event-stream",
}
```

It does not forward:

```http
X-OpenAI-API-Key
```

Even if the modal retained the key, the backend would never receive it through this route.

---

## 5. Quiz generation starts without checking `apiConfigured`

File: `quiz-progress.tsx`

When the generating page opens, it immediately calls:

```ts
void generateQuiz(noteId);
```

It does not check whether:

- The API key was configured
- The API key is valid
- The user is authenticated
- The selected note exists

Therefore, opening `/quiz/generating/...` directly starts a request without API-key setup.

---

## 6. Clicking “Generate quiz” does not navigate to the generating page

File: `app-context.tsx`

`requestAi()` calls:

```ts
void generateQuiz(noteId);
```

It does not navigate to:

```text
/quiz/generating/{noteId}
```

The generation request may run while the user remains on the notes page. The dedicated progress UI is therefore not automatically displayed.

This affects buttons in:

- `note-detail.tsx`
- `note-row.tsx`
- `dashboard-view.tsx`
- `quiz-results.tsx`

---

## 7. The frontend does not automatically navigate to quiz results after completion

File: `app-context.tsx`

When the `complete` SSE event arrives, the frontend:

- Updates `quizResult`
- Sets `quizStatus` to `"completed"`
- Updates the note in memory

But it does not navigate to:

```text
/quiz
```

or any results page.

The user remains on the current page unless the UI manually navigates elsewhere.

---

## 8. Quiz results are partly hardcoded instead of using generated data

File: `quiz-results.tsx`

The page imports mock data:

```ts
import { keyConcepts, quizQuestions } from "@/data/quiz";
```

But it does not use `keyConcepts` or `quizQuestions` in the displayed output.

It hardcodes:

```tsx
title="Cellular Respiration & Energy"
description="10 practice questions • Biology • Generated just now"
```

It also renders only:

```tsx
selectedNote?.quiz?.map(...)
```

### Result

If the page is refreshed, opened directly, or the selected note is missing, generated quiz data may not appear. The results page is not a reliable representation of the backend-generated result.

---

## 9. Generated quiz data is only stored in React memory after completion

File: `app-context.tsx`

After completion, the frontend updates:

```ts
setNotes(...)
```

This works only for the current React session.

After a refresh, the frontend loads the note again from the backend. The backend stores quiz questions as a JSON string:

```python
db_note.quiz = json.dumps(result["generated_questions"])
```

Backend file: `notes.py`

But the frontend expects:

```ts
quiz: string[] | null;
```

Frontend file: `notes.ts`

### Result

After reloading, `quiz` may be a serialized string instead of an array, so this can fail conceptually:

```tsx
selectedNote?.quiz?.map(...)
```

It may produce a runtime error similar to:

```text
selectedNote.quiz.map is not a function
```

---

## 10. The generated summary fields are rendered incorrectly

File: `quiz-results.tsx`

These fields are arrays:

```ts
critical_insights: string[];
key_points: string[];
practical_applications: string[];
```

But they are rendered directly inside `<p>` elements:

```tsx
<p>{selectedNote?.analysis_result?.critical_insights}</p>
<p>{selectedNote?.analysis_result?.key_points}</p>
<p>{selectedNote?.analysis_result?.practical_applications}</p>
```

React will convert arrays to comma-separated text rather than rendering them as separate points.

---

## 11. Quiz progress can show the wrong note or “Preparing your study quiz”

File: `quiz-progress.tsx`

The page looks up the note using:

```ts
const note = getNote(noteId);
```

But the notes are loaded asynchronously. If the page opens before notes finish loading:

```ts
note === undefined
```

The page displays:

```text
Preparing your study quiz.
```

There is no explicit loading state for the note and no “note not found” handling before generation begins.

---

## 12. Errors from the backend are only displayed after the request starts

File: `app-context.tsx`

The frontend correctly checks `response.ok`, but all configuration errors are discovered only after starting the stream:

```ts
const response = await fetch(...)
```

There is no early validation for:

- Missing backend URL
- Missing OpenAI key
- Missing selected note
- Missing session token

---

# Main quiz-generation failure chain

Currently the flow is effectively:

```text
User enters API key
  → frontend only checks "sk-" format
  → frontend discards the key
  → UI claims key is configured
  → generateQuiz() starts
  → Next.js proxy looks for BACKEND_API_URL
  → BACKEND_API_URL is likely missing
  → HTTP 500
```

If `BACKEND_API_URL` is present, the flow becomes:

```text
generateQuiz()
  → proxy sends Authorization
  → proxy does not send X-OpenAI-API-Key
  → FastAPI rejects the request
  → HTTP 400
```

# Files involved

### Frontend files

- `frontend/src/components/api-key/api-key-modal.tsx`
- `frontend/src/components/layout/app-shell.tsx`
- `frontend/src/context/app-context.tsx`
- `frontend/src/app/api/quiz/stream/[noteId]/route.ts`
- `frontend/src/components/quiz/quiz-progress.tsx`
- `frontend/src/components/quiz/quiz-results.tsx`
- `frontend/src/types/notes.ts`
- `frontend/.env.local`

### Backend contract files affecting the frontend

- `backend/api/router/notes.py`
- `backend/api/utils/auth.py`
- `backend/api/schemas/notes.py`

No files were changed during this inspection.