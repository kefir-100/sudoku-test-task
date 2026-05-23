# Sudoku — Angular 21 app

A Sudoku application built in Angular 21 against the public
[Sugoku API](https://sugoku.onrender.com).

---

## Prerequisites

| Tool    | Minimum version |
| ------- | --------------- |
| Node.js | 20 LTS          |
| npm     | 10              |

The project uses no Docker container — just Node on the host.

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

## Architecture notes

The game state lives in `SudokuGameService` using plain Angular signals. On a bigger app I'd add:

| Tool                                           | What it adds                                                                                                                                      | Why not here                                                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@ngrx/signals](https://ngrx.io/guide/signals) | A ready-made signal store with `withState`, `withMethods`, and `withComputed` helpers, plus DevTools support. You stop writing the store by hand. | The store here is 7 signals and 6 computed values in a single service — too small for `@ngrx/signals` to be worth the wiring. It pays off on bigger apps. |

## Testing notes

Vitest covers 26 spec files. For a production deployment I would extend the test pipeline with one additional tool, kept out of this repo for the reason in the right column:

| Tool                                                    | Purpose                                                                                                                                                      | Excluded here because                                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| [Stryker](https://stryker-mutator.io/) mutation testing | Mutates source (flips operators, voids returns, deletes branches) and reports surviving mutants as weak-assertion evidence that line coverage cannot detect. | Run time of 2–10 min sits outside the per-commit `verify` budget (~14 s).In production it lives on a separate nightly CI job. |

## License

MIT — see [LICENSE](./LICENSE).
