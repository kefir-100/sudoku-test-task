# Sudoku — Angular 21 Test Task Design Spec

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Author         | Kostiantyn Nikiforov                                       |
| Created        | 2026-05-20                                                 |
| Status         | **IMMUTABLE — DO NOT EDIT**                                |
| Customer       | Zensar (acting for an iGaming client)                      |
| Role           | Senior Angular Developer                                   |
| Source brief   | `Software Engineer Frontend Assessment.pdf` (in repo root) |
| Interview lens | `Interview questions.txt` (in repo root)                   |
| Progress log   | `2026-05-20-sudoku-angular-progress.md` (sibling file)     |

> **Rule of this document:** this plan is the single source of truth for the task scope, architecture, and conventions. Any deviation discovered during implementation MUST be logged in the progress file, not by editing this spec. If a deviation is so significant that the spec is no longer accurate, write a new dated spec file rather than mutating this one.

---

## 1. Hard Rules — Code Conventions (verbatim, immutable)

1. **No magic strings.** Every string lives in a static config file or `const APP_CONFIG = {} as const`. This covers API endpoint paths, difficulty values, storage keys, route paths, snackbar messages.
2. **No inline model definitions.** Each interface/type/enum lives in its own file under a `models/` (or domain-appropriate) folder. Never declare models inside a service or component file.
3. **Strict types.** Never `any`. Minimize `unknown`. Prefer TypeScript built-in utility types (`Readonly`, `Pick`, `Omit`, `Partial`, `NonNullable`, `ReturnType`).
4. **`type` vs `interface`.** `type` for unions, aliases, and utility-type compositions. `interface` for public API shapes that may be extended. Prefer **generics** over locking a function/class to a single concrete type, when it preserves type safety.
5. **`let` and `const` only.** Never `var`.
6. **Modern JavaScript.** Use classes, `Array.map`/`Array.reduce`, `Object.keys`/`Object.entries`, `Map`, `Set`, `Promise.withResolvers`, etc. Consider Core Web Vitals where the choice affects performance.
7. **Optional chaining (`?.`) and nullish coalescing (`??`).** Never use `&&` as a nullish guard, never use `||` to default `0`/`''`/`false` away.
8. **ESLint + Prettier + Stylelint.** All wired to npm scripts.
9. **Unit tests for every class, service, component, pipe, helper.** Vitest via `@angular/build:unit-test`.
10. **Semantic HTML.** Use `<header>`, `<main>`, `<footer>`, `<nav>`, `<menu>`, `<section>`, `<article>`, `<output>`, `<dialog>`, `<h1>`–`<h6>`, `<p>`. The Sudoku grid uses `role="grid"`/`role="row"`/`role="gridcell"` (per WAI-ARIA Grid pattern for interactive grids).
11. **No inline CSS.** All styles in component CSS files or `styles.css`/`tailwind.css`. No `style="..."` attributes.
12. **DRY / KISS / Single Source of Truth.** Store holds canonical state; components are projections.
13. **Readable names.** No abbreviations. Examples: `runSudokuGame`, `ApiService`, `ErrorHandlerService`, `GameDifficultyLevel`, `SudokuCellComponent`.

---

## 2. Meta-Rules — Process Conventions

- **This document is immutable** once approved. Track changes/deviations in the progress file.
- **Progress file is living.** Every step completion is logged with date + status. Every deviation logged with rationale.
- **One-clone reproducibility.** Customer must be able to run:
  ```bash
  git clone <repo-url>
  cd sudoku-test-task
  npm install
  npm run serve:local
  ```
  …and play the game with **zero additional setup**. No global packages, no env vars, no secrets, no missing services.
- **Lockfile is committed** (`package-lock.json`).
- **Husky `prepare` script is CI-guarded** (`is-ci || husky`) so clone-and-install never fails on a CI runner or a customer's fresh clone if `.git/hooks` isn't installable.
- **Angular CLI is invoked via the local binary** (npm scripts), not via a globally-installed `ng`.
- **All commands are cross-platform** (work on Windows, macOS, Linux). No bash-only constructs in npm scripts.

---

## 3. Scope

### 3.1 Required (from PDF — non-negotiable)

- Sudoku 9×9 board displayed on game-page load.
- Difficulty selection: `easy`, `medium`, `hard`, `random`.
- User may enter numbers into empty cells only; prefilled cells are read-only.
- **Validate** button → `POST /validate` → display `solved` / `broken`.
- **Solve** button → `POST /solve` → display solution; handle `solved` / `broken` / `unsolvable`.
- Use Angular as the primary framework.

### 3.2 In Scope for v1 (accepted from clarification phase)

- **Welcome page** at `/` with title, illustration, and "Start Sudoku" CTA.
- **Game page** at `/play`, lazy-loaded.
- Game page initial state: difficulty selector (default `random`), "Start Game" button, board shown disabled/blurred.
- On "Start Game": progress bar, button disabled, API call → board fills → Validate + Solve buttons appear; Validate disabled until first user input; "Start Game" becomes "New Game".
- "New Game" button shows confirm dialog if the user has any entries.
- Resolved difficulty is shown next to the board after fetch. While the game is in progress the label reflects what the user _asked for_ (literally `"random"` if that's what they picked). When the user clicks **Solve**, `SolveResponse.difficulty` reveals the actual difficulty the server chose, and the label is updated. No second API call is made just to learn the difficulty (see §6.4 for the full rationale).
- **Default difficulty `random` is passed through to the API** — no client-side picking.
- **3 distinct visual cell states**: prefilled (immutable), user-entered (valid format), user-entered (conflict). Plus a **4th state** when the solver fills cells: solver-filled (italic).
- **Highlight related cells** on focus (same row, same column, same 3×3 box).
- **Highlight same-number cells** on focus.
- **Keyboard navigation**: arrow keys move focus across cells; digits 1–9 enter value; `0`, `Backspace`, `Delete` clear value; `Tab`/`Shift+Tab` skip prefilled cells; `Esc` blurs.
- **User may replace any value in a user-entered cell** (Sudoku-standard UX). Prefilled cells remain immutable.
- **Snackbar feedback** (MatSnackBar) for game-flow outcomes; duration **6 seconds**.
- **Explicit Empty / Loading / Error components** — not hidden divs.
- **localStorage persistence** of `{ difficulty, originalBoard, currentBoard }` only — restored on Game-page load. Backed by abstract `StorageProvider` + `LocalStorageService` + `GameStateStorageService` (see §6.5).
- **Mobile-first responsive layout**: CSS Grid, `clamp()` typography, `vw`/`vh`/`rem`, container `min-width` guard so the layout cannot collapse below the smallest meaningful size.
- **ApiService** owns all HTTP. Components and store never call `HttpClient` directly.
- **ErrorHandlerService** intercepts API/runtime errors, normalizes them, and dispatches user-friendly snackbars.
- **Mapping service** translates raw API responses to UI models (kept separate because Sugoku's wire format — boards as `number[][]` with `0` for empties — is not the UI shape we want).
- **HTTP interceptor** that serializes JSON request bodies to `application/x-www-form-urlencoded` for the Sugoku base URL (Sugoku doesn't accept JSON; this isolates the constraint to one file).
- **Husky + lint-staged** pre-commit hooks (lint + format on staged files).
- **Vitest** unit tests for: every service, the store, every component, every pipe, every helper, the interceptor, the storage abstraction.
- **README.md** with: prerequisites, install/run/test/build instructions, architecture summary, interview-question mapping, deferred features section, bundle-audit walkthrough using `source-map-explorer`.

### 3.3 Deferred (v1.1+ — documented in README, not implemented)

- Multiplayer mode.
- Game timer.
- Undo / history.
- Mobile number-pad overlay component.
- Server-side rendering (SSR).

---

## 4. Tech Stack

| Layer            | Choice                                                                        | Version               | Notes                                                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | Angular                                                                       | 21.x                  | Zoneless **by default** in v21 — no `provideZonelessChangeDetection()` needed; we simply don't include zone.js.                                                     |
| Language         | TypeScript                                                                    | ships with Angular 21 | `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.                                                                         |
| UI components    | Angular Material + CDK                                                        | 21.x                  | `<mat-select>`, `<mat-form-field>`, `<button mat-flat-button>`, `MatProgressBar`, `MatSnackBar`, `MatDialog`, `A11yModule` (`FocusKeyManager`).                     |
| Styling          | Tailwind CSS                                                                  | 4.x                   | CSS-first config in `styles.css` via `@theme`. Preflight scoped via `@layer` so it doesn't reset Material's component styles.                                       |
| HTTP             | `@angular/common/http` provideHttpClient()                                    | 21.x                  | With custom `formUrlEncodedInterceptor`.                                                                                                                            |
| Reactivity       | Signals + minimal RxJS                                                        | 21.x                  | RxJS used only inside `ApiService` (HTTP returns Observables) and where `switchMap` cancellation pays off (Validate/Solve clicks). Everywhere else: signals.        |
| Forms            | Reactive Forms + Signals                                                      | 21.x                  | Cell value model holds signals; difficulty select uses `FormControl<GameDifficultyLevel>` because Material `<mat-select>` integrates naturally with reactive forms. |
| Routing          | `@angular/router`                                                             | 21.x                  | Standalone, lazy-loaded `/play`.                                                                                                                                    |
| Test runner      | Vitest                                                                        | latest                | Via `@angular/build:unit-test` builder (stable in v21).                                                                                                             |
| Test environment | jsdom                                                                         | latest                | Required by Vitest for component DOM.                                                                                                                               |
| Coverage         | `@vitest/coverage-v8`                                                         | latest                | `npm run test:coverage`.                                                                                                                                            |
| Lint (TS)        | ESLint + `@angular-eslint/*` + `typescript-eslint` + `eslint-config-prettier` | latest                | `npm run lint`, `npm run lint:fix`.                                                                                                                                 |
| Format           | Prettier + `prettier-plugin-tailwindcss`                                      | latest                | `npm run format`, `npm run format:check`.                                                                                                                           |
| Lint (CSS)       | Stylelint + `stylelint-config-standard` + `stylelint-config-tailwindcss`      | latest                | `npm run stylelint`, `npm run stylelint:fix`.                                                                                                                       |
| Git hooks        | Husky + lint-staged + `is-ci`                                                 | latest                | Pre-commit: lint-staged runs Prettier + ESLint + Stylelint on staged files.                                                                                         |
| Bundle audit     | `source-map-explorer`                                                         | latest                | `npm run analyze` script documented in README.                                                                                                                      |

**Explicitly NOT added:**

- `@ngrx/store`, `@ngrx/signals` — overkill for 81 cells; the custom signal store gives the same SSOT guarantees with zero extra dep weight (smaller bundle answers interview Q5).
- Zone.js — not installed.
- Karma / Jasmine — replaced by Vitest.

---

## 5. Folder Structure

```
sudoku-test-task/
├── .husky/
│   └── pre-commit
├── docs/
│   └── superpowers/
│       └── specs/
│           ├── 2026-05-20-sudoku-angular-design.md   ← this file (immutable)
│           └── 2026-05-20-sudoku-angular-progress.md ← living progress log
├── public/
│   └── (favicon, sudoku illustration svg)
├── src/
│   ├── app/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── core/
│   │   │   ├── config/
│   │   │   │   ├── app-config.ts            ← APP_CONFIG, API_ROUTES, STORAGE_KEYS, SNACKBAR_MESSAGES
│   │   │   │   └── app-config.spec.ts
│   │   │   ├── api/
│   │   │   │   ├── sudoku-api.service.ts
│   │   │   │   ├── sudoku-api.service.spec.ts
│   │   │   │   ├── form-url-encoded.interceptor.ts
│   │   │   │   ├── form-url-encoded.interceptor.spec.ts
│   │   │   │   └── encode-board.helper.ts
│   │   │   ├── errors/
│   │   │   │   ├── error-handler.service.ts
│   │   │   │   └── error-handler.service.spec.ts
│   │   │   ├── mapping/
│   │   │   │   ├── board-mapping.service.ts
│   │   │   │   └── board-mapping.service.spec.ts
│   │   │   └── storage/
│   │   │       ├── storage-provider.ts            ← abstract class (DI token)
│   │   │       ├── local-storage.service.ts
│   │   │       ├── local-storage.service.spec.ts
│   │   │       ├── game-state-storage.service.ts
│   │   │       └── game-state-storage.service.spec.ts
│   │   ├── models/
│   │   │   ├── game-difficulty-level.ts          ← type GameDifficultyLevel
│   │   │   ├── sudoku-board.ts                   ← interface SudokuBoard, SudokuCell
│   │   │   ├── sudoku-api-response.ts            ← wire types (BoardResponse, SolveResponse, …)
│   │   │   ├── game-snapshot.ts                  ← localStorage payload
│   │   │   ├── game-status.ts                    ← idle | loading | playing | finished | error
│   │   │   └── game-state.ts                     ← store state shape
│   │   ├── features/
│   │   │   ├── welcome/
│   │   │   │   ├── welcome.component.ts
│   │   │   │   ├── welcome.component.html
│   │   │   │   ├── welcome.component.css
│   │   │   │   └── welcome.component.spec.ts
│   │   │   └── game/
│   │   │       ├── game.routes.ts                ← lazy entry point
│   │   │       ├── game-page.component.{ts,html,css,spec.ts}
│   │   │       ├── sudoku.store.ts               ← signal store
│   │   │       ├── sudoku.store.spec.ts
│   │   │       └── components/
│   │   │           ├── difficulty-selector/
│   │   │           ├── sudoku-board/
│   │   │           ├── sudoku-cell/
│   │   │           ├── game-controls/
│   │   │           ├── loading-indicator/
│   │   │           ├── empty-state/
│   │   │           ├── error-state/
│   │   │           └── new-game-confirm-dialog/
│   │   ├── shared/
│   │   │   ├── pipes/
│   │   │   │   ├── coalesce-empty.pipe.ts        ← `0 -> ''`
│   │   │   │   └── coalesce-empty.pipe.spec.ts
│   │   │   └── directives/
│   │   │       ├── digit-only.directive.ts       ← restricts input to 1-9 (and Backspace/Delete)
│   │   │       └── digit-only.directive.spec.ts
│   │   └── styles/
│   │       ├── _layers.css                       ← @layer ordering for Material+Tailwind coexistence
│   │       └── _theme.css                        ← Material M3 theme tokens
│   ├── styles.css                                ← imports Tailwind + layers + theme
│   ├── index.html
│   └── main.ts
├── .editorconfig
├── eslint.config.mjs                              ← ESLint flat config
├── .prettierrc.json
├── .stylelintrc.json
├── .gitignore
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── vitest.config.ts
└── README.md
```

---

## 6. Architecture

### 6.1 Layered model

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENTS  (presentation; OnPush + signal inputs everywhere)  │
│   - WelcomeComponent                                            │
│   - GamePageComponent                                           │
│     ├── DifficultySelectorComponent                             │
│     ├── GameControlsComponent                                   │
│     ├── SudokuBoardComponent                                    │
│     │     └── SudokuCellComponent (× 81 via @for + track)        │
│     ├── LoadingIndicatorComponent                               │
│     ├── EmptyStateComponent                                     │
│     └── ErrorStateComponent                                     │
└─────────────────────────────────────────────────────────────────┘
                              │ reads signals  │ calls actions
                              ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STORE  (SudokuStore)                            │
│  - signals: status, difficulty, board, focusedCellId,            │
│    relatedCellIds, sameNumberCellIds, conflictCellIds,           │
│    validationResult, solveResult, error                          │
│  - computed: canValidate, canSolve, hasUserEntries,              │
│              resolvedDifficulty                                  │
│  - actions: startGame, enterDigit, clearCell, validate, solve,   │
│    confirmNewGameIfNeeded, focusCell, restoreFromStorage, reset  │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
┌─────────────────────┐ ┌──────────────┐ ┌────────────────────────┐
│  SudokuApiService   │ │ BoardMapping │ │ GameStateStorageService│
│  (HttpClient)       │ │   Service    │ │ ▶ StorageProvider      │
│  - getBoard()       │ │ - toUiBoard  │ │   (abstract)           │
│  - solveBoard()     │ │ - toWire     │ │ ▶ LocalStorageService  │
│  - validateBoard()  │ │ - cells()    │ │                        │
└─────────────────────┘ └──────────────┘ └────────────────────────┘
        │ HTTP
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  formUrlEncodedInterceptor  (encodes POST bodies for Sugoku)    │
│  HttpClient                                                      │
└─────────────────────────────────────────────────────────────────┘

Plus ErrorHandlerService — invoked by ApiService catchError and by
Angular's global ErrorHandler (registered via { provide: ErrorHandler,
useClass: ErrorHandlerService }).
```

### 6.2 SudokuStore — public API

```ts
@Injectable({ providedIn: 'root' })
export class SudokuStore {
  // --- reads ---
  readonly status: Signal<GameStatus>; // idle | loading | playing | finished | error
  readonly difficulty: Signal<GameDifficultyLevel | null>;
  readonly board: Signal<SudokuBoard | null>;
  readonly focusedCellId: Signal<number | null>;
  readonly relatedCellIds: Signal<ReadonlySet<number>>; // same row/col/3x3 box as focused cell
  readonly sameNumberCellIds: Signal<ReadonlySet<number>>; // same value as focused cell (≠ 0)
  readonly conflictCellIds: Signal<ReadonlySet<number>>; // cells whose value breaks Sudoku rules
  readonly validationResult: Signal<ValidateApiStatus | null>; // 'solved' | 'broken' (API enum)
  readonly solveResult: Signal<SolveApiStatus | null>; // 'solved' | 'broken' | 'unsolvable' (API enum)
  readonly error: Signal<NormalizedError | null>;

  // --- computed ---
  readonly canValidate: Signal<boolean>; // hasUserEntries && !loading
  readonly canSolve: Signal<boolean>; // board exists && !loading
  readonly hasUserEntries: Signal<boolean>; // any cell.userValue !== 0 && !prefilled
  readonly resolvedDifficulty: Signal<GameDifficultyLevel | null>; // what the server actually gave us

  // --- actions ---
  startGame(difficulty: GameDifficultyLevel): void;
  confirmNewGameIfNeeded(nextDifficulty: GameDifficultyLevel): Promise<boolean>; // returns true if proceeded
  enterDigit(cellId: number, digit: number): void; // 1-9
  clearCell(cellId: number): void;
  focusCell(cellId: number | null): void;
  validate(): void;
  solve(): void;
  restoreFromStorage(): void;
  reset(): void;
}
```

Implementation notes:

- All state lives in **private writable signals**; only readonly signals exposed.
- Updates are **immutable** (`signal.update(state => ({ ...state, ... }))`) — required for OnPush correctness even in zoneless (a reference change triggers signal-dependent views).
- **Persistence is driven by a single `effect()`** that reads `board()` and `difficulty()` and writes a `GameSnapshot` to storage whenever either changes. Every action that mutates the board (`startGame`, `enterDigit`, `clearCell`, `solve`) therefore persists automatically — there are no manual `save()` calls scattered through the action methods. Writes are debounced 250 ms so a burst of keyboard input doesn't hammer `localStorage`. See §6.6 for the full trigger table.
- `validate()` and `solve()` use RxJS `switchMap` internally so the latest click wins and stale requests are cancelled.

### 6.3 ApiService — public API

```ts
@Injectable({ providedIn: 'root' })
export class SudokuApiService {
  getBoard(difficulty: GameDifficultyLevel): Observable<RawBoardResponse>;
  solveBoard(board: RawBoard): Observable<RawSolveResponse>;
  validateBoard(board: RawBoard): Observable<RawValidateResponse>;
}
```

- Returns **raw wire types** (`RawBoard = number[][]`). Mapping to UI shapes is the mapping service's job (separation of concerns + testability).
- All errors propagate to `catchError` in the store, which dispatches to `ErrorHandlerService` → snackbar.

### 6.4 HTTP interceptor

```ts
export const formUrlEncodedInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(APP_CONFIG.api.baseUrl)) return next(req);
  if (req.method !== 'POST') return next(req);

  const body = req.body as Record<string, unknown> | null;
  const encodedBody = body ? encodeFormUrlEncoded(body) : null;

  const formReq = req.clone({
    body: encodedBody,
    setHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return next(formReq);
};
```

- `encodeFormUrlEncoded` uses the helper functions from the Sugoku README, adapted to TypeScript and unit-tested with the example board from the README.
- The interceptor is the **only** place that knows about Sugoku's content-type quirk. If Sugoku later supports JSON, we delete one file.

#### Determining the resolved difficulty for `random`

Two paths considered; final choice **A**:

- **A. Track what we asked for.** When the user picks `random`, we display "Difficulty: random (server-chosen)" while waiting. After `getBoard` resolves we keep showing "random" with no second call. When the user later clicks **Solve**, the `SolveResponse.difficulty` field gives us the actual difficulty and we reveal it then. (Simple, no extra request.)
- B. Call `POST /grade` immediately after `random` fetch. Adds a second round-trip on every random game. Rejected.

### 6.5 Storage abstraction

```ts
// storage-provider.ts — abstract class doubles as DI token AND contract
export abstract class StorageProvider {
  abstract read<TValue>(key: string): TValue | null;
  abstract write<TValue>(key: string, value: TValue): void;
  abstract remove(key: string): void;
  abstract clear(): void;
}

// local-storage.service.ts
@Injectable({ providedIn: 'root' })
export class LocalStorageService extends StorageProvider {
  // JSON.parse/stringify with try/catch; QuotaExceededError → ErrorHandlerService → snackbar
}

// game-state-storage.service.ts — domain layer; consumes only the abstraction
@Injectable({ providedIn: 'root' })
export class GameStateStorageService {
  private readonly storage = inject(StorageProvider);

  saveSnapshot(snapshot: GameSnapshot): void { /* writes STORAGE_KEYS.gameSnapshot */ }
  loadSnapshot(): GameSnapshot | null { /* validates shape; returns null on mismatch */ }
  clearSnapshot(): void { /* removes STORAGE_KEYS.gameSnapshot */ }
}

// app.config.ts
{ provide: StorageProvider, useExisting: LocalStorageService }
```

`GameSnapshot` payload — the minimum to restore a game:

```ts
export interface GameSnapshot {
  readonly schemaVersion: 1;
  readonly difficulty: GameDifficultyLevel;
  readonly originalBoard: ReadonlyArray<ReadonlyArray<number>>; // server-provided, used to know which cells are prefilled
  readonly currentBoard: ReadonlyArray<ReadonlyArray<number>>; // user-entered state
}
```

- `schemaVersion` lets us reject stale snapshots without crashes.
- Restore happens once on `GamePageComponent` init via `store.restoreFromStorage()`.

### 6.6 Persistence Triggers (when exactly we save / clear / restore)

A single `effect()` inside `SudokuStore` reads `board()` and `difficulty()` and writes a `GameSnapshot` whenever either signal changes. Because every state mutation flows through writable signals, _every_ board-changing action automatically persists — there are no manual `save()` calls scattered through the action bodies. The effect's writes are debounced **250 ms** so a burst of keyboard input doesn't hammer `localStorage`.

| Moment                                                      | What triggers it                                                                               | Snapshot written                                                                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Right after `GET /board` response is committed**          | `board` signal write at the end of `startGame()`                                               | `{ schemaVersion: 1, difficulty, originalBoard = server board, currentBoard = same as originalBoard (no user entries yet) }` |
| **After every digit the user enters**                       | `board` signal write inside `enterDigit()`                                                     | `{ difficulty, originalBoard (unchanged), currentBoard (with the new entry) }`                                               |
| **After every cell clear** (`Backspace`/`Delete`/digit `0`) | `board` signal write inside `clearCell()`                                                      | Same shape, user value reset to 0                                                                                            |
| **After `POST /solve` returns successfully**                | `board` signal write inside `solve()`                                                          | `{ difficulty, originalBoard (unchanged), currentBoard = full solved grid }`                                                 |
| **`POST /validate` returns**                                | _(no board mutation)_                                                                          | **Not persisted.** Validation is a read; it doesn't change game state.                                                       |
| **`POST /solve` returns `unsolvable`**                      | Board is left as-is                                                                            | **Not persisted.** No board change ⇒ no effect fire.                                                                         |
| **`New Game` confirmed**                                    | `startGame()` first calls `clearSnapshot()`, then the fresh GET response writes a new snapshot | Transient clear, then save                                                                                                   |
| **App load / `GamePageComponent` init**                     | `store.restoreFromStorage()` reads once via `GameStateStorageService.loadSnapshot()`           | Read-only. If snapshot found and `schemaVersion` matches, store is rehydrated; otherwise game starts in `idle`.              |
| **Reload mid-game**                                         | Browser refresh ⇒ same path as App load                                                        | Same as above; user picks up exactly where they left off, including which cells were prefilled vs. user-entered              |

Notes:

- The snapshot must always carry both `originalBoard` and `currentBoard` together so the "prefilled vs. user-entered" distinction survives a reload — that distinction is computed by comparing the two on rehydrate.
- Returning to the Welcome page (`/`) does **not** clear the snapshot. The Welcome → Game flow is rehydration-friendly: clicking "Start Sudoku" lands on `/play`, which restores from storage if a snapshot exists.
- After **`solveResult: "unsolvable"`** the snapshot is intentionally left untouched. If the user reloads, they'll see exactly the broken board they had — they can then keep editing or start `New Game`.

### 6.7 Component contracts (signal-input based)

```ts
// sudoku-cell.component.ts
@Component({
  selector: 'app-sudoku-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  // …
})
export class SudokuCellComponent {
  readonly cell = input.required<SudokuCell>();
  readonly isFocused = input.required<boolean>();
  readonly isRelatedHighlight = input.required<boolean>();
  readonly isSameNumberHighlight = input.required<boolean>();
  readonly isConflict = input.required<boolean>();
  readonly isSolverFilled = input.required<boolean>();

  readonly digitEntered = output<number>();
  readonly cellCleared = output<void>();
  readonly focusRequested = output<void>();
}
```

- All inputs are signals; reading them in the template makes the cell view auto-update on signal change _without_ re-rendering siblings.
- Outputs are typed via `output<T>()` — the v18+ idiomatic replacement for `@Output() EventEmitter`.

---

## 7. Data Flow

### 7.1 Start Game

```
User: clicks "Start Game" (difficulty = "random")
  → GameControls emits startGame("random")
  → SudokuStore.startGame("random"):
       status ← "loading"
       difficulty ← "random"
  → ApiService.getBoard("random")  (HTTP GET)
  → BoardMappingService.toUiBoard(response.board)
  → SudokuStore commits:
       board ← uiBoard
       status ← "playing"
  → Effect persists snapshot to storage
  → SudokuBoard re-renders (signal-driven; only changed cells re-evaluate)
```

### 7.2 Enter Digit

```
User: focuses cell #34, types "7"
  → DigitOnlyDirective filters to 1-9
  → SudokuCell emits digitEntered(7)
  → SudokuStore.enterDigit(34, 7):
       board ← board with cell #34 userValue = 7
       conflicts recomputed (computed signal)
  → SudokuCell #34 re-renders (its `cell` input identity changed)
  → Conflicting cells re-render (their isConflict computed flipped)
  → Effect persists snapshot
  → canValidate computed becomes true → "Validate" button enables
```

### 7.3 Validate

```
User: clicks "Validate"
  → GameControls emits validate
  → SudokuStore.validate():
       status ← "loading"
  → ApiService.validateBoard(rawBoard)  (HTTP POST, interceptor form-encodes)
  → Response: { status: "solved" | "broken" }
  → SudokuStore commits:
       validationResult ← response.status   ("solved" | "broken")
       status ← (response.status === "solved" ? "finished" : "playing")
  → ErrorHandlerService (no error) → snackbar:
       solved  → "Puzzle is solved correctly. Well done!"
       broken  → "Current entries break Sudoku rules. Keep going."
```

### 7.4 Solve

```
User: clicks "Solve"
  → GameControls emits solve
  → SudokuStore.solve():
       status ← "loading"
  → ApiService.solveBoard(rawBoard)
  → Response: { difficulty, solution, status }
  → If status === "unsolvable":
       solveResult ← "unsolvable"
       status ← "playing"
       snackbar: "No solution from this state. Try New Game."
       board stays as-is  (no persistence change)
     Else:
       board cells whose user value !== solution[r][c] OR were empty
         → marked as solver-filled (italic)
       resolvedDifficulty ← response.difficulty
       solveResult ← response.status   ("solved" | "broken")
       status ← "finished"
       Effect persists snapshot  (currentBoard now = full solved grid)
       snackbar: "Solver filled the remaining cells (shown in italics)."
```

### 7.5 New Game (with existing entries)

```
User: clicks "New Game"
  → store.hasUserEntries() === true
  → MatDialog: "Start a new game? Current progress will be lost."
  → User confirms → store.startGame(currentDifficulty)
  → User cancels → no-op
```

---

## 8. Cell-State Visual Language

| State                           | Trigger                                                                          | Visual treatment                                                    |
| ------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Prefilled**                   | `isPrefilled` true                                                               | Bold weight, neutral text color, `cursor: default`, `tabindex="-1"` |
| **User-entered (valid format)** | `isPrefilled` false, `userValue !== 0`                                           | Regular weight, accent text color, focusable                        |
| **User-entered (conflict)**     | as above + value conflicts with row/col/box of another user-entered or prefilled | Red text, soft red background, `aria-invalid="true"`                |
| **Solver-filled**               | After Solve, server's solution differed from user value or cell was empty        | Italic, muted accent color                                          |
| **Empty**                       | `userValue === 0`, `isPrefilled` false                                           | Empty cell, focusable                                               |
| **Related highlight**           | Same row/col/3×3 box as focused cell                                             | Background tint (CSS variable `--sudoku-related-bg`)                |
| **Same-number highlight**       | `userValue` or `originalValue` matches focused cell's value (≠ 0)                | Stronger background tint (`--sudoku-same-bg`)                       |

Conflict detection is a **derived computed signal** in the store — never a separate event — so it can never lag behind state.

---

## 9. Mobile-First & Accessibility

- **Viewport meta tag** in `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />`.
- **CSS units**: `rem`/`em` for typography, `clamp(min, vw-based, max)` for fluid sizes, `min()`/`max()` for responsive cell sizing.
- **Min-width guard**: `body { min-width: 320px; }` so layouts can't break below the smallest meaningful mobile width.
- **Sudoku board**: CSS Grid (`grid-template-columns: repeat(9, minmax(1.5rem, 1fr))`), thick borders between 3×3 sub-grids via `:nth-child(3n)` selectors + `gap`.
- **Container queries** on `.sudoku-board` for component-local breakpoints (e.g., cell font-size).
- **A11y**:
  - WAI-ARIA Grid pattern (`role="grid"` / `role="row"` / `role="gridcell"`).
  - `aria-label` on the board ("Sudoku board").
  - `aria-invalid="true"` on conflict cells.
  - `aria-live="polite"` on the snackbar container (Material handles this).
  - `aria-disabled` on prefilled cells.
  - **Focus management**: CDK `FocusKeyManager` for arrow-key navigation. Tab/Shift-Tab skip prefilled cells via `tabindex="-1"`.
  - Color contrast ≥ WCAG AA on all cell states (verified in README via Lighthouse).
- **Prefers-color-scheme**: light + dark themes via CSS variables; toggleable manually but defaults to system preference.
- **Prefers-reduced-motion**: disables solver-fill animation and highlight transitions.

---

## 10. Testing Strategy

- **Vitest** for everything.
- **`@angular/build:unit-test`** builder; jsdom environment.
- **Coverage targets**: ≥ 90% statements, ≥ 85% branches across the project. (Reported, not enforced as CI gate — practical buffer.)
- **What we test**:

| Subject                                    | Tests                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `APP_CONFIG`, `API_ROUTES`, `STORAGE_KEYS` | Shape + immutability (`as const`)                                                                                  |
| `encodeBoard`, `encodeParams` helpers      | Match Sugoku README's expected output byte-for-byte using the README's example board                               |
| `formUrlEncodedInterceptor`                | Passes through non-POST, passes through other origins, form-encodes Sugoku POSTs, sets header                      |
| `SudokuApiService`                         | Calls right URL+method; deserializes; surfaces HTTP errors                                                         |
| `BoardMappingService`                      | `toUiBoard` produces correct `isPrefilled` flags; `toWire` round-trip is loss-free                                 |
| `LocalStorageService`                      | read/write/remove; handles `QuotaExceededError`; rejects malformed JSON                                            |
| `GameStateStorageService`                  | Saves/loads `GameSnapshot`; rejects wrong schemaVersion; clears                                                    |
| `ErrorHandlerService`                      | Maps HttpErrorResponse statuses to user-friendly snackbar text; logs to console in dev only                        |
| `SudokuStore`                              | Each action; conflict computation; canValidate/canSolve logic; storage effect; switchMap cancellation              |
| `DigitOnlyDirective`                       | Allows 1-9; blocks letters, symbols, 0; allows Backspace/Delete/Arrow keys                                         |
| `CoalesceEmptyPipe`                        | 0 → ''; n → String(n)                                                                                              |
| `SudokuCellComponent`                      | Renders value; emits digitEntered on input; prefilled is non-focusable                                             |
| `SudokuBoardComponent`                     | Renders 81 cells via @for; arrow-key navigation works; related / same-number / conflict highlight sets are correct |
| `DifficultySelectorComponent`              | Default "random"; emits selection changes; disabled while loading                                                  |
| `GameControlsComponent`                    | Buttons enable/disable per store state; New Game shows dialog when hasUserEntries                                  |
| `GamePageComponent`                        | Calls restoreFromStorage on init; renders the right state component (loading/empty/error/board)                    |
| `WelcomeComponent`                         | Navigates to /play on CTA click                                                                                    |
| `NewGameConfirmDialogComponent`            | Returns true on confirm, false on cancel                                                                           |

---

## 11. Tooling Detail

### npm scripts (full list, all cross-platform)

```json
{
  "scripts": {
    "start": "npm run serve:local",
    "serve:local": "ng serve --host 127.0.0.1 --port 4200 --open",
    "build": "ng build --configuration production",
    "build:dev": "ng build --configuration development",
    "test": "ng test",
    "test:watch": "ng test --watch",
    "test:coverage": "ng test --coverage",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "stylelint": "stylelint \"src/**/*.css\" --max-warnings 0",
    "stylelint:fix": "stylelint \"src/**/*.css\" --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "verify": "npm run lint && npm run stylelint && npm run format:check && npm run test",
    "analyze": "npm run build && source-map-explorer dist/sudoku-test-task/browser/*.js",
    "prepare": "is-ci || husky"
  }
}
```

### Tool configs

- **TypeScript**: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`.
- **ESLint**: flat config (`eslint.config.mjs`) using `@angular-eslint/eslint-plugin` + `@angular-eslint/eslint-plugin-template` + `typescript-eslint`, recommended rules + extras: no `any`, no non-null assertions, consistent type imports, member ordering for components, template no-negated-async, prefer signal inputs.
- **Prettier**: 100-char width, 2-space indent, single quotes, trailing commas, semicolons (matches global preferences in `~/.claude/CLAUDE.md`).
- **Stylelint**: standard config + tailwind preset; enforces lowercase hex, no `!important`, no inline-style equivalents in templates.
- **Husky pre-commit**: runs `lint-staged` which runs ESLint+Prettier on `*.{ts,html}` and Stylelint+Prettier on `*.css`.

---

## 12. Bootstrapping & Routing

### `main.ts`

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => {
  console.error(error);
});
```

### `app.config.ts`

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([formUrlEncodedInterceptor])),
    provideAnimationsAsync(),
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    { provide: StorageProvider, useExisting: LocalStorageService },
  ],
};
```

### `app.routes.ts`

```ts
export const routes: Routes = [
  { path: '', component: WelcomeComponent, title: APP_CONFIG.titles.welcome },
  {
    path: APP_CONFIG.routes.play,
    loadChildren: () => import('./features/game/game.routes').then((m) => m.gameRoutes),
    title: APP_CONFIG.titles.play,
  },
  { path: '**', redirectTo: '' },
];
```

---

## 13. README Outline (for the actual `README.md`)

1. **What this is** — one-paragraph project description with screenshot.
2. **Prerequisites** — Node ≥ 20 LTS, npm ≥ 10.
3. **Quick start** — `npm install`, `npm run serve:local`.
4. **All scripts** — table of every npm script and what it does.
5. **Architecture** — short version of §6 with a diagram (the ASCII one above).
6. **Tech choices** — bullet list of "why X" for each non-obvious choice (zoneless, signals, Tailwind+Material, abstract storage class, form-urlencoded interceptor).
7. **Deliberately NOT added** — required subsection. For each library the customer might expect to see, explain in 1–2 sentences why it was deliberately left out. Must include at minimum the entries from §13.1 below.
8. **Mapping to interview questions** — table that for each of the 18 interview questions points to a specific file/line where the answer is demonstrated. (This is the document a senior reviewer will read first.)
9. **Bundle audit** — how to run `npm run analyze` and what to look for.
10. **Testing** — how to run, how to read coverage report.
11. **Deferred features** — multiplayer, timer, undo, mobile number-pad overlay, SSR — each with a 1-line rationale.
12. **License** — MIT, declared in `LICENSE` file at repo root.

### 13.1 Required "Deliberately NOT added" entries (verbatim guidance for the README)

The README's "Deliberately NOT added" section MUST cover each item below with at least the rationale shown. Wording can be adapted, but no item may be omitted.

- **`@ngrx/store`** — _deliberately omitted._ This is an 81-cell board with a single game in flight at a time. The redux-style action/reducer/selector boilerplate would dwarf the domain logic and ship ~30 KB to the user for zero functional benefit. A custom signal-based store (`SudokuStore`) gives the same single-source-of-truth guarantee, immutable updates, and computed-derived state with zero extra dependencies. The store is _shaped_ like an NgRx feature (state shape + actions + selectors-as-computed-signals) so migrating later — if the app grew into a multi-board, multi-user iGaming product — would be mechanical, not architectural.

- **`@ngrx/signals` (SignalStore)** — _deliberately omitted._ SignalStore is the right call when there are several stores, withMethods/withComputed/withHooks compositional needs, or rxMethod-driven side-effects. None of that applies to a 9×9 grid with three API actions. Adding it would mean importing a library to wrap five signals and three methods I can declare in ~80 lines. The custom `SudokuStore` is the smaller, more honest fit. Same migration story as `@ngrx/store` above.

- **Karma + Jasmine** — replaced by Vitest. Angular 21's `@angular/build:unit-test` makes Vitest the default; Karma is in maintenance mode. Choosing Vitest demonstrates current Angular tooling and yields ~10× faster watch reruns during TDD.

- **`zone.js`** — Angular 21 is zoneless by default and the project doesn't include zone.js at all. This directly answers interview question #10.

- **E2E framework (Cypress / Playwright)** — out of scope for a test task. Unit coverage is comprehensive (see §10). A "would add for production" note appears in the deferred-features section.

---

## 14. Interview Question → Code Location Map (the README's centerpiece table)

| #   | Question theme               | Where the answer lives                                                                              |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | Change detection / OnPush    | Every component file has `changeDetection: ChangeDetectionStrategy.OnPush`                          |
| 2   | trackBy                      | `sudoku-board.component.html` `@for ... track cell.id`                                              |
| 3   | RxJS API cancellation        | `sudoku.store.ts` validate/solve `switchMap`                                                        |
| 4   | Memory leaks                 | All subscriptions via `takeUntilDestroyed(inject(DestroyRef))` or `async` pipe; explained in README |
| 5   | Bundle size                  | Tailwind JIT, standalone components, lazy `/play`, no NgRx, `analyze` script                        |
| 6   | Lazy loading                 | `app.routes.ts` `loadChildren` for the game feature                                                 |
| 7   | Angular DevTools             | README screenshots of DevTools profiler showing per-cell render isolation                           |
| 8   | Chrome DevTools              | README walkthrough: how to record a Performance trace of a Solve action                             |
| 9   | Core Web Vitals              | Preloaded Tailwind, no FOUC, no layout shift on board fill (skeleton matches final dimensions)      |
| 10  | Zone.js / zoneless           | Project doesn't include zone.js — package.json + README state this                                  |
| 11  | Large data                   | README discusses CDK Virtual Scroll, explains why not needed for 9×9                                |
| 12  | Change detection triggers    | README explains signal-driven CD; no manual `markForCheck` calls                                    |
| 13  | Dynamic theming              | CSS variables in `_theme.css` swap on `[data-theme]` attribute                                      |
| 14  | Reusable component design    | `sudoku-cell.component.ts` signal inputs                                                            |
| 15  | API data shape handling      | `BoardMappingService` keeps API shape out of components                                             |
| 16  | State management performance | `SudokuStore` immutable updates, computed signals, structural sharing                               |
| 17  | Production vs local perf     | README "build production" section + analyze instructions                                            |
| 18  | Memory leak heap snapshot    | README walkthrough showing how to take a heap snapshot via Chrome DevTools                          |

---

## 15. Sequence of Implementation (high level — detailed plan lives elsewhere)

Implementation will be planned in a separate document via the `writing-plans` skill once this spec is approved. At a high level the order is:

1. Scaffold workspace (`ng new`), strip zone.js, lock versions.
2. Tooling: ESLint, Prettier, Stylelint, Husky, lint-staged, Vitest builder switch.
3. Tailwind v4 + Material 21 + layer ordering + theme tokens.
4. `core/config` (APP_CONFIG, API_ROUTES, STORAGE_KEYS, SNACKBAR_MESSAGES).
5. `models/*` (all types/interfaces).
6. `core/api` (interceptor + ApiService + helpers, with tests).
7. `core/mapping` (BoardMappingService, with tests).
8. `core/errors` (ErrorHandlerService, with tests).
9. `core/storage` (StorageProvider + LocalStorageService + GameStateStorageService, with tests).
10. `features/game/sudoku.store.ts` (with tests).
11. Shared pipes & directives (with tests).
12. Component leaves: SudokuCell, LoadingIndicator, EmptyState, ErrorState, NewGameConfirmDialog.
13. Component branches: SudokuBoard, DifficultySelector, GameControls.
14. Component root: GamePageComponent + game.routes.ts (lazy entry).
15. WelcomeComponent + app shell + app.routes.ts + app.config.ts.
16. Wire snackbar messages, error mapping, keyboard nav, highlights, mobile responsive.
17. Theme + dark mode.
18. README (architecture, scripts, interview-question map, screenshots).
19. Bundle audit + final lighthouse pass.
20. Commit, push, tag `v1.0.0`.

---

## 16. Out-of-Scope (for clarity)

- Server-side rendering / hydration.
- PWA / service worker / offline mode beyond what `localStorage` already provides.
- Internationalization (UI strings stay English, per global preferences — bilingual is a bot-only convention).
- E2E tests (Cypress / Playwright). Unit coverage is comprehensive; E2E would balloon scope for marginal gain on a test task. Mentioned in the README as a "would add for production."
- Authentication / user accounts.
- Statistics / leaderboards.
- Difficulty grading via `/grade` endpoint.

---

End of spec.
