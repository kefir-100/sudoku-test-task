# Sudoku — Angular 21 app

A Sudoku application built in Angular 21 against the public [Sugoku API](https://sugoku.onrender.com).

---

## Prerequisites

| Tool    | Required version |
| ------- | ---------------- |
| Node.js | 25.2.1           |
| npm     | 11.6.2           |

No Docker needed — just Node on the host. Versions are pinned exactly in `package.json` (`engines` + `packageManager`) so everyone runs the same setup. Use `[nvm](https://github.com/nvm-sh/nvm)` or `[fnm](https://github.com/Schniz/fnm)` to switch Node versions on your machine.

---

## Quick start

```bash
git clone <repo-url>
cd sudoku-test-task
npm install
npm run serve:local
```

The dev server starts at `http://127.0.0.1:4200` and opens automatically.

---

## All scripts

| Script                  | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `npm start`             | Alias for `serve:local`                                   |
| `npm run serve:local`   | `ng serve` on `127.0.0.1:4200`, opens browser             |
| `npm run build`         | Production build (`--configuration production`)           |
| `npm run build:dev`     | Development build (source maps, no minification)          |
| `npm run watch`         | Incremental dev build, no server                          |
| `npm test`              | Vitest in watch mode                                      |
| `npm run test:coverage` | Vitest with v8 coverage report                            |
| `npm run lint`          | ESLint, zero warnings allowed                             |
| `npm run lint:fix`      | ESLint auto-fix                                           |
| `npm run stylelint`     | Stylelint on `src/**/*.css`, zero warnings                |
| `npm run stylelint:fix` | Stylelint auto-fix                                        |
| `npm run format`        | Prettier — write                                          |
| `npm run format:check`  | Prettier — check only (used in CI)                        |
| `npm run analyze`       | Production build + `source-map-explorer` bundle report    |
| `npm run verify`        | Runs lint, stylelint, format:check, and tests in sequence |

## Production readiness

This repo ships a working Sudoku app with tests, theming, and persistence — enough for the brief. Here's what I'd add for real world production application.

| Area                              | Recommended tool / approach                                                                                                                                                              | Why it matters                                                                                                                                                                                                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| End-to-end testing                | [Playwright](https://playwright.dev/) with the Angular community recipes                                                                                                                 | Unit tests check the store and components on their own. They can't catch a broken router config, a CSP that blocks the API, a hydration mismatch, or a snackbar that never closes. A five-test E2E pack covering the golden path (start → enter → validate → solve) catches the regressions that bite Angular teams in real apps.    |
| SSR & incremental hydration       | `[@angular/ssr](https://angular.dev/guide/ssr)` (built into v21)                                                                                                                         | The current setup is a fully client-rendered SPA. SSR + hydration improves LCP, makes the welcome page indexable, and lets signed-in flows render before JS kicks in. Angular 21's incremental hydration is much better than the destructive hydration in v16–v18 — worth adopting now rather than bolting on later.                 |
| State management for a bigger app | `[@ngrx/signals](https://ngrx.io/guide/signals)`                                                                                                                                         | A ready-made signal store with `withState`, `withMethods`, and `withComputed` helpers, plus DevTools support. You stop writing the store by hand. Skipped here because the store is 7 signals + 6 computed values in one service — too small for the wiring to be worth it. Pays off on bigger apps.                                 |
| Internationalization              | [Transloco](https://jsverse.github.io/transloco/) (runtime) or `[@angular/localize](https://angular.dev/guide/i18n)` (compile-time)                                                      | The UI is English-only. Pulling strings out of templates into translation files makes content edits cheap and lets PMs review copy without touching code. Transloco fits when users switch language at runtime; `@angular/localize` fits one-bundle-per-locale builds served via routing.                                            |
| Observability                     | [Sentry Angular SDK](https://docs.sentry.io/platforms/javascript/guides/angular/) + the `[web-vitals](https://github.com/GoogleChrome/web-vitals)` library shipped to a metrics endpoint | `ErrorHandlerService` shows snackbar errors but doesn't report them anywhere. Production needs session-grouped error tracking with source maps, plus real user monitoring of LCP/CLS/INP. Without these you hear about regressions from users on Twitter before your dashboard ever shows them.                                      |
| Mutation testing                  | [Stryker](https://stryker-mutator.io/)                                                                                                                                                   | Mutates source code (flips operators, voids returns, deletes branches) and reports which mutants survive — that's evidence your assertions are weak in ways line coverage can't see. Skipped here because it takes 2–10 min per run and doesn't fit the per-commit `verify` budget (~14 s). Lives on a nightly CI job in production. |

## License

MIT — see [LICENSE](./LICENSE).
