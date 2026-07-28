# react-sample-app

A Task Manager frontend built as part of a company web development training plan (React, TypeScript, Redux Toolkit, NestJS). This repo currently covers the **Frontend Practice Task** (authentication and a Todo module with full CRUD, scoped to the logged-in user) plus **Part 2 — Collaboration**: inviting other users onto a todo by email, with permission-aware editing (only the owner can rename/delete/manage collaborators).

See [docs/FRONTEND_PRACTICE_PLAN.md](docs/FRONTEND_PRACTICE_PLAN.md) for the full development plan, architecture decisions, and progress checklist.

Before writing code or opening a PR, check [docs/PR_STANDARDS.md](docs/PR_STANDARDS.md) — a condensed, one-file reference for this repo's code standards and PR review checklist.

**⚠️ Pending:** the backend's first PR review changed its response shape and API prefix — this
frontend has **not** been updated to match yet, so it is currently broken against the real
backend. See [docs/API_CONTRACT_SYNC_PLAN.md](docs/API_CONTRACT_SYNC_PLAN.md) for the exact,
self-contained plan to fix it.

## Tech Stack

- React 19 + TypeScript + Vite
- React Router DOM — routing, protected routes
- Redux Toolkit + React Redux — global state, typed slices/thunks
- React Hook Form + Zod — form state and validation
- Axios — typed API layer

## Prerequisites

- Node.js **20.19+** or **22.12+** (required by Vite 8 — check with `node -v`; if you're on an older version, use [nvm](https://github.com/nvm-sh/nvm) to install/switch: `nvm install --lts && nvm use --lts`)

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the printed `http://localhost:5173` URL in your browser. Vite's HMR will reflect code changes automatically.

## Backend Integration Status

Each feature is switched between the mock API and the real backend independently via its own env
flag — see `.env.example`:

- **Auth** (`VITE_USE_MOCK_AUTH_API`) — **live against the real NestJS backend** (Part 1 complete:
  signup, email verification, login/logout, session rehydration, forgot/reset password).
- **Todos + Collaboration** (`VITE_USE_MOCK_TODOS_API`) — **live against the real NestJS backend**
  (Part 1 complete: full CRUD, ownership-enforced. Part 2 complete: invite/list/remove
  collaborators by email, permission-aware editing).

Both require the backend running locally at `VITE_API_BASE_URL` (see `backend/README.md`).

Notes:
- Set either flag to `true` to fall back to that feature's mock implementation (no backend needed)
  — the mock API mirrors the real backend's collaboration rules too (see `src/api/mock/`).
- The mock auth flow shows verification/reset links directly on screen (no real email sender); the
  real backend does the same outside production mode, in addition to actually sending an email.
- Every feature's API file (`src/features/auth/authApi.ts`, `src/features/todos/todosApi.ts`,
  `src/features/todos/collaboratorsApi.ts`) is the single swap point per feature — components,
  slices, and thunks never know which is active.
- To reset the todos/collaborators mock data, clear the browser's `localStorage` for this site.
- Collaboration UI: each todo has a "Share" toggle showing who has access. Only the owner sees the
  invite form and "Remove" buttons; a collaborator sees a read-only list and a "Shared with you"
  badge, and cannot rename or delete the todo (both hidden client-side and 403'd server-side).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
├── app/            # Redux store + typed hooks
├── api/            # Shared axios client, config, mock backend
├── features/
│   ├── auth/       # Login, Signup, Verify Email, Forgot/Reset Password
│   └── todos/      # Todo list, form, item, CRUD state, collaborators (invite/list/remove)
├── routes/         # AppRouter, ProtectedRoute, PublicOnlyRoute, NotFoundPage
├── components/     # Shared UI (Button, TextField, FormError, Spinner)
└── types/          # Shared cross-feature types (User, Todo, AuthSession)
```
