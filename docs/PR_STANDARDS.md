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
| 13 | Styling | 5% | SCSS Modules per component (see "Styling Architecture" below); CSS custom properties for colors/fonts; no duplicate style blocks; no static inline `style={{}}` |
| 14 | Reusability | 5% | Repeated JSX → component; repeated logic → hook/util |
| 15 | Component Naming | 5% | `PascalCase` components + filenames; `camelCase` instances |
| 16 | Routing | 5% | Real 404 page (not a silent redirect); protected routes actually gate access |
| 17 | State Management | 5% | Redux Toolkit (`createSlice`, `createAsyncThunk`, `configureStore`, typed hooks) — not raw `useState` for shared/global state |

## Do / Don't Cheat Sheet

- **Functions ≤ 23 lines.** If a component's JSX return plus its hooks push past that, split the
  JSX into a small named sub-component (`*FormFields`, `*Links`, `*Header`) or extract shared setup
  into a hook. This is the rule most likely to bite you — check it before every PR, not after.
- **Styling** — see the dedicated "Styling Architecture" section below; it supersedes the old
  "one global .css file per page, snake_case classes" approach.
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
4. Every new component has its own `*.module.scss` (or a documented reason it doesn't need one —
   see "Styling Architecture"); no inline `style={{}}` except genuinely dynamic values.
5. New env vars are in `.env.example`, read via `api/config.ts`, never hardcoded elsewhere.
6. New components/hooks/env vars are mentioned in `README.md`.
7. PR touches **one feature**. If it grew into two, split it.
8. PR title + description cover what/why/how (see `best_practices.md` §1 for the template).
9. Run `npx depcheck` (or eyeball `package.json`) before adding a dependency you're not 100% using
   yet, and before opening a PR that removed a feature — an unused dependency is a review comment
   waiting to happen (see "Project-Specific Conventions" below).
10. Any new route path is added to `routes/routes.constants.ts`, not hardcoded as a string literal.
11. Any new mutation (an API call that changes data, not just reads it) shows the user something on
    both success and failure — a toast (`features/toast/runWithToast.ts`) unless the page already
    has a more specific inline error slot (a form's `<FormError>`, for example).

## Styling Architecture

The stack is **Tailwind v4 + SCSS Modules**, not global `.css` files — this replaced the original
per-page `.css` files after a senior-engineer PR review. Both tools have a distinct job; don't use
one where the other fits better:

- **Tailwind utility classes** (`className="flex items-center gap-3"`) — for simple, one-off
  structural/layout styling directly in JSX. Good for spacing, flex layout, and anything you'd
  otherwise write as a 1-3 property CSS rule with no reuse. See `Spinner.tsx` and
  `TodoListPage.tsx`'s header-actions `<div>` for real examples.
- **`*.module.scss`** — for anything with more than a couple of rules, pseudo-selectors, nesting,
  animations, or that composes a shared placeholder/mixin. One per component/page, imported as
  `import styles from './Thing.module.scss'` and referenced as `styles.someClass` (not a string
  literal — CSS Modules hash the name per file).

Target structure (already in place — follow it for anything new):

```
src/
├── styles/
│   ├── global.scss        # tokens + shared cross-file classes (see below) — imported once in main.tsx
│   ├── tailwind.css        # `@import 'tailwindcss';` ONLY — see note below on why it's separate
│   ├── _tokens.scss        # CSS custom properties: colors, fonts (@use'd by global.scss)
│   ├── _mixins.scss        # @mixin focus-ring, etc. — parameterized, shared behavior
│   └── _placeholders.scss  # %card, %auth_card, %panel — @extend'd from page modules
├── components/
│   ├── Button.tsx + Button.module.scss
│   ├── FormError.tsx + FormError.module.scss
│   ├── Spinner.tsx           # Tailwind only, no module — nothing left to scope
│   └── TextField.tsx         # composes only global classes, no module — see below
└── features/
    ├── auth/     (LoginPage.tsx + LoginPage.module.scss, ...)
    └── todos/    (TodoItem.tsx + TodoItem.module.scss, ...)
```

**Why `tailwind.css` is a separate plain `.css` file, not part of `global.scss`:** putting
`@import 'tailwindcss';` inside a `.scss` file makes Sass try to resolve/compile it as a legacy Sass
import, which both prints a deprecation warning and — worse — lets Tailwind's `@theme`/`@layer`
output get re-processed by Vite's CSS minifier in a way it doesn't fully understand, bloating the
bundle (25KB vs. 9.7KB in testing). Keep them as two separate imports in `main.tsx`.

**Placeholders (`%name`) vs. mixins (`@mixin name`)** — use a placeholder (`@extend %card;`) when
every user wants the *exact same* declarations verbatim (that's the whole point: one source of
truth, referenced, not copy-pasted). Use a mixin (`@include focus-ring;`) when the shared behavior
takes parameters or varies slightly per call site. Note: `@extend`ing the same placeholder from
multiple *.module.scss files dedupes the **source** (change it once, every page updates) but not
the **compiled output** (each CSS Module compiles independently, so the properties still appear
once per file in the final CSS) — that's expected, not a bug.

**When a component doesn't need its own `.module.scss`:** if, after moving out anything genuinely
shared, there's nothing left to scope (e.g. `TextField.tsx` composes only global `ui_field`/
`ui_input`/`ui_field_error` classes), don't create an empty module file — say so in a one-line
comment instead, so the next person doesn't wonder if you forgot it.

**Global classes still exist, deliberately, for one reason: cross-file raw string usage.** A class
referenced by a literal string from more than one component's JSX (not just the component that
"owns" it) can't be scoped into either owner's CSS Module without breaking the other call sites.
Example: `TodoForm.tsx` and `TodoItem.tsx` both render a raw `<input className="ui_input">` rather
than going through `<TextField>` — so `.ui_input` has to stay a global class in `global.scss`, not
`TextField.module.scss`. If you hit this, either (a) keep the class global and add a comment
explaining why (this is fine, not a hack), or (b) refactor the other call sites to use the owning
component instead, if that's a reasonable change to make. New global classes are still
**snake_case** (`.ui_field_error`); CSS Module class names are plain **camelCase** (`.headerRow`,
not `.header_row`) since they're accessed as JS object properties (`styles.headerRow`).

## Project-Specific Conventions (from senior-engineer PR review)

These came out of a real review of this repo's first PR and are now hard requirements:

**No unused dependencies.** `socket.io-client` was added ahead of the Part 3 (real-time
notifications) work and sat unused for two PRs before review caught it. Don't add a package until
the PR that actually imports it; if you remove the last usage of a package, remove the package too.

**Reusable UI feedback (toasts).** Every mutation (add/update/delete a todo, login, logout, etc.)
must tell the user whether it worked — see `features/toast/`. `runWithToast(dispatch, action,
successMessage?)` wraps a dispatch in try/catch, showing an error toast on failure always, and a
success toast only if you pass a message (skip it for noisy/obvious actions like a checkbox
toggle). This isn't just nice UX — before this, a failed `addTodo`/`updateTodo`/`deleteTodo` was an
unhandled promise rejection with zero user-facing feedback, a real bug this fixes. Prefer a toast
over inventing a new inline error slot, unless the page already has one (a form's `<FormError>`
stays the primary feedback for its own submit failures — don't *also* toast the same error).

**Constants over magic strings.** Anything referenced from more than one file — route paths
(`routes/routes.constants.ts`), durations (`features/toast/toast.constants.ts`), etc. — gets a
named constant, not a repeated string/number literal. If you're about to write a route path as a
string for the second time anywhere in the app, it should already be in `ROUTES`.
