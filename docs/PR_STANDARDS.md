# Frontend PR Standards — Quick Reference

Consolidates `best_practices.md` + `pr_compliance_checklist.yaml` from `frontend_QODO_files/`
into one file to check **before writing code and before opening a PR**. Read the originals only
if you need the full rationale or a longer example — everything you need to comply day-to-day is
here.

Every PR is scored against these 17 weighted rules. 0 violations → passing score; 4+ violations →
near-zero score. Treat every row below as a hard requirement, not a suggestion.

## The 17 Rules

| # | Rule | Weight | One-line requirement |
|---|---|---|---|
| 1 | Title & Description | 5% | Title says what it does; description covers **what/why/how** |
| 2 | Single Responsibility | 5% | One feature per PR |
| 3 | Readme Updated | 4% | New components/hooks/env vars/setup steps documented in `README.md` |
| 4 | Environment Variables | 5% | No hardcoded URLs/keys/flags — use `import.meta.env.VITE_*` |
| 5 | MVC Pattern | 4% | View (component) → Controller (hook) → Model (Redux) — no business logic in components |
| 6 | Shy Code | 5% | **Max 23 lines per function** — extract sub-components/helpers past that |
| 7 | SOLID | 5% | One function/class = one reason to change |
| 8 | DRY | 5% | No copy-pasted logic — extract a hook, util, or shared component |
| 9 | Naming (MERN) | 5% | `camelCase` vars/fns, `UPPER_SNAKE_CASE` constants, `PascalCase` classes |
| 10 | Comments | 4% | A short comment above every function explaining its purpose; `// TODO` for unfinished work |
| 11 | No Dead Code | 4% | No `console.log`, no commented-out code, no unused imports |
| 12 | Error Handling | 4% | Every API call has try/catch, a real error message, and cleans up (abort/unsubscribe) |
| 13 | Styling | 5% | Class names in **snake_case** (`todo_item`, not `todo-item`); CSS variables for colors/fonts; no duplicate styles; no static inline `style={{}}` |
| 14 | Reusability | 5% | Repeated JSX → component; repeated logic → hook/util |
| 15 | Component Naming | 5% | `PascalCase` components + filenames; `camelCase` instances |
| 16 | Routing | 5% | Real 404 page (not a silent redirect); protected routes actually gate access |
| 17 | State Management | 5% | Redux Toolkit (`createSlice`, `createAsyncThunk`, `configureStore`, typed hooks) — not raw `useState` for shared/global state |

## Do / Don't Cheat Sheet

- **Functions ≤ 23 lines.** If a component's JSX return plus its hooks push past that, split the
  JSX into a small named sub-component (`*FormFields`, `*Links`, `*Header`) or extract shared setup
  into a hook. This is the rule most likely to bite you — check it before every PR, not after.
- **CSS classes are snake_case**, always — `.auth_page`, not `.auth-page`. Two classes must never
  define identical styles; if they would, share one class or a CSS variable instead.
- **No `any`.** Type everything; if a shape is genuinely unknown, model it explicitly rather than
  escaping to `any`.
- **Every exported function/component/hook gets a one-line comment** above it stating its purpose.
  Trivial one-line inline handlers (`onClick={() => setX(true)}`) don't need one.
- **Redux, not ad-hoc `useState`**, for anything more than one component needs — slices live under
  `features/<name>/`, typed via `useAppDispatch`/`useAppSelector` (never the raw `react-redux`
  hooks).
- **Env config only** — `VITE_*` vars via `import.meta.env`, read through `api/config.ts`. Never a
  hardcoded API URL or feature flag in component code.
- **`.env` and secrets are never committed** — only `.env.example` (with placeholder/no values) is
  tracked. If you generate real credentials locally, they belong in a gitignored `.env`, full stop.
- **A real 404 page**, not a redirect. Unknown routes should say "not found," not silently bounce
  the user somewhere else.
- **API calls**: try/catch with a real message shown to the user, and clean up in-flight
  requests/subscriptions in `useEffect`'s cleanup function.

## Before You Open a PR

1. `npm run lint` and `tsc -b` both pass with zero errors.
2. Grep your diff for `console.log`, commented-out code, and unused imports — remove all of them.
3. Skim every new/changed function — none exceed 23 lines. If one does, extract before pushing.
4. Every new CSS class is snake_case; no inline `style={{}}` except genuinely dynamic values.
5. New env vars are in `.env.example`, read via `api/config.ts`, never hardcoded elsewhere.
6. New components/hooks/env vars are mentioned in `README.md`.
7. PR touches **one feature**. If it grew into two, split it.
8. PR title + description cover what/why/how (see `best_practices.md` §1 for the template).
