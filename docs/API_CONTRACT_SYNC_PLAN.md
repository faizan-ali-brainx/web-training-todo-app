# Frontend Update Plan — Sync to Backend's Post-Review API Contract

**Status: not started.** This is a planning document only — no code has changed yet. It exists so
the required frontend work isn't lost/forgotten, and so it can be picked up later (by a human or
an AI coding agent) without needing this conversation's history.

**How to use this document:** This is meant to be **self-sufficient** — everything needed to make
these changes correctly, without access to any prior chat history. It explains why the change is
needed, exactly what the backend's contract looks like now, exactly which frontend files need to
change and how, and how to verify the result. Read it top to bottom before touching any code.

---

## 1. Why this doc exists

A senior backend engineer reviewed the backend's first PR (branch `auth_and_todo_apis`) and asked
for several changes. Two of those changes **break the frontend's current integration** with the
real backend, because they change the shape of every HTTP response and the API's URL prefix:

1. Every response is now wrapped in a consistent envelope (§2).
2. The API's global route prefix changed from `/api` to `/api/v1` (§3).

The frontend (`auth_api_integration` branch) was built and verified against the *old* contract —
plain resource bodies under `/api`. It has **not** been updated yet. Right now, if you ran both
apps together, every real-backend API call would either 404 (wrong prefix) or hand the frontend an
envelope object where it expects a plain resource (wrong shape) — auth and todos would both be
completely broken against the real backend. The mock API (`src/api/mock/`) is unaffected, since it
never talks to the real backend.

The other 5 backend review comments (FK indexes, case-insensitive emails, constants file, email
try/catch, Handlebars templates) are backend-internal — they don't change anything the frontend
sends or receives, so there is nothing to do here for those.

---

## 2. What changed: response envelope

**Old contract** (what the frontend was built against): each endpoint returned its resource
directly as the response body.

```
POST /auth/login → 200
{ "user": { "id": 1, "name": "...", "email": "...", "emailVerified": true }, "accessToken": "..." }

GET /todos → 200
[ { "id": 1, "userId": 1, "title": "...", "completed": false, "createdAt": "..." } ]

POST /auth/signup → 201
{ "message": "Account created — check your email to verify.", "verificationToken": "..." }
```

**New contract** (what the backend returns now): every response is wrapped.

```
// Any success response
{ "success": true, "data": <the old response body, minus any `message` field>, "message": "<string>" }

// Any error response (4xx/5xx)
{ "success": false, "message": "<string>" }

// 204 No Content responses (DELETE /todos/:id) are unchanged — still an empty body.
```

The wrapping rule for `data`/`message` on success:
- If the old body was `{ message, ...rest }` (signup, verify-email, login-out... i.e. the
  auth "action" endpoints), `message` is hoisted to the envelope's own `message` field, and `data`
  is `rest` (or `null` if `rest` is empty, e.g. verify-email/logout/reset-password have nothing
  left over).
- If the old body had no `message` field (login's `{user, accessToken}`, every Todo/Todo[]
  response), `data` is exactly the old body, and the envelope's `message` is just a generic
  `"Success"`.

Concrete before/after examples for every endpoint the frontend calls:

| Endpoint | Old body | New `data` | New `message` |
|---|---|---|---|
| `POST /auth/signup` | `{ message, verificationToken? }` | `{ verificationToken? }` (or `null` in prod) | the message string |
| `POST /auth/verify-email` | `{ message }` | `null` | the message string |
| `POST /auth/login` | `{ user, accessToken }` | `{ user, accessToken }` (unchanged) | `"Success"` |
| `POST /auth/logout` | `{ message }` | `null` | the message string |
| `GET /auth/me` | `User` | `User` (unchanged) | `"Success"` |
| `POST /auth/forgot-password` | `{ message, resetToken? }` | `{ resetToken? }` (or `null` in prod) | the message string |
| `POST /auth/reset-password` | `{ message }` | `null` | the message string |
| `GET /todos` | `Todo[]` | `Todo[]` (unchanged) | `"Success"` |
| `POST /todos` | `Todo` | `Todo` (unchanged) | `"Success"` |
| `PATCH /todos/:id` | `Todo` | `Todo` (unchanged) | `"Success"` |
| `DELETE /todos/:id` | *(204, no body)* | *(204, no body — unaffected)* | — |

**Error responses** did *not* change shape in a way that requires a frontend code change — errors
were already `{ message: string | string[], ...}` and are now `{ success: false, message: string
}`. The frontend's existing `extractMessage()` in `src/api/client.ts` already reads `data.message`
and already handles both a string and a string-array — it works unmodified against the new error
shape. **Only the success path needs a fix.**

---

## 3. What changed: API prefix

Every route moved from `/api/...` to `/api/v1/...`. For example, `/api/auth/login` is now
`/api/v1/auth/login`. This is a simple base-URL change, not a per-route change.

---

## 4. Exactly what to change (file by file)

### 4.1 `.env` and `.env.example`

Change the base URL to include the version segment:

```diff
- VITE_API_BASE_URL=http://localhost:3000/api
+ VITE_API_BASE_URL=http://localhost:3000/api/v1
```

(`.env` is gitignored — update your own local copy too, not just `.env.example`.)

### 4.2 `src/api/config.ts`

Update the fallback default (used if `VITE_API_BASE_URL` isn't set) to match:

```diff
- export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
+ export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';
```

### 4.3 `src/api/client.ts` — the main change

Add a response interceptor step that unwraps the new envelope back into the shape every existing
caller (`authApi.ts`, `todosApi.ts`, and everything downstream of them) already expects. This is
the **only** functional change needed to restore the whole integration — no other file has to
change, because every real-branch call site already does `.then((res) => res.data)`, and this
keeps `res.data` meaning exactly what it meant before.

```typescript
// Unwraps the backend's { success, data, message } envelope back into a plain
// resource, restoring the exact shape every real-branch call in authApi.ts/
// todosApi.ts already expects. Runs before the existing error handling below.
apiClient.interceptors.response.use((res) => {
  const body: unknown = res.data;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    const { data, message } = body as { data: unknown; message: string };
    res.data =
      data === null || Array.isArray(data) || typeof data !== 'object'
        ? data
        : { ...data, message };
  }
  return res;
});
```

Add this as a *new, separate* `apiClient.interceptors.response.use(...)` call, registered **before**
the existing one (axios runs success interceptors in registration order, and this one only
touches the success path — the existing interceptor's error handler is untouched and doesn't need
to move).

Why the `Array.isArray(data) || typeof data !== 'object'` branch: `GET /todos` returns an array,
and we must return the array itself (`Todo[]`), not an array with a `message` property bolted on
(arrays aren't a good place to stash an extra field, and no caller expects one there). Every
array/primitive/null response passes through untouched; every plain-object response gets `message`
merged in.

**Known, accepted trade-off:** this means `Todo` objects returned from `POST /todos`/`PATCH
/todos/:id`, and the `{user, accessToken}` from `POST /auth/login`, will carry an extra `message:
"Success"` property that the `Todo`/`AuthSession` TypeScript types don't declare. This is harmless
— nothing reads or displays it, and TypeScript won't complain since the generic `apiClient.get<Todo[]>(...)`-style
calls already assert the type. If you'd rather avoid this entirely, the alternative is to *not*
touch `client.ts` at all, and instead handle the envelope individually inside `authApi.ts`'s
`signup()` and `forgotPassword()` only (the two methods that actually need both `data` and
`message` together) — every other method would then need its own one-line `.then((res) =>
res.data.data)` instead of `.then((res) => res.data)`. That spreads the change across ~9 call
sites instead of one; the interceptor approach above is recommended unless the stray `message`
field is a real problem for you.

### 4.4 Nothing else needs to change

Explicitly **not** touched by this plan, and why:
- `src/features/auth/authApi.ts`, `src/features/todos/todosApi.ts` — every real-branch call
  already does `.then((res) => res.data)`; once `client.ts` unwraps the envelope, `res.data` is
  exactly the shape these files already return.
- `src/features/auth/authSlice.ts`, `src/features/todos/todosSlice.ts` — consume `authApi`/
  `todosApi`'s return values, which don't change shape.
- Every page/component (`SignupPage.tsx`, `TodoListPage.tsx`, etc.) — same reasoning, one level
  further removed.
- `src/api/mock/*` — the mock API never talks to the real backend; its shape is unaffected and
  needs no changes.
- `src/types/index.ts` — `User`/`Todo`/`AuthSession` describe the *resource* shape, which is
  unchanged; they don't need an envelope wrapper type added since `client.ts` unwraps before
  anything else sees the response.

### 4.5 `README.md`

Update the example env value and integration notes to mention the new prefix, e.g. in the
"Backend Integration Status" section:

```diff
- Both require the backend running locally at `VITE_API_BASE_URL` (see `backend/README.md`).
+ Both require the backend running locally at `VITE_API_BASE_URL` (now `http://localhost:3000/api/v1`
+ — see `backend/README.md`).
```

---

## 5. Verification checklist

Do this against the real backend running locally (not the mock), the same way Part 1's integration
was originally verified:

1. Update `.env` per §4.1, restart the Vite dev server (env vars are read at startup, not
   hot-reloaded).
2. Make sure the backend is running with its post-review changes (branch `auth_and_todo_apis`) —
   it should log routes as `/api/v1/auth/...` and `/api/v1/todos/...` on startup, not `/api/...`.
3. In the browser: signup → verify-email (dev-mode on-screen link — confirm the token still shows,
   proving `SignupResult.verificationToken` survived the envelope unwrap) → login → session
   persists across a page reload (`/auth/me` rehydration) → add / toggle / rename / delete a todo →
   logout → forgot-password → reset-password → login with the new password.
4. Confirm zero console errors and zero unexpected-shape errors (e.g. `Cannot read properties of
   undefined`) throughout.
5. Open the Network tab and spot-check one response body directly — you should see the raw
   `{ success, data, message }` envelope on the wire, while the app itself behaves exactly as
   before.
6. Run `npm run build` and `npm run lint` — both should stay clean; this change is small enough
   that it shouldn't introduce any type errors if `client.ts` is typed as shown above.

---

## 6. Out of scope for this doc

The other backend review changes (Prisma FK indexes, case-insensitive email normalization, the
`auth.constants.ts` extraction, defensive try/catch around email sends, Handlebars email
templates) are backend-internal implementation details. They don't change any request/response
shape or URL the frontend depends on, so there is nothing for the frontend to do for those —
listed here only so it's clear they were considered and deliberately excluded, not missed.
