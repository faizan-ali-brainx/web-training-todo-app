# Frontend Practice Task — Development Plan

Source: Company Training Plan — "Frontend Practice Task (Complete Before Day 5)"

## Scope (from training doc)

- Authentication Pages: Login, Signup, Email Verification, Forgot / Reset Password
- Todo Module: Full CRUD for Todo items
- Only authenticated users can manage their own todos
- Integrate with backend APIs (mock for now — real NestJS API arrives on Day 5)
- Submit PR for review before starting backend days

Out of scope for this task (reserved for the Final Task, after Day 5): collaboration/invites, deadlines, email notifications, Socket.io real-time notifications.

## Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript (strict) | Rubric requires no `any`, proper interfaces throughout |
| UI | React 19 + Vite | Already scaffolded in this repo |
| Routing | React Router DOM v6 | Covered Day 3 — typed params, `Outlet`-based protected routes |
| Forms | React Hook Form + Zod (`@hookform/resolvers/zod`) | Covered Day 3 — schema is the single source of truth for types + validation |
| Global state | Redux Toolkit (`createSlice`, `createAsyncThunk`) | Covered Day 4 — auth session + todos need to be readable app-wide |
| Async middleware | Built-in RTK thunks (not Redux Saga) | Decided in Day 4 discussion — simpler, matches this app's CRUD-shaped complexity |
| API layer | Axios instance with interceptors | Covered Day 3 — attaches token automatically, handles 401s centrally |
| Mock backend | In-memory + `localStorage`-backed mock API module | No real backend until Day 5; shaped to mirror the real NestJS REST contract so swapping later is a one-file change |

## Folder Structure

Feature-first layout (Day 4 topic), matching what the app will still look like after Day 5 and the Final Task:

```
src/
├── app/
│   ├── store.ts              # configureStore, RootState, AppDispatch
│   └── hooks.ts              # useAppDispatch, useAppSelector
│
├── api/
│   ├── client.ts             # axios instance + auth/401 interceptors
│   ├── config.ts             # USE_MOCK_API flag, base URL
│   └── mock/
│       ├── mockDb.ts         # in-memory + localStorage-backed fake tables (users, todos)
│       ├── mockAuthApi.ts    # signup/login/verify/forgot/reset — same signatures the real API will have
│       └── mockTodosApi.ts   # CRUD scoped to the current user
│
├── features/
│   ├── auth/
│   │   ├── authSlice.ts      # session state + thunks (login/signup/verify/forgot/reset/logout)
│   │   ├── authApi.ts        # picks mock or real implementation based on api/config.ts
│   │   ├── schemas.ts        # zod schemas: login, signup, forgotPassword, resetPassword
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ResetPasswordPage.tsx
│   │
│   └── todos/
│       ├── todosSlice.ts     # todos state + createAsyncThunk CRUD
│       ├── todosApi.ts
│       ├── schemas.ts        # zod schema for add/edit todo form
│       ├── TodoListPage.tsx
│       ├── TodoItem.tsx
│       └── TodoForm.tsx
│
├── routes/
│   ├── AppRouter.tsx
│   └── ProtectedRoute.tsx    # redirects to /login if not authenticated
│
├── components/               # shared, feature-agnostic UI
│   ├── Button.tsx
│   ├── TextField.tsx
│   ├── FormError.tsx
│   └── Spinner.tsx
│
├── types/
│   └── index.ts              # User, Todo, AuthTokens — shared cross-feature types
│
├── App.tsx
└── main.tsx
```

## Data Models

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}

interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
  createdAt: string; // ISO string — never store Date objects in Redux state
}

interface AuthSession {
  user: User;
  accessToken: string;
}
```

## Mock API Strategy

Since there's no real backend until Day 5, `api/mock/` simulates one:

- **`mockDb.ts`** — a fake `users` table and `todos` table, persisted to `localStorage` (so data survives page reloads) with an artificial network delay (`setTimeout`) on every call, so loading states are actually visible and testable.
- **Fake tokens** — login/signup return a random opaque string as `accessToken`, stored alongside a `userId` in the mock DB's "sessions" table. The axios client attaches it as `Authorization: Bearer <token>` on every request, exactly like it would against the real API.
- **Email verification / password reset** — no real email is sent. Simulate it by generating a token and displaying it directly in the UI (e.g., "Verification link: `/verify-email?token=abc123`" shown on screen, or logged to the console) so the flow can be tested end-to-end without a mail server.
- **Ownership enforcement** — `mockTodosApi` filters every query by the `userId` resolved from the current request's token, and rejects with a 403-equivalent error if a todo belongs to someone else. This mirrors the real NestJS guard behavior we'll add on Day 5, so the frontend code doesn't need to change when we swap.

### The Day 5 swap plan

Each feature's `authApi.ts` / `todosApi.ts` exports the same typed function signatures regardless of implementation. `api/config.ts` holds one flag:

```typescript
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';
```

When Day 5's NestJS backend is ready, we point `authApi.ts`/`todosApi.ts` at real axios calls instead of the mock module — components, slices, and thunks require **no changes**, since they only ever import from `features/*/authApi.ts` / `todosApi.ts`, never from `api/mock/` directly.

## Auth Flow

1. **Signup** (`/signup`) → RHF + Zod validated form → `authApi.signup()` → account created as unverified → redirect to a "check your email" screen showing the mock verification link.
2. **Email Verification** (`/verify-email?token=...`) → reads token from query params → calls `authApi.verifyEmail(token)` → marks user verified → redirect to `/login`.
3. **Login** (`/login`) → validated form → `authApi.login()` → on success, store `{ user, accessToken }` in `authSlice` (and `localStorage`, so refresh doesn't log the user out) → redirect to `/todos`.
4. **Forgot Password** (`/forgot-password`) → email form → `authApi.forgotPassword(email)` → shows mock reset link.
5. **Reset Password** (`/reset-password?token=...`) → new password form (validated, confirm-password match via Zod `.refine`) → `authApi.resetPassword(token, newPassword)` → redirect to `/login`.
6. **Logout** → clears `authSlice` + `localStorage` → redirect to `/login`.
7. **Protected routes** — `/todos` and any todo detail routes are wrapped in `ProtectedRoute`, which checks `authSlice`'s session state and redirects unauthenticated users to `/login`.

## Todo Module Flow

- `GET /todos` (mock, scoped to current user) on `TodoListPage` mount via `fetchTodos` thunk.
- Add todo — form (RHF + Zod, just a required `title`) → `addTodo` thunk → appends to `todosSlice` state on success.
- Toggle complete — `toggleTodo` thunk → optimistic-friendly, but start with the simple await-then-update approach from Day 3/4.
- Delete todo — confirm, then `deleteTodo` thunk.
- Edit title — inline edit or a small modal/form, `updateTodo` thunk.
- Loading/error states rendered via the slice's `status`/`error` fields (Day 3/4 discriminated-union pattern).

## State Management Plan

- `authSlice`: `{ user: User | null, accessToken: string | null, status, error }` + thunks for signup/login/verifyEmail/forgotPassword/resetPassword/logout.
- `todosSlice`: `{ items: Todo[], status, error }` + thunks for fetch/add/update/toggle/delete, scoped implicitly by whatever the mock/real API returns for the authenticated user.
- Typed hooks (`useAppDispatch`, `useAppSelector`) from `app/hooks.ts` used everywhere — never the raw `react-redux` hooks.
- Named selectors (e.g., `selectIsAuthenticated`, `selectCompletedCount`) live next to their slice.

## Milestones / Progress Checklist

Use this section to track actual implementation progress — check items off as they're completed.

### Setup
- [x] Install dependencies: `react-router-dom`, `@reduxjs/toolkit`, `react-redux`, `react-hook-form`, `zod`, `@hookform/resolvers`, `axios`
- [x] Scaffold folder structure above
- [x] Set up `app/store.ts`, `app/hooks.ts`, wrap `main.tsx` in `<Provider>`
- [x] Set up `api/client.ts` (axios instance) + `api/config.ts` (mock flag)
- [x] Build `api/mock/mockDb.ts` (localStorage-backed fake tables + delay helper)

### Auth
- [x] `mockAuthApi.ts` — signup, login, verifyEmail, forgotPassword, resetPassword, logout
- [x] `authSlice.ts` — state shape + async thunks + selectors
- [x] Zod schemas for all 4 auth forms
- [x] `LoginPage.tsx`
- [x] `SignupPage.tsx`
- [x] `VerifyEmailPage.tsx`
- [x] `ForgotPasswordPage.tsx`
- [x] `ResetPasswordPage.tsx`
- [x] Persist session to `localStorage`, rehydrate on app load

### Routing
- [x] `AppRouter.tsx` with all auth routes + `/todos`
- [x] `ProtectedRoute.tsx` guarding `/todos`
- [x] Redirect authenticated users away from `/login`/`/signup` back to `/todos`

### Todos
- [x] `mockTodosApi.ts` — CRUD scoped to current user, ownership-enforced
- [x] `todosSlice.ts` — state + thunks + selectors
- [x] `TodoListPage.tsx` — loading/error/success rendering
- [x] `TodoForm.tsx` — add todo
- [x] `TodoItem.tsx` — toggle, edit, delete

### Polish & Submission
- [x] Manual end-to-end test: signup → verify → login → add/toggle/edit/delete todos → logout
- [x] Confirm no `any` types anywhere (rubric requirement)
- [x] Confirm unauthenticated users cannot reach `/todos` or call todo endpoints
- [x] Update root `README.md` with local setup instructions
- [ ] Submit PR for review

## Definition of Done

- All checklist items above are complete.
- The app runs end-to-end against the mock API with no backend running.
- Code passes `npm run lint` and `tsc -b` with no errors.
- No component directly imports `api/mock/*` — only through each feature's `authApi.ts`/`todosApi.ts`, so the Day 5 swap to the real NestJS API touches only those two files.
