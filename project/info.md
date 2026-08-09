# Project Info

This file captures the facts an agent needs before executing the development
process in `project/process.md`. Keep it accurate — the process depends on it.

## Overview

- **Name:** `msg-react`
- **Description:** React components for rendering messages from [`@worldware/msg`](https://www.npmjs.com/package/@worldware/msg).
- **Repository:** `jsahleen/msg-react` (`https://github.com/jsahleen/msg-react.git`)
- **Default branch:** `main`
- **Issue tracker:** https://github.com/jsahleen/msg-react/issues
- **License:** ISC (see `package.json`)

## Tech stack

- **Language:** TypeScript (`strict: true`, `jsx: react-jsx`, target ES2016, module CommonJS; config in `tsconfig.json`).
- **Runtime:** Node.js (`.nvmrc` pins the version used by CI) + npm.
- **UI:** React 19 (peer/dev dependency for components and tests).
- **Test runner:** [Vitest](https://vitest.dev) with `@vitest/coverage-v8`, jsdom, and Testing Library (`@testing-library/react`). Config in `vitest.config.js`; setup in `src/test/setup.ts`.
- **Build:** `tsc` (`npm run build` → `dist/`).
- **Key dependencies:** `@worldware/msg`, `react`, `react-dom`, `messageformat`.

## Repository structure

```
src/
  index.ts                         # Public entry point (defines the API surface)
  components/
    index.ts                       # Barrel export for components
    MsgMessage/                    # MsgMessage component + co-located test
    MsgResourceProvider/           # MsgResourceProvider + context + co-located test
  test/
    setup.ts                       # Vitest / Testing Library setup
    mocks.ts                       # Shared test mocks
dist/                              # Build output (generated, not committed)
coverage/                          # Coverage output (generated, not committed)
docs/                              # Generated API docs (created by the docs step)
project/                           # Process, rules, and info for the dev workflow
```

Notes:
- Components live in `src/components/<Name>/<Name>.tsx`, with a barrel
  `index.ts` and co-located `*.test.tsx` tests.
- Shared test helpers live under `src/test/`.
- Anything exported from `src/index.ts` is the public API.

## Commands

| Purpose            | Command               |
| ------------------ | --------------------- |
| Install deps       | `npm install`         |
| Run tests once     | `npm test`            |
| Watch tests        | `npm run test:watch`  |
| Coverage report    | `npm run coverage`    |
| Build              | `npm run build`       |
| Type-check only    | `npx tsc --noEmit`    |
| API docs           | `npm run docs`        |

`npm run docs` runs TypeDoc over `src/index.ts` and writes the generated site
to the git-ignored `docs/` folder; regenerate it on demand rather than
committing it. Add the `docs` script and `typedoc` dev dependency if they are
missing.

## Continuous integration

- `.github/workflows/ci.yml` runs on every pull request and push to `main`,
  executing the Definition-of-done checks (`npx tsc --noEmit`, `npm test`,
  `npm run build`). PRs must be green here before review.
