

# A. Existing Architecture Audit

## 1. Authentication

Current flow:

1. `login-form.tsx` calls `signIn("credentials")`.
2. `route.ts` uses `CredentialsProvider`.
3. NextAuth calls FastAPI `/users/login`, receives `access_token`, then calls `/users/me`.
4. The FastAPI token is stored in the NextAuth JWT.
5. The session callback exposes `session.accessToken` and `session.accessTokenExpires`.
6. `app-context.tsx` reads `session.accessToken`.
7. AppContext and the quiz request send `Authorization: Bearer ...` from browser JavaScript.

The authentication boundary is therefore currently:

```text
Browser JavaScript -> FastAPI bearer token
```

This does not satisfy the requested BFF architecture.

The current `proxy.ts`:

- Checks whether a cookie with a known session-cookie name exists.
- Redirects unauthenticated page requests to `/login`.
- Does not cryptographically validate the cookie.
- Does not exclude the BFF or quiz API routes.
- Could return a redirect instead of the required API `401`.

The local environment file contains a `NEXTAUTH_SECRET`. It must not be committed or exposed, and it should be rotated if it has been shared or committed to source control.

## 2. API Requests

`api.ts` currently:

- Uses `NEXT_PUBLIC_API_URL`.
- Sends requests directly to FastAPI.
- Has a `setAuthToken()` function for browser-side bearer-token injection.
- Centralizes 401 event dispatching.
- Excludes only login requests from session-expiration handling.

AppContext also embeds the public API URL into request paths, for example:

```ts
api.get(`${API_BASE_URL}/users/me`, ...)
```

This duplicates authentication and networking logic inside the context.

## 3. AppContext

`app-context.tsx`:

- Loads notes and profile.
- Owns note CRUD.
- Owns profile update/delete.
- Owns registration.
- Owns selected-note state.
- Owns delete-confirmation state.
- Owns OpenAI key state.
- Owns quiz state and SSE parsing.
- Owns logout.
- Owns global action errors.

It is currently both:

```text
UI/workflow context + server/database state manager
```

The file also contains a commented-out notes state declaration while still referencing `notes` and `setNotes`. As shown, the current source appears inconsistent with strict TypeScript compilation and should be corrected during implementation.

## 4. Current SWR Usage

SWR is installed in `package.json`, but no application SWR hooks or global configuration are currently present.

Persistent data is loaded imperatively in AppContext with `useEffect`.

## 5. SSE

Current flow:

1. AppContext calls `/api/quiz/stream/[noteId]`.
2. Browser sends:
   - `X-OpenAI-Key`
   - A browser-side `Authorization` header containing the FastAPI token.
3. `quiz/stream/[noteId]/route.ts` forwards the browser authorization header to FastAPI.
4. The route streams the upstream body to the browser.
5. AppContext parses:
   - `workflow_update`
   - `complete`
   - `error`
6. On completion, AppContext updates local notes state.

Problems:

- The browser sends the FastAPI token.
- The route uses `NEXT_PUBLIC_API_URL`.
- The route forwards client-controlled authorization.
- The frontend sends `X-OpenAI-Key`, while the backend dependency expects `X-OpenAI-API-Key`.
- Error responses include upstream error details.
- The route does not explicitly handle client disconnect cancellation.
- The current `finally` cleanup is good and should be preserved.

## 6. Error Handling

Current error handling includes:

- Axios response interceptor dispatching `app:session-expired`.
- `session-expired-alert.tsx` delaying `signOut()`.
- `session-expiry-handler.tsx` scheduling expiration based on the FastAPI token expiry exposed in the session.
- AppContext global action errors.
- UI-level error messages in forms.

The architecture is generally reusable, but token-expiry handling must move from client-visible access-token metadata to BFF/upstream 401 handling.

---

# B. Problems and Recommended Changes

| Current behavior | Problem | Recommended change | Benefit |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` is used by browser code | Backend URL is public and requests bypass the BFF | Use server-only `FASTAPI_BASE_URL` in Route Handlers | Removes direct browser-to-FastAPI access |
| `session.accessToken` is exposed | FastAPI credential is available to JavaScript | Keep token only in encrypted NextAuth JWT; omit it from `Session` | Protects token from ordinary client-side access |
| `setAuthToken()` mutates Axios defaults | Token can remain in browser memory and leak into requests | Remove it entirely | One server-controlled authentication path |
| AppContext owns notes/profile | Duplicated server state, stale data, broad rerenders | Move resources to SWR hooks | Cache, revalidation, deduplication, synchronization |
| `proxy.ts` only checks cookie presence | Presence is not authentication; API requests may redirect | Let BFF return API 401 and make proxy protect page routes only | Correct API semantics |
| Catch-all forwarding is unrestricted | Can become an open proxy | Allowlist paths and methods | Prevents arbitrary backend access |
| Browser sends `Authorization` to quiz route | Violates token confidentiality requirement | Quiz Route Handler calls `getToken()` server-side | Keeps token server-side |
| BFF forwards upstream error bodies | Could expose internal backend details | Normalize errors and log server-side only | Safer browser responses |
| No explicit Origin validation | SameSite cookies do not eliminate CSRF | Validate `Origin` for state-changing requests | Defense-in-depth CSRF protection |
| FastAPI token can expire before NextAuth cookie | JWT cookie remains valid but contains unusable backend token | Treat upstream 401 as session expiration; sign out client-side; add refresh only if backend supports it | Correctly handles independent lifetimes |
| OpenAI key is sent to a route with inconsistent header names | Backend may reject the key or silently use development fallback | Standardize `X-OpenAI-API-Key`; never log it | Reliable and safer key handling |
| No user-keyed SWR cache | User-switching can display old cached data | Key resources by authenticated user ID and clear cache on logout | Prevents cross-user UI leakage |

---

# C. Proposed Architecture

```text
┌─────────────────────────────────────────────┐
│ Browser / Next.js Client                    │
│                                             │
│ useSession()                                │
│ SWR resource hooks                          │
│ Axios: /api/backend/*                       │
│ Quiz stream: /api/quiz/stream/*             │
│ No FastAPI bearer token                     │
└──────────────────────┬──────────────────────┘
                       │ HttpOnly SameSite cookie
                       ▼
┌─────────────────────────────────────────────┐
│ NextAuth v4                                 │
│                                             │
│ Encrypted JWT cookie                        │
│ Safe user fields                            │
│ Server-only FastAPI access token            │
└──────────────────────┬──────────────────────┘
                       │ getToken() server-side
                       ▼
┌─────────────────────────────────────────────┐
│ Next.js BFF Route Handlers                  │
│                                             │
│ Authentication and authorization            │
│ Origin validation                           │
│ Path/method allowlists                      │
│ Bearer token attachment                     │
│ Response/status/header normalization        │
└──────────────────────┬──────────────────────┘
                       │ Authorization: Bearer ...
                       ▼
┌─────────────────────────────────────────────┐
│ FastAPI                                    │
│                                             │
│ users, notes, quiz generation                │
│ JWT validation and authorization             │
└──────────────────────┬──────────────────────┘
                       ▼
                    Database
```

The browser authenticates the BFF because the browser automatically sends the NextAuth HttpOnly cookie to same-origin `/api/...` requests. JavaScript cannot read that cookie, but the Next.js server can read it through `getToken()`.

HttpOnly does not independently prevent CSRF or XSS. Origin validation, SameSite cookies, output encoding, and normal XSS protections remain necessary.

---

# D. File-by-File Change Plan

## Files to modify

| File | Action | Why | Proposed changes |
|---|---|---|---|
| `src/app/api/auth/[...nextauth]/route.ts` | Modify | Authentication boundary | Use `FASTAPI_BASE_URL`; keep token only in JWT; remove token from session |
| `src/types/next-auth.d.ts` | Modify | Types currently expose token to Session | Remove `Session.accessToken`; keep JWT-only token fields |
| `src/lib/api.ts` | Modify | Direct backend access and browser bearer token | Base URL `/api/backend`; remove `setAuthToken`; preserve 401 event |
| `src/context/app-context.tsx` | Modify | Context owns server state and token | Retain UI/workflow state only; use SWR hooks and mutations |
| `src/app/api/quiz/stream/[noteId]/route.ts` | Modify | Current route trusts browser authorization | Use `getToken()`, server-only backend URL, streaming cancellation |
| `src/proxy.ts` | Modify | Cookie-presence check and API redirects | Protect pages only; exclude BFF/API endpoints |
| `src/app/layout.tsx` | Modify | SWR provider is needed | Add `SWRConfig` provider |
| `src/components/auth/session-expiry-handler.tsx` | Modify | Depends on client-visible backend expiry | Trigger only from safe session error or remove proactive token timer |
| `src/components/session-expired-alert.tsx` | Modify | Logout/cache clearing | Clear SWR cache before sign-out; prevent duplicate sign-outs |
| `src/components/notes/notes-list.tsx` | Modify | Reads notes from AppContext | Use `useNotes()` |
| `src/components/notes/note-detail.tsx` | Modify | Reads notes from AppContext | Use `useNote()` or keyed notes data |
| `src/components/notes/edit-note.tsx` | Modify | Reads note through AppContext | Use `useNote()` |
| `src/components/notes/note-form.tsx` | Modify | Creates/updates through AppContext | Use resource mutation hooks |
| `src/components/notes/note-row.tsx` | Modify | Delete actions currently use context | Use delete mutation or retain only UI confirmation |
| `src/components/notes/delete-note-modal.tsx` | Modify | Delete state remains UI state | Call delete mutation |
| `src/components/dashboard/dashboard-view.tsx` | Modify | Reads notes/profile from context | Use SWR resource hooks |
| `src/components/layout/header.tsx` | Modify | Reads profile from context | Use `useProfile()` |
| `src/components/layout/sidebar.tsx` | Modify | Reads profile/notes from context | Use SWR resources |
| `src/components/account/account-view.tsx` | Modify | Reads profile from context | Use `useProfile()` |
| `src/components/account/profile-form.tsx` | Modify | Profile update belongs to resource hook | Use `useUpdateProfile()` |
| `src/components/account/delete-account-view.tsx` | Modify | Account deletion currently context-owned | Use delete-account mutation |
| `src/components/auth/register-form.tsx` | Modify | Registration should use public BFF route | Use `api.post("/users/", ...)` |
| `src/components/quiz/quiz-results.tsx` | Modify | Reads selected note/context data | Read notes through SWR |
| `src/components/quiz/quiz-progress.tsx` | Modify | Needs note data from SWR | Keep workflow context, obtain note via SWR |

## Files to create

| File | Responsibility |
|---|---|
| `src/app/api/backend/[...path]/route.ts` | Central authenticated BFF |
| `src/lib/swr-config.ts` | Global SWR defaults and fetcher |
| `src/hooks/notes/use-notes.ts` | Notes collection |
| `src/hooks/notes/use-note.ts` | Individual note selection |
| `src/hooks/notes/use-create-note.ts` | Create mutation |
| `src/hooks/notes/use-update-note.ts` | Update mutation |
| `src/hooks/notes/use-delete-note.ts` | Delete mutation |
| `src/hooks/users/use-profile.ts` | Profile resource |
| `src/hooks/users/use-update-profile.ts` | Profile mutation |
| `src/hooks/users/use-delete-account.ts` | Account deletion mutation |

## Potentially obsolete files or code

- `setAuthToken()` in `src/lib/api.ts`
- `AppContext.token`
- AppContext notes/profile state
- AppContext database CRUD functions
- AppContext `authHeaders`
- `API_BASE_URL` in client components
- Client-side FastAPI expiry timer based on `session.accessTokenExpires`

## Files that can remain unchanged initially

- Note and user TypeScript models
- UI primitives
- Route page wrappers
- Subject data
- Styling
- FastAPI route contracts, unless backend refresh-token support is later added

---

# E. Implementation Sequence

## Phase 1: Authentication boundary

Files:

- NextAuth route
- NextAuth augmentation
- Environment documentation
- `proxy.ts`

Changes:

- Keep access token in JWT only.
- Remove token from Session.
- Use `FASTAPI_BASE_URL`.
- Make page protection and API protection separate.

Expected result:

- `useSession()` contains only safe user fields.
- `getToken()` can still access the FastAPI token on the server.

Testing:

- Login succeeds.
- Browser session object contains no `accessToken`.
- FastAPI token is not present in browser responses or React state.

Breaking change:

- Any component reading `session.accessToken` or `session.accessTokenExpires` must be updated.

## Phase 2: BFF and Axios

Files:

- New backend catch-all route
- `api.ts`
- Registration form
- Proxy

Changes:

- Browser requests use `/api/backend`.
- BFF allowlists public registration and protected resource paths.
- BFF attaches bearer token server-side.
- Axios handles 401 and network errors centrally.

Testing:

- Registration works without authentication.
- Protected requests return 401 without a session.
- Authenticated notes requests reach FastAPI.
- Browser network requests contain only cookies, not FastAPI bearer tokens.

## Phase 3: SWR resources

Files:

- SWR config
- Notes hooks
- User hooks
- Root layout

Changes:

- Add authenticated conditional keys.
- Include user ID in keys.
- Use `useSWRMutation`.
- Revalidate affected resources after mutations.

Testing:

- Notes load once per cache key.
- Focus and reconnect revalidate.
- User switching does not show previous notes.
- Failed optimistic updates roll back.

## Phase 4: AppContext reduction

Files:

- AppContext
- All consumers

Changes:

- Retain quiz workflow state, cancellation, OpenAI modal state, delete UI state, global errors, and logout.
- Remove persistent notes/profile state.
- Move server mutations into hooks.

Testing:

- Existing UI flows remain functional.
- Quiz state survives component transitions as before.
- Context rerenders are reduced.

## Phase 5: SSE BFF

Files:

- Quiz stream Route Handler
- AppContext or a dedicated quiz workflow hook

Changes:

- Authenticate with `getToken()`.
- Forward `X-OpenAI-API-Key` only when supplied.
- Stream directly.
- Abort upstream fetch when the browser disconnects.
- Preserve the existing parser and event names.

Testing:

- Workflow updates render.
- Completion updates the notes cache.
- Error events display correctly.
- Cancellation aborts both browser and upstream work.
- FastAPI 401 triggers session expiry.

## Phase 6: Validation and hardening

Test:

- Origin validation.
- Request-size limits.
- Unsupported path/method rejection.
- Header allowlists.
- 204 responses.
- Backend 5xx normalization.
- No secret values in logs or responses.
- Production secure cookies and deployment networking.

---

# F. Critical Code Examples

These examples are based on the observed endpoints and types.

## 1. NextAuth configuration

```ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const fastApiBaseUrl = () => {
  const value = process.env.FASTAPI_BASE_URL?.replace(/\/+$/, "");

  if (!value) {
    throw new Error("FASTAPI_BASE_URL is not configured.");
  }

  return value;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "FastApi Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const formData = new URLSearchParams();
        formData.set("username", credentials.username);
        formData.set("password", credentials.password);

        try {
          const baseUrl = fastApiBaseUrl();

          const loginResponse = await axios.post(
            `${baseUrl}/users/login`,
            formData,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              timeout: 15_000,
            },
          );

          const accessToken = loginResponse.data.access_token;

          if (typeof accessToken !== "string" || !accessToken) {
            return null;
          }

          const profileResponse = await axios.get(`${baseUrl}/users/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            timeout: 15_000,
          });

          const profile = profileResponse.data;

          return {
            id: String(profile.user_id),
            user_id: profile.user_id,
            user_name: profile.user_name,
            name: profile.user_name,
            accessToken,
          };
        } catch (error) {
          if (
            axios.isAxiosError(error) &&
            [400, 401, 422].includes(error.response?.status ?? 0)
          ) {
            return null;
          }

          throw new Error("Failed to authenticate with the server.");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user_id = user.user_id;
        token.user_name = user.user_name;
        token.accessToken = user.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.user_id ?? "");
        session.user.name = token.user_name;
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

The token is still present in the encrypted JWT cookie, but not in the serialized client session.

## 2. Type augmentation

```ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    error?: "AccessTokenExpired";
  }

  interface User {
    user_id: number;
    user_name: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id?: number;
    user_name?: string;
    accessToken?: string;
    error?: "AccessTokenExpired";
  }
}
```

The exact `Session.user` augmentation should be merged with the existing NextAuth default type rather than unnecessarily replacing fields.

## 3. Central BFF route

```ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = new Set(["users/"]);
const allowedMethods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

const stateChangingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function backendUrl() {
  const value = process.env.FASTAPI_BASE_URL?.replace(/\/+$/, "");

  if (!value) {
    throw new Error("FASTAPI_BASE_URL is not configured.");
  }

  return value;
}

function isAllowedPath(path: string[], method: string) {
  const normalized = path.join("/");

  if (method === "POST" && normalized === "users/") {
    return true;
  }

  return (
    normalized === "users/me" ||
    /^users\/\d+$/.test(normalized) ||
    normalized === "notes/read_note" ||
    normalized === "notes/create_note" ||
    /^notes\/(update_note|delete_note)\/[^/]+$/.test(normalized)
  );
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  return origin === request.nextUrl.origin;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return forward(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return forward(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return forward(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return forward(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return forward(request, context);
}

async function forward(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const method = request.method;
  const { path = [] } = await context.params;

  if (!allowedMethods.has(method) || !isAllowedPath(path, method)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }

  if (stateChangingMethods.has(method) && !isSameOrigin(request)) {
    return NextResponse.json({ detail: "Invalid request origin." }, { status: 403 });
  }

  const isPublicRegistration = method === "POST" && path.join("/") === "users/";

  let accessToken: string | undefined;

  if (!isPublicRegistration) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    accessToken = token?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > 1_000_000) {
    return NextResponse.json({ detail: "Request body is too large." }, { status: 413 });
  }

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  const url = new URL(path.map(encodeURIComponent).join("/"), `${backendUrl()}/`);
  url.search = request.nextUrl.search;

  const hasBody = !["GET", "HEAD"].includes(method);

  const upstream = await fetch(url, {
    method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    redirect: "error",
  });

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { detail: "The backend request failed." },
      { status: upstream.status },
    );
  }

  const responseHeaders = new Headers();
  const responseContentType = upstream.headers.get("content-type");

  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
```

This should be refined with the exact Next.js 16 generated route types and project lint rules during implementation. Large-response streaming should be handled by dedicated handlers where necessary.

A single catch-all route is suitable for ordinary JSON CRUD only when the allowlist is strict. Dedicated handlers are preferable for:

- SSE.
- File uploads/downloads.
- Webhooks.
- Routes requiring special authorization or body parsing.

## 4. Axios client

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api/backend",
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

let sessionExpiredEventDispatched = false;

export function resetSessionExpiredDispatch() {
  sessionExpiredEventDispatched = false;
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isLoginRequest = /\/users\/login\/?$/.test(url);

    if (
      typeof window !== "undefined" &&
      status === 401 &&
      !isLoginRequest &&
      !sessionExpiredEventDispatched
    ) {
      sessionExpiredEventDispatched = true;
      window.dispatchEvent(new Event("app:session-expired"));
    }

    if (!error.response) {
      error.message = "Unable to reach the server.";
    }

    return Promise.reject(error);
  },
);
```

There should be no `setAuthToken()` and no browser-side `Authorization` header.

## 5. SWR configuration

```ts
import type { SWRConfiguration } from "swr";
import { api } from "@/lib/api";

export const swrConfig: SWRConfiguration = {
  fetcher: async <T>(url: string): Promise<T> => {
    const response = await api.get<T>(url);
    return response.data;
  },
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshWhenHidden: false,
  dedupingInterval: 5_000,
  errorRetryCount: 2,
  errorRetryInterval: 2_000,
  shouldRetryOnError: true,
  keepPreviousData: false,
};
```

Use `SWRConfig` in the root layout.

SWR freshness is not true real-time synchronization. Revalidation occurs on focus, reconnect, interval, mutation, or explicit `mutate()`. Another browser or backend process can change data without the current browser knowing immediately. SSE is appropriate for quiz workflow progress, not necessary for ordinary notes CRUD.

## 6. Notes hooks

```ts
"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import type { NoteResponse } from "@/types/notes";
import { api } from "@/lib/api";

export function useNotes() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const key =
    status === "authenticated" && userId
      ? [`/notes/read_note`, userId]
      : null;

  const result = useSWR<NoteResponse[]>(
    key,
    async ([url]) => (await api.get<NoteResponse[]>(url)).data,
  );

  return {
    ...result,
    notes: result.data ?? [],
    isLoading: status === "loading" || result.isLoading,
  };
}
```

The tuple key prevents cache reuse across authenticated users.

## 7. Create/update/delete hooks

```ts
"use client";

import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { api } from "@/lib/api";
import type { NoteCreate, NoteResponse, NoteUpdate } from "@/types/notes";

const notesKey = "/notes/read_note";

export function useCreateNote() {
  return useSWRMutation(
    notesKey,
    async (_key, { arg }: { arg: NoteCreate }) => {
      const response = await api.post<NoteResponse>("/notes/create_note", arg);
      return response.data;
    },
    {
      onSuccess: async () => {
        await mutate((key) => Array.isArray(key) && key[0] === notesKey);
      },
    },
  );
}

export function useUpdateNote(noteId: string) {
  return useSWRMutation(
    `/notes/update_note/${encodeURIComponent(noteId)}`,
    async (_key, { arg }: { arg: NoteUpdate }) => {
      const response = await api.patch<NoteResponse>(
        `/notes/update_note/${encodeURIComponent(noteId)}`,
        arg,
      );

      return response.data;
    },
    {
      onSuccess: async () => {
        await mutate((key) => Array.isArray(key) && key[0] === notesKey);
      },
    },
  );
}

export function useDeleteNote() {
  return useSWRMutation(
    notesKey,
    async (_key, { arg }: { arg: string }) => {
      await api.delete(`/notes/delete_note/${encodeURIComponent(arg)}`);
      return arg;
    },
    {
      onSuccess: async () => {
        await mutate((key) => Array.isArray(key) && key[0] === notesKey);
      },
    },
  );
}
```

The final implementation should centralize key construction so tuple keys are used consistently for all mutations and cache updates.

## 8. Refactored AppContext responsibilities

AppContext should retain:

```ts
type AppContextValue = {
  logout: () => Promise<void>;

  deleteTarget: NoteResponse | null;
  requestDelete: (note: NoteResponse) => void;
  cancelDelete: () => void;

  generateQuiz: (noteId: string) => Promise<void>;
  cancelQuizGeneration: () => void;
  resetQuizState: () => void;
  quizStatus: QuizStatus;
  quizNoteId: string | null;
  quizProgress: QuizProgressState;
  quizError: string | null;
  quizResult: QuizGenerationResponse | null;

  apiConfigured: boolean;
  setApiConfigured: (value: boolean) => void;
  openaiKey: string;
  setOpenaiKey: (key: string) => void;
  apiModalOpen: boolean;
  openApiModal: () => void;
  closeApiModal: () => void;
  requestAi: (noteId: string) => void;

  actionError: string | null;
  clearActionError: () => void;
};
```

It should no longer expose:

- `token`
- `notes`
- `profile`
- `setProfile`
- `getNote`
- `saveNote`
- `updateNote`
- `confirmDelete`
- Database-loading effects
- `authHeaders`

Components should obtain those through SWR hooks and mutation hooks.

## 9. SSE BFF Route

```ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ noteId: string }> },
) {
  const { noteId } = await context.params;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.accessToken) {
    return NextResponse.json(
      { detail: "Authentication required." },
      { status: 401 },
    );
  }

  const openAiKey = request.headers.get("x-openai-api-key");

  if (!openAiKey) {
    return NextResponse.json(
      { detail: "OpenAI API key is required." },
      { status: 400 },
    );
  }

  const baseUrl = process.env.FASTAPI_BASE_URL?.replace(/\/+$/, "");

  if (!baseUrl) {
    return NextResponse.json(
      { detail: "Backend is not configured." },
      { status: 500 },
    );
  }

  const controller = new AbortController();

  request.signal.addEventListener("abort", () => {
    controller.abort();
  });

  let upstream: Response;

  try {
    upstream = await fetch(
      `${baseUrl}/notes/quiz_generation/${encodeURIComponent(noteId)}`,
      {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${token.accessToken}`,
          "X-OpenAI-API-Key": openAiKey,
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );
  } catch {
    return NextResponse.json(
      { detail: "Quiz generation service is unavailable." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { detail: upstream.status === 401 ? "Authentication expired." : "Quiz generation failed." },
      { status: upstream.status },
    );
  }

  if (!upstream.body) {
    return NextResponse.json(
      { detail: "Quiz generation returned no stream." },
      { status: 502 },
    );
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
```

The existing parser for `workflow_update`, `complete`, and `error` can remain in the client workflow layer. Only the authentication and forwarding boundary changes.

---

# G. Testing Checklist

## Authentication

- Successful login creates an encrypted HttpOnly session cookie.
- `useSession()` does not contain `accessToken`.
- Invalid credentials do not trigger global logout.
- FastAPI login remains server-to-server.
- NextAuth session expiration still redirects to `/login`.

## Registration

- `POST /api/backend/users/` succeeds without authentication.
- Registration does not expose FastAPI credentials.
- Protected users endpoints reject unauthenticated requests.

## BFF

- GET, POST, PUT, PATCH, and DELETE allowlisted paths work.
- Unsupported methods return 404 or 405.
- Unsupported paths cannot be forwarded.
- Query parameters are preserved.
- JSON bodies are preserved.
- 204 responses remain empty 204 responses.
- Backend 401/403/404/409/422/500 statuses are preserved or safely normalized.
- Backend internal details are not exposed.
- Large request bodies are rejected.
- Redirect responses from FastAPI are not followed unexpectedly.
- Browser requests contain cookies but no FastAPI bearer token.

## Notes

- Notes load through SWR only when authenticated.
- Create, update, and delete synchronize the collection cache.
- Optimistic updates roll back on failure.
- Individual note pages handle loading and missing-note states.
- Note data is not displayed after logout.

## Profile

- Profile retrieval uses SWR.
- Profile updates update or revalidate the profile cache.
- Account deletion clears notes/profile cache and signs out.

## Session expiration

- FastAPI 401 dispatches `app:session-expired`.
- Multiple simultaneous 401s cause only one sign-out flow.
- Login failures do not dispatch the event.
- Expired backend tokens cannot continue making successful BFF requests.
- No assumption is made that FastAPI tokens refresh automatically.

## User switching and cache isolation

- User A’s notes are not visible after user B signs in.
- Logout clears or invalidates user-specific SWR keys.
- Account switching causes fresh profile and notes requests.
- Browser back/forward navigation does not reveal stale private data.

## SSE

- `workflow_update` events update progress.
- `complete` updates quiz result and revalidates the note collection.
- `error` events display the existing error UI.
- Browser cancellation aborts the upstream request.
- Client disconnect cancels upstream work.
- The stream is not subject to the ordinary Axios timeout.
- SSE 401 behavior matches normal API 401 behavior.
- OpenAI keys are never logged or persisted in browser storage.
- The backend receives `X-OpenAI-API-Key`.

## Security

- State-changing cross-origin requests are rejected.
- Production cookies are Secure and SameSite-appropriate.
- `NEXTAUTH_SECRET` is present only server-side.
- `FASTAPI_BASE_URL` is not `NEXT_PUBLIC_*`.
- BFF response headers do not leak backend infrastructure information.
- No open-proxy path is reachable.
- XSS protections remain enabled.
- HttpOnly cookies are not treated as a complete CSRF defense.

---

# H. Final Recommendations

The recommended final design is:

1. Keep NextAuth v4 CredentialsProvider.
2. Store the FastAPI access token only in the encrypted NextAuth JWT.
3. Remove it completely from the client session and AppContext.
4. Route all normal browser API calls through `/api/backend`.
5. Use a strict allowlisted BFF rather than a general proxy.
6. Keep quiz streaming in a dedicated authenticated SSE Route Handler.
7. Make SWR the source of truth for notes, profile, and persistent resources.
8. Keep AppContext for quiz workflow, UI state, cancellation, temporary OpenAI key state, and global errors.
9. Treat FastAPI 401 responses as session expiration because no refresh-token endpoint currently exists.
10. Use user-scoped SWR cache keys and clear cache on logout/account changes.
11. Keep `FASTAPI_BASE_URL` server-only and rotate the currently exposed local secret if it has ever been committed or shared.

The main behavioral change is that components will no longer receive notes and profile through `useApp()`. They will consume resource hooks instead. Quiz workflow behavior and the existing SSE event parser can remain substantially unchanged.

No files were modified. Implementation should begin only after your approval.