# Phase 3 — Organize and Refactor the Next.js Frontend

Refactor the existing frontend of my **Study Notes Manager** project into a clean, maintainable, feature-based Next.js App Router structure.

## 1. First inspect the existing codebase

Before modifying anything:

* Inspect the complete `frontend/` directory and its current file structure.
* Identify the Next.js version, React version, TypeScript configuration, styling framework, and package manager.
* Inspect existing pages, layouts, UI components, API functions, authentication logic, schemas, types, and environment variables.
* Identify which components and features are already working.
* Trace the existing login, registration, notes CRUD, quiz generation, profile, OpenAI API key, and backend proxy flows.
* Check whether the project uses NextAuth/Auth.js, custom JWT authentication, or another authentication solution.
* Identify existing route paths and API contracts.

Do not start by generating a completely new frontend. Refactor the current implementation incrementally, reusing existing components and functionality wherever possible.

## 2. Target frontend structure

Organize the code toward the following structure. Adapt it to the existing project where necessary, and avoid creating duplicate files or unnecessary abstractions.

```text
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── notes/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [noteId]/
│   │   │       ├── page.tsx
│   │   │       ├── edit/
│   │   │       │   └── page.tsx
│   │   │       ├── api/
│   │   │       │   └── page.tsx
│   │   │       └── quiz/
│   │   │           └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── register/
│   │   │   └── route.ts
│   │   └── backend/
│   │       └── [...path]/
│   │           └── route.ts
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   ├── notes/
│   ├── quiz/
│   └── ui/
│
├── lib/
│   ├── api/
│   │   ├── axios.ts
│   │   ├── notes.ts
│   │   ├── users.ts
│   │   └── openai.ts
│   └── ...
│
├── schemas/
│   ├── auth.ts
│   ├── note.ts
│   ├── user.ts
│   └── quiz.ts
│
├── utils/
│   └── auth.ts
│
├── types/
│   ├── index.ts
│   └── next-auth.d.ts
│
├── .env.local
└── ...
```

This is the target organization, not a requirement to create every file blindly. Preserve existing files that serve a necessary purpose, and adjust the structure if the current application uses a different valid architecture.

## 3. Route groups and URL structure

Use the `(auth)` and `(app)` route groups to organize pages without adding the group names to browser URLs.

Use one consistent public URL structure:

| Feature                          | URL                              |
| -------------------------------- | -------------------------------- |
| Home                             | `/`                              |
| Login                            | `/login`                         |
| Register                         | `/register`                      |
| Dashboard                        | `/dashboard`                     |
| Notes list                       | `/dashboard/notes`               |
| Create note                      | `/dashboard/notes/create`        |
| View note                        | `/dashboard/notes/[noteId]`      |
| Edit note                        | `/dashboard/notes/[noteId]/edit` |
| Note API-related page, if needed | `/dashboard/notes/[noteId]/api`  |
| Note quiz                        | `/dashboard/notes/[noteId]/quiz` |
| Profile and settings             | `/dashboard/profile`             |

Important:

* Route groups must not appear in URLs.
* Do not accidentally create duplicate routes that resolve to the same URL.
* Move pages into their appropriate route locations and update internal links, redirects, breadcrumbs, and navigation.
* Keep authentication pages outside the protected application layout.
* Use the application layout for shared navigation, sidebar, header, and other authenticated UI.
* Keep the root layout responsible for global styles, fonts, metadata, and shared providers.
* Decide whether the root page should be a landing page or redirect users based on authentication, following the current application's behavior.
* Avoid redirect loops between `/`, `/login`, and `/dashboard`.
* Do not invent a new page for the note `api` route if the existing application does not need a user-facing page there. Inspect its purpose and preserve its intended behavior.

## 4. Layout and component organization

Move reusable UI into appropriate component directories.

### `components/layout/`

Place shared application layout components here, such as:

* Sidebar
* Header or navbar
* Dashboard shell
* Breadcrumbs
* User navigation
* Page container

### `components/notes/`

Place reusable note-related components here, such as:

* Note list and note cards
* Note creation and editing forms
* Note details
* Note content display
* Delete confirmation dialogs

### `components/quiz/`

Place reusable quiz components here, such as:

* Quiz generation controls
* Quiz loading and progress indicators
* Quiz results
* Quiz questions and answers
* SSE progress display and error handling

### `components/ui/`

Keep reusable, generic UI components here, such as buttons, inputs, dialogs, cards, and loading indicators.

Requirements:

* Reuse existing UI components and styles wherever possible.
* Do not redesign the entire UI unless necessary.
* Avoid duplicating components that already exist.
* Keep page files focused on route-level composition and data loading.
* Extract components only when it improves clarity or reuse.
* Follow existing naming conventions and the project's styling framework.
* Preserve responsive layouts and accessibility.
* Use Server Components by default and add `"use client"` only where client-side interactivity, browser APIs, or React state requires it.

## 5. API client organization

Organize backend communication under `lib/api/`.

### `lib/api/axios.ts`

Centralize the Axios instance or existing HTTP client.

* Use the existing backend URL configuration.
* Centralize common headers and appropriate error handling.
* Integrate with the existing JWT authentication mechanism.
* Avoid duplicating authentication logic across API modules.
* Never hardcode production URLs.
* Do not log authorization headers or API keys.
* Do not automatically retry non-idempotent requests without an appropriate reason.
* Preserve existing request and response behavior.

### `lib/api/notes.ts`

Centralize note-related operations, including the existing:

* Fetch notes
* Fetch one note
* Create note
* Update note
* Delete note
* Generate quiz
* Fetch or save quiz results, if currently supported

Use the actual FastAPI endpoints and existing request/response schemas. Do not invent new endpoints or change backend contracts just to fit the frontend structure.

### `lib/api/users.ts`

Centralize existing user-related API calls, including login, registration, profile retrieval, and profile updates where supported.

Preserve the current authentication flow.

### `lib/api/openai.ts`

Centralize OpenAI API key configuration and validation requests.

The application is being designed so users provide their own OpenAI API keys. Follow these rules:

* Never store API keys in a database, `localStorage`, `sessionStorage`, cookies, or other persistent storage.
* Keep the key in frontend memory only.
* Send it in the `X-OpenAI-API-Key` header for requests that need it.
* Continue to use the JWT token for user authentication.
* Implement the existing `/openai/set-key` and `/openai/validate-key` routes according to the backend API contract.
* Do not treat `/openai/set-key` as persistent storage.
* Make the key available to quiz-generation requests without persisting it.
* Clear the key from frontend memory when the user removes it or logs out.
* Never log or display the full key.

If the existing architecture needs a React context or in-memory provider to share the key across pages, implement the smallest appropriate solution without browser-storage persistence.

Preserve the existing SSE streaming implementation when moving quiz-generation code.

## 6. Schemas and TypeScript types

Organize validation schemas under `schemas/` and shared TypeScript types under `types/`.

### `schemas/auth.ts`

Keep or create schemas for existing login and registration forms using the validation library already installed, such as Zod if the project uses it.

### `schemas/note.ts`

Define schemas that reflect the actual FastAPI note request and response models.

### `schemas/user.ts`

Define user-related validation schemas based on the existing backend contracts.

### `schemas/quiz.ts`

Define quiz request, response, question, answer, and result schemas where applicable.

Requirements:

* Reuse existing schemas rather than duplicating them.
* Keep frontend types aligned with backend Pydantic schemas.
* Do not assume fields exist without inspecting the backend.
* Avoid using `any` when a concrete type can be defined.
* Keep shared interfaces and type aliases in appropriate files.
* Do not introduce a second validation library unnecessarily.

## 7. Authentication and authorization

Inspect the current authentication system before making changes.

* Preserve the existing JWT login and registration behavior.
* Preserve NextAuth/Auth.js only if it is already part of the project or intentionally required by its current architecture.
* Do not add a second authentication system unnecessarily.
* If NextAuth is already installed, organize its route handler and session types appropriately.
* Keep `types/next-auth.d.ts` only if NextAuth is actually used.
* Ensure protected dashboard and notes pages require authentication using the existing approach.
* Redirect unauthenticated users appropriately.
* Ensure logging out clears the frontend in-memory OpenAI key.
* Do not expose password hashes, access tokens, or other secrets in client-visible responses.
* Keep backend authorization checks intact; frontend route protection alone is not sufficient.
* Avoid storing JWTs in insecure persistent storage if the existing authentication architecture can safely avoid it. Do not change the authentication token strategy without understanding its impact.

## 8. Next.js Route Handlers and backend proxy

Inspect the existing API proxy implementation before moving it.

If the application already uses a catch-all proxy, organize it under:

`app/api/backend/[...path]/route.ts`

Preserve its existing purpose and supported HTTP methods.

Requirements:

* Forward supported requests to the existing FastAPI backend.
* Preserve query parameters, request bodies, and relevant response headers.
* Support SSE streaming without buffering the complete response.
* Do not convert SSE responses into JSON.
* Preserve appropriate content types and status codes.
* Handle request cancellation and streaming errors where appropriate.
* Avoid forwarding hop-by-hop headers or unsafe client-controlled headers.
* Do not log request bodies, authentication tokens, or OpenAI API keys.
* Ensure the API key header is forwarded only when required.
* Prevent the proxy from becoming an unrestricted open proxy.
* Use the existing backend URL environment variable and validate the configured target.
* Preserve CORS and authentication behavior as appropriate to the existing deployment.

If registration already has a dedicated Next.js route handler, organize it under `app/api/register/route.ts` without duplicating the registration implementation.

Do not create NextAuth route handlers or dependencies if the project does not use NextAuth.

## 9. Environment variables

Inspect the existing environment configuration and update it only when needed.

* Keep `.env.local` for non-secret frontend configuration such as the public API base URL.
* Do not place user-provided OpenAI API keys in `.env.local`.
* Do not expose server-only environment variables through `NEXT_PUBLIC_` prefixes.
* Ensure the frontend uses the correct backend or proxy URL for the current deployment.
* Update `.env.example` or documentation if appropriate, using placeholders rather than actual secrets.
* Never overwrite real environment values with placeholders.
* Do not commit `.env.local`.

## 10. Preserve existing functionality

The refactor must not break:

* Login and registration
* JWT authentication
* Dashboard navigation
* Notes CRUD
* Note detail and editing pages
* Quiz generation
* LangGraph workflow integration
* SSE streaming and progress updates
* OpenAI key entry and validation
* User profile features
* Existing error handling and loading states
* Responsive UI and existing styles

Inspect the current implementation and preserve the behavior of every feature that already works.

Do not modify FastAPI endpoints or database schemas merely to accommodate frontend file organization unless a genuine compatibility issue is found.

## 11. Safe migration process

Implement the refactor in a controlled sequence:

1. Inspect the existing frontend and create a mapping from old files to new locations.
2. Identify route collisions and choose the final URL structure.
3. Move and refactor shared layouts and reusable components.
4. Move route pages and update imports and navigation.
5. Centralize API calls and schemas.
6. Update authentication, profile, and OpenAI key integration.
7. Verify the backend proxy and SSE streaming behavior.
8. Remove obsolete files only after confirming they are no longer referenced.
9. Run the project's available checks and fix regressions.

Avoid replacing the entire frontend with a starter template. Avoid mass deletion or unnecessary dependency upgrades. Keep changes incremental and consistent with the existing project.

## 12. Testing and verification

After the refactor:

* Run the available TypeScript type checks.
* Run ESLint or the project's existing linter.
* Run the production build.
* Run available frontend tests.
* Check that every intended route resolves correctly.
* Verify internal links and redirects.
* Verify authentication protection for dashboard pages.
* Verify note CRUD requests use the correct endpoints.
* Verify OpenAI key validation works without persistence.
* Verify quiz-generation requests still carry the key when required.
* Verify SSE events stream incrementally through the proxy and frontend.
* Check for missing imports, broken relative paths, duplicate routes, and unused files.
* Verify that no OpenAI key or other secret is committed or persisted by the new implementation.

Do not claim that checks passed unless they were actually run successfully. If a check cannot be run, explain why.

## 13. Final report

When finished, provide:

1. A summary of the final directory structure.
2. A list of files created, moved, modified, and deleted.
3. A summary of route changes and the final URL structure.
4. An explanation of how authentication and API calls are organized.
5. Confirmation of how SSE streaming and user-provided OpenAI keys are handled.
6. Tests and build commands executed, with their actual results.
7. Any remaining issues or manual steps.

**Primary objective:** Make the frontend easier to maintain and extend without changing its appearance or breaking existing behavior. Inspect first, reuse existing components, implement the refactor, and verify the results.
