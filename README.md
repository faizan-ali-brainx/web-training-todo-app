# react-sample-app

A Task Manager frontend built as part of a company web development training plan (React, TypeScript, Redux Toolkit, NestJS). This repo currently covers the **Frontend Practice Task**: authentication (Login, Signup, Email Verification, Forgot/Reset Password) and a Todo module with full CRUD, scoped to the logged-in user.

See [docs/FRONTEND_PRACTICE_PLAN.md](docs/FRONTEND_PRACTICE_PLAN.md) for the full development plan, architecture decisions, and progress checklist.

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
npm run dev
```

Open the printed `http://localhost:5173` URL in your browser. Vite's HMR will reflect code changes automatically.

## Mock API

There's no backend yet (it arrives on Day 5 of the training plan, built with NestJS). Until then, this app runs against an **in-memory mock API** (`src/api/mock/`) backed by `localStorage`, so data survives page reloads. Notes:

- No real emails are sent — signup and forgot-password flows show the verification/reset link directly on screen instead.
- Every feature's API file (`src/features/auth/authApi.ts`, `src/features/todos/todosApi.ts`) is the single swap point for later: once the real API is ready, only those two files change — components, slices, and thunks don't.
- To reset all mock data (users, todos, sessions), clear the browser's `localStorage` for this site.

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
│   └── todos/      # Todo list, form, item, CRUD state
├── routes/         # AppRouter, ProtectedRoute, PublicOnlyRoute
├── components/     # Shared UI (Button, TextField, FormError, Spinner)
└── types/          # Shared cross-feature types (User, Todo, AuthSession)
```
