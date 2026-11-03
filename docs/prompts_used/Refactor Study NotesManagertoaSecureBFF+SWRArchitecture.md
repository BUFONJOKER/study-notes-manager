# Task: Refactor Study Notes Manager to a Secure BFF + SWR Architecture

Act as a senior full-stack engineer specializing in Next.js 16, React, TypeScript, NextAuth v4, FastAPI, Axios, and SWR.

I want to refactor my existing Study Notes Manager application into a secure, maintainable, production-quality architecture.

## CRITICAL INSTRUCTION: ANALYSIS ONLY — DO NOT MODIFY FILES

**Do not edit, create, delete, rename, move, or overwrite ANY files during this task.**

Do not execute commands or automated operations that modify project files.

Your task in this phase is strictly to:

1. Inspect the existing project structure and relevant source files.
2. Understand the current authentication, API, data-fetching, state-management, and SSE implementations.
3. Identify architectural problems and potential breaking changes.
4. Explain exactly what needs to change and why.
5. Propose the new architecture and implementation plan.
6. Show the proposed code changes with complete code examples where necessary.
7. Identify every affected file and explain its responsibilities before and after refactoring.

Wait for my explicit approval before implementing anything.

Do not assume that the existing implementation matches a generic Next.js template. Inspect the actual code first.

---

# 1. Target Architecture

I want to implement the following architecture:

Browser (Next.js Client)
    |
    | Same-origin HTTP requests
    v
Next.js BFF (Route Handlers)
    |
    | Server-side authentication
    | Authorization: Bearer <FastAPI access token>
    v
FastAPI Backend
    |
    v
Database

Authentication:
- NextAuth v4 manages user authentication.
- FastAPI access tokens must remain server-side.
- Store the FastAPI access token in the encrypted NextAuth JWT cookie.
- Never expose the FastAPI access token through the client-side NextAuth session.
- Never expose the FastAPI token through React state, browser storage, JavaScript responses, or frontend API requests.

BFF:
- Next.js Route Handlers act as the Backend-for-Frontend.
- Browser requests must go through Next.js instead of directly accessing FastAPI.
- Next.js retrieves the authenticated JWT using getToken() from next-auth/jwt.
- Next.js attaches the FastAPI access token to requests sent to FastAPI.
- Implement centralized authentication and authorization checks.
- Support GET, POST, PUT, PATCH, and DELETE.
- Preserve query parameters, request bodies, appropriate headers, and upstream response status codes.
- Prevent open-proxy behavior by restricting forwarded paths and methods.
- Validate request origins for state-changing requests.
- Do not forward unnecessary cookies, headers, or credentials.
- Do not expose backend secrets or internal errors to the browser.

Axios:
- Axios must communicate only with same-origin Next.js BFF endpoints.
- Remove client-side getSession() calls from Axios interceptors.
- Remove browser-side Authorization header handling.
- Do not require every API function to manually pass authentication headers.
- Keep centralized error handling, including HTTP 401 handling and the existing app:session-expired event.
- Handle network failures and backend errors consistently.

SWR:
- SWR becomes the source of truth for server/database state.
- Use SWR for notes, user profile, and other database-backed resources.
- Configure global SWR defaults for revalidation, caching, retries, and deduplication.
- Use revalidateOnFocus and revalidateOnReconnect.
- Use a reasonable polling interval where appropriate.
- Ensure authenticated requests are disabled until the user is authenticated.
- Prevent data from one user being displayed after logout or account switching.
- Use SWR cache keys that account for authenticated user identity where necessary.
- Avoid unnecessary duplicate requests.

CRUD:
- Use useSWRMutation for create, update, and delete operations where appropriate.
- Keep mutation logic close to the resource hooks instead of putting every database mutation in AppContext.
- Use mutate to update or revalidate cached data after successful mutations.
- Prefer optimistic updates where safe and provide rollback on errors.
- Keep server responses as the source of truth.
- Ensure notes, profile, and other affected resources stay synchronized.

AppContext:
- KEEP the existing AppContext.
- Do not remove it or replace the entire application state architecture.
- Refactor it into a UI/workflow context rather than a database-state manager.
- Remove database-backed notes and profile state from AppContext once their SWR replacements are implemented.
- Keep application-specific state such as:
  - Quiz generation status.
  - Quiz progress and workflow events.
  - Quiz errors and temporary results.
  - SSE AbortController management.
  - OpenAI API-key modal state.
  - Temporary OpenAI key state.
  - Delete confirmation UI state, if still needed.
  - Global action-error state.
  - UI-related actions.
- Keep logout functionality.
- Avoid duplicating state between AppContext and SWR.
- Maintain existing public component APIs where practical, and identify components that need updates.

---

# 2. NextAuth v4 Refactoring

Inspect my existing NextAuth CredentialsProvider and authOptions.

Requirements:

1. Preserve the existing FastAPI login process.
2. Store the FastAPI access token in the encrypted JWT.
3. Do not return accessToken from the client-side session callback.
4. Keep only safe user information in the client-side session.
5. Make the token available to server-side BFF Route Handlers using getToken().
6. Preserve session expiration behavior.
7. Ensure FastAPI token expiration and NextAuth session expiration are handled correctly.
8. Preserve the existing login and logout redirect behavior.
9. Add or update TypeScript module augmentation for NextAuth JWT, User, and Session types as required.
10. Never expose the FastAPI access token through useSession().

Explain how the browser's HttpOnly session cookie authenticates requests to the Next.js BFF.

Also explain any limitations of keeping a FastAPI token inside a NextAuth JWT when the FastAPI token expires earlier than the NextAuth cookie.

Do not claim that removing accessToken from the session automatically solves token expiration.

---

# 3. Next.js BFF Implementation

Propose a centralized BFF route:

src/app/api/backend/[...path]/route.ts

Inspect my existing Next.js version and use the correct Route Handler typing.

Requirements:

- Use getToken() from next-auth/jwt.
- Read the token only on the server.
- Validate the incoming route path.
- Restrict forwarded HTTP methods.
- Preserve query parameters.
- Forward request bodies safely.
- Forward only necessary content headers.
- Attach the FastAPI Bearer token server-side.
- Forward appropriate upstream response headers.
- Preserve upstream HTTP status codes.
- Use cache: "no-store" for authenticated API calls.
- Prevent open redirects and open-proxy vulnerabilities.
- Validate Origin for state-changing requests.
- Handle missing authentication with HTTP 401.
- Handle backend failures without exposing internal details.
- Handle 204 No Content responses correctly.
- Consider request size limits.
- Avoid buffering large responses unnecessarily.

Support public endpoints through an explicit allowlist.

Currently, user registration is public:
POST /users/

Do not accidentally require authentication for registration.

Login must continue to happen through the NextAuth CredentialsProvider, which communicates with FastAPI server-side.

Explain whether one catch-all BFF route is sufficient or whether certain routes should have dedicated Route Handlers.

---

# 4. Axios Refactoring

Inspect the existing src/lib/api.ts.

Refactor it to:

- Use /api/backend as its base URL.
- Remove getSession() from request interceptors.
- Remove client-side Bearer token injection.
- Preserve the existing 401 session-expired event behavior.
- Preserve centralized Axios error handling.
- Handle network errors.
- Avoid infinite 401 event dispatches.
- Work correctly with same-origin HttpOnly cookies.

All normal frontend API requests should use this Axios instance.

Example:

api.get("/notes/read_note");

The browser must never send a FastAPI access token.

---

# 5. SWR Resource Architecture

Inspect all existing database-backed API calls and identify the appropriate SWR resources.

At minimum:

- Notes.
- Individual note details where necessary.
- User profile.
- Other persistent database-backed resources.

Propose a clean structure, for example:

src/
  lib/
    api.ts
    swr-config.ts

  hooks/
    notes/
      use-notes.ts
      use-note.ts
      use-create-note.ts
      use-update-note.ts
      use-delete-note.ts

    users/
      use-profile.ts
      use-update-profile.ts

Adjust this structure if the existing project conventions suggest a better approach.

Requirements:

- Create centralized SWR configuration.
- Create typed resource fetchers.
- Use stable cache keys.
- Ensure user-specific cache isolation.
- Avoid fetching while NextAuth is loading or unauthenticated.
- Revalidate when users revisit the application.
- Support periodic refresh where appropriate.
- Use useSWRMutation for CRUD.
- Use mutate for optimistic updates and revalidation.
- Avoid unnecessary manual React state for database responses.

Explain the difference between SWR cache freshness and true real-time synchronization.

Do not introduce WebSockets unless there is a clear requirement.

---

# 6. AppContext Refactoring

Inspect my complete app-context.tsx.

I specifically want to retain AppContext.

Do not turn AppContext into another API data-fetching layer.

Move responsibilities as follows:

Database/server state:
- Notes -> SWR.
- Profile -> SWR.
- Persistent resources -> SWR.
- CRUD -> Resource-specific hooks using useSWRMutation.

UI/workflow state:
- Quiz generation status.
- Quiz progress.
- Quiz errors.
- Quiz result where temporarily needed.
- SSE cancellation.
- AbortController references.
- OpenAI modal state.
- Temporary OpenAI API key.
- Global action errors.
- Delete confirmation UI state.
- Logout and application workflow actions.

Requirements:

- Preserve existing application functionality.
- Preserve existing component behavior.
- Update AppContext types.
- Remove obsolete state and functions only after their replacements exist.
- Do not duplicate SWR data inside AppContext.
- Avoid unnecessary context re-renders.
- Preserve existing error handling conventions.

Explain which existing consumers of useApp() will need to change.

---

# 7. SSE Quiz Generation

My application already implements quiz generation using Server-Sent Events.

Inspect the existing SSE implementation carefully.

Requirements:

- Keep SSE functionality.
- Keep streaming workflow progress.
- Preserve workflow_update, complete, and error events.
- Preserve AbortController cancellation.
- Preserve existing quiz UI behavior.
- Never send the FastAPI access token from browser JavaScript.
- Authenticate the SSE request inside a Next.js server Route Handler.
- Forward the FastAPI token server-side.
- Forward the OpenAI key only when required.
- Stream the upstream response directly to the browser.
- Avoid buffering the complete SSE response.
- Do not apply ordinary short API request timeouts to long-running streams.
- Handle client disconnection and upstream cancellation.
- Handle expired FastAPI tokens consistently.

Explain how to preserve the existing SSE event parser and workflow state.

---

# 8. Error Handling and Session Expiration

Preserve the existing application-wide error handling.

Requirements:

- BFF returns appropriate HTTP status codes.
- Axios centralizes HTTP error handling.
- HTTP 401 triggers the existing app:session-expired event.
- Login failures must not trigger global logout.
- Expired sessions redirect to /login.
- Avoid multiple simultaneous signOut calls.
- Clear user-specific SWR cache when logging out or changing accounts.
- Avoid displaying previous user's cached notes or profile.
- Preserve existing global error banner behavior.

Also explain how FastAPI token expiration should invalidate or refresh the NextAuth JWT session.

Do not assume that the FastAPI token automatically refreshes.

---

# 9. Environment Variables and Deployment

Inspect the existing environment configuration.

Requirements:

- Keep FASTAPI_BASE_URL server-only.
- Never expose private backend URLs through NEXT_PUBLIC variables.
- Preserve NEXTAUTH_SECRET.
- Explain local development configuration.
- Explain production deployment configuration.
- Consider Docker networking when Next.js and FastAPI run in separate containers.
- Ensure BFF requests reach the correct backend hostname.

Do not modify environment files.

---

# 10. Security Review

Perform a security review of the proposed architecture.

Pay particular attention to:

- HttpOnly cookies.
- Secure cookies in production.
- SameSite cookie settings.
- CSRF protection and Origin validation.
- JWT encryption and NEXTAUTH_SECRET.
- Access-token exposure.
- Open-proxy prevention.
- Request body size limits.
- Sensitive response headers.
- Redirect handling.
- Server-side environment variables.
- Session expiration.
- User-specific SWR cache isolation.
- OpenAI API-key handling.

Remember: an HttpOnly cookie protects against JavaScript reading the cookie, but does not independently eliminate CSRF or XSS risks.

---

# 11. Required Analysis-Only Deliverables

Before implementing anything, provide the following report.

## A. Existing Architecture Audit

Explain how my current application works, based on the actual source code.

Identify:
- Current authentication flow.
- Current API request flow.
- Current data-fetching approach.
- Current AppContext responsibilities.
- Current SWR usage.
- Current SSE flow.
- Current error handling.

## B. Problems and Reasons for Change

For every identified issue, explain:

1. What the current code does.
2. Why it is problematic.
3. What the recommended approach is.
4. What benefits the change provides.

## C. Proposed Architecture

Provide a clear architecture diagram showing Browser, NextAuth, BFF, Axios, SWR, FastAPI, and Database.

## D. File-by-File Change Plan

Create a table containing:

| File | Action | Why | Proposed Changes |
|------|--------|-----|------------------|

Include every affected file.

Distinguish between:
- Files to modify.
- Files to create.
- Files that should remain unchanged.
- Files that may become obsolete.

## E. Implementation Sequence

Break the implementation into small, safe phases.

For each phase, explain:
- Files involved.
- Changes required.
- Dependencies.
- Expected result.
- Testing procedure.
- Potential breaking changes.

## F. Code Examples

Provide proposed code examples for critical files:

- NextAuth configuration.
- NextAuth type augmentation.
- Centralized BFF route.
- Axios API client.
- SWR configuration.
- Notes resource hooks.
- CRUD mutation hooks.
- Refactored AppContext.
- SSE BFF Route Handler.

Code must match my actual existing project structure and dependencies.

Do not invent functions, types, API endpoints, or backend response formats.

## G. Testing Checklist

Provide tests for:

- Login.
- Registration.
- Authenticated API requests.
- Notes CRUD.
- Profile retrieval and updates.
- Session expiration.
- Logout.
- User switching.
- SWR cache isolation.
- SSE streaming.
- SSE cancellation.
- OpenAI API key handling.
- CSRF and unauthorized access.

## H. Final Recommendations

Explain the recommended final architecture and why it is suitable for this project.

---

# FINAL RULE

This is an analysis and planning task only.

**DO NOT MODIFY ANY FILES. DO NOT IMPLEMENT THE REFACTORING.**

Do not use automated code editing, file generation, shell commands that change files, or agent actions that modify the workspace.

Show me exactly what should change, where it should change, why it should change, and how it should be implemented.

After presenting the complete report, STOP and WAIT for my explicit approval before making any changes.