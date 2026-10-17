# Frontend errors

## Frontend TypeScript errors

The current frontend has **9 TypeScript errors**. The production build compiles successfully, but fails at the TypeScript validation stage.

### 1. Incorrect note ID type

- `edit/page.tsx`
  - `TS2322`: A `string` route parameter is passed to `EditNote`, which expects a `number`.

- `note-detail/page.tsx`
  - `TS2322`: The component receives `{ id: string }`, but `NoteDetail` expects `{ note_id: string }`.

### 2. Invalid `NoteResponse.id` property

- `notes-list.tsx`
  - `TS2339`: `id` does not exist on `NoteResponse`.

- `notes-list.tsx`
  - `TS2339`: `id` does not exist on `NoteResponse`.

The correct property is `note_id`, matching both the frontend type and backend schema.

### 3. Invalid `id` fields in mock note data

- `notes.ts`
- `notes.ts`
- `notes.ts`
- `notes.ts`
- `notes.ts`

Each has:

- `TS2353`: `id` is not a valid property of `NoteResponse`.

The correct field is `note_id`.

The tagged `app-context.tsx` currently has no TypeScript diagnostics, but it contains several runtime/API integration problems described below.

---

## Frontend/backend API comparison

### Authentication and users

| Operation | Frontend | Backend | Status |
|---|---|---|---|
| Login | `POST /users/login` with form URL encoding | `POST /users/login` with `OAuth2PasswordRequestForm` | ✅ Correct |
| Get current user | `GET /users/me` with bearer token | `GET /users/me` | ✅ Correct |
| Register | `POST /users/` with `{ user_name, password }` | `POST /users/` | ✅ Correct |
| Update user | `PUT /users/{userId}/` | `PUT /users/{user_id}` | ⚠️ Mostly correct, but trailing slash may cause a redirect |
| Delete user | `DELETE /users/{userId}/` | `DELETE /users/{user_id}` | ⚠️ Mostly correct, but trailing slash may cause a redirect |

The user response shape is consistent:

```ts
{
  user_id: number;
  user_name: string;
}
```

### Notes API

The frontend note endpoints do **not** match the backend.

| Operation | Frontend request | Backend route | Status |
|---|---|---|---|
| Create note | `POST /notes/` | `POST /notes/create_note` | ❌ Wrong endpoint |
| Update note | `PUT /notes/{note_id}/` | `PATCH /notes/update_note/{note_id}` | ❌ Wrong method and endpoint |
| Delete note | `DELETE /notes/{note_id}/` | `DELETE /notes/delete_note/{note_id}` | ❌ Wrong endpoint |
| Read notes | No request is made | `GET /notes/{user_id}` | ❌ Missing frontend request |
| Get all usernames | No frontend request | `GET /notes/get_all_names` | Not used |
| Generate quiz | No actual request | `POST /notes/quiz_generation/{note_id}` | ❌ Missing frontend request |

These incorrect calls are in `app-context.tsx`:

- Create request around line 130
- Update request around line 137
- Delete request around line 154

### Critical notes-state issue

The frontend never loads notes from the backend.

The context initializes:

```ts
const [notes, setNotes] = useState<NoteResponse[]>([]);
```

but there is no `GET /notes/{user_id}` request after authentication. Therefore:

- Existing backend notes will not appear after login.
- The notes list remains empty after page refresh.
- `getNote()` cannot find notes loaded from the server.
- Edit/detail pages can show “note not found”.
- The dashboard will not display persisted notes.

### Note lookup logic is incorrect

In `app-context.tsx`, the context defines:

```ts
getNote: (user_id: number) => NoteResponse | undefined
```

and searches by `user_id`.

However, the UI calls it with a note ID:

- `note-detail.tsx`
- `edit-note.tsx`

This means note lookup is logically incorrect even after notes are loaded.

### Note response shape

The backend returns:

```json
{
  "user_id": 1,
  "note_id": "BIO-204-08",
  "title": "...",
  "subject": "...",
  "content": "...",
  "analysis_result": null,
  "summary_result": null,
  "key_concepts": null,
  "quiz": null,
  "created_at": "...",
  "updated_at": "..."
}
```

This matches `types/notes.ts`.

The frontend errors using `id` are therefore incorrect; both frontend and backend use `note_id`.

---

## OpenAI/API-key integration problems

### API-key modal does not call the backend

`api-key-modal.tsx` only performs local validation and uses a timeout:

```ts
window.setTimeout(...)
```

It never calls either backend endpoint:

- `POST /openai/set-key`
- `GET /openai/validate-key`

Therefore the key is never verified by the backend or OpenAI.

### `requestAi()` does not call the quiz endpoint

In `app-context.tsx`, `requestAi()` only logs:

```ts
console.log(`Requesting AI for note ID: ${noteId}`);
```

It does not call:

```text
POST /notes/quiz_generation/{note_id}
```

Consequences:

- Quiz generation never starts.
- No SSE stream is consumed.
- No generated questions are saved or displayed.
- The backend’s `X-OpenAI-API-Key` requirement is never handled.

### API key header is not wired

The backend expects the OpenAI key in:

```text
X-OpenAI-API-Key
```

The frontend does not send this header to either `/openai/validate-key` or `/notes/quiz_generation/{note_id}`.

---

## Backend issues affecting frontend integration

- The backend’s `NoteUpdate` schema requires `title`, `subject`, and `content`, which is compatible with the intended edit form.
- The backend update route is `PATCH`, while the frontend currently sends `PUT`.
- The backend quiz response is streamed as Server-Sent Events, but the frontend has no SSE handling.
- The backend stores quiz questions as a JSON string in the `quiz` field:
  - `notes.py`
- The schema types `quiz` as `string | null`, but its example shows an array. The actual stored/returned value is currently a serialized string, not a `string[]`.
- Backend Python source files passed AST parsing successfully.
- No backend runtime API test was executed because the server was not running.

## Overall result

- **Frontend TypeScript:** 9 errors.
- **Frontend production build:** JavaScript compilation succeeds, TypeScript validation fails.
- **User APIs:** Mostly compatible.
- **Notes APIs:** Not compatible; create, update, delete, and read integration are broken.
- **Quiz generation:** Not connected.
- **OpenAI key verification:** Not connected.
- **Backend Python syntax:** Valid.