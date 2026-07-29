# react-sample-app

A Task Manager frontend built as part of a company web development training plan (React, TypeScript, Redux Toolkit, NestJS). It covers the full app:

- **Auth** — login, signup, email verification, forgot/reset password, session rehydration.
- **Todos** — full CRUD, scoped to the logged-in user.
- **Collaboration** — invite other users onto a todo by email, with permission-aware editing (only the owner can rename/delete/manage collaborators).
- **Deadlines & notifications** — set a per-todo deadline, plus an in-app notification bell that updates in real time over a WebSocket (collaborator invites and deadline reminders).

It is fully integrated with the real NestJS backend (see [`backend/`](../backend)). See [docs/FRONTEND_PRACTICE_PLAN.md](docs/FRONTEND_PRACTICE_PLAN.md) for the development plan and architecture decisions.

Before writing code or opening a PR, check [docs/PR_STANDARDS.md](docs/PR_STANDARDS.md) — a condensed, one-file reference for this repo's code standards and PR review checklist.

## Tech Stack

- React 19 + TypeScript + Vite
- React Router DOM — routing, protected routes
- Redux Toolkit + React Redux — global state, typed slices/thunks
- React Hook Form + Zod — form state and validation
- Axios — typed API layer
- socket.io-client — real-time notification bell (Part 3)

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
- **Todos + Collaboration + Notifications** (`VITE_USE_MOCK_TODOS_API`) — **live against the real
  NestJS backend** (Part 1: full CRUD, ownership-enforced. Part 2: invite/list/remove collaborators
  by email, permission-aware editing. Part 3: per-todo deadlines + in-app notifications). This one
  flag also switches the notifications API, since it's the same Todo domain/backend.

Both require the backend running locally at `VITE_API_BASE_URL` (now `http://localhost:3000/api/v1`
— see `backend/README.md`).

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
- Deadlines (Part 3): each todo shows its deadline (overdue ones flagged); the owner gets a
  datetime-local picker to set or clear it (owner-only, must be a future date — validated server-
  side). `POST /todos` still only takes a title, so a deadline is always set via the item, not the
  create form.
- Notifications (Part 3): a bell in the header (`features/notifications/`) shows an unread badge and
  a dropdown list; clicking an unread one marks it read. Against the real backend it also opens a
  Socket.io connection (to `API_ORIGIN`, authenticated with the JWT) and prepends notifications
  pushed in real time — collaborator invites immediately, and deadline reminders from the backend
  cron. In mock mode there's no socket; invites still land in the list (no real-time push, no
  deadline cron).

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
