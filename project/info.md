# Project Info

This file captures the facts an agent needs before executing the development
process in `project/process.md`. Keep it accurate — the process depends on it.

## Overview

- **Name:** `msg-react`
- **Description:** React components for rendering messages from [`@worldware/msg`](https://www.npmjs.com/package/@worldware/msg).
- **Repository:** `worldware-studios/msg-react` (`git@github.com:worldware-studios/msg-react.git`)
- **Default branch:** `main`
- **Issue tracker:** https://github.com/worldware-studios/msg-react/issues
- **License:** ISC (see `package.json`)

## Prerequisites

Check these before starting the process; every GitHub step depends on them.

- **Node.js:** the version in `.nvmrc` (`nvm use`).
- **GitHub CLI:** `gh` installed and logged in (`gh auth login`) as an account
  that can create issues and push to the repository. Verify with
  `gh auth status`.
- **Git credentials:** if `origin` uses HTTPS, run `gh auth setup-git` once so
  `git push` authenticates through `gh`.

## Tech stack

- **Language:** TypeScript (`strict: true`, `jsx: react-jsx`, target ES2016, module ESNext; config in `tsconfig.json`).
- **Runtime:** Node.js (`.nvmrc` pins the version used by CI) + npm.
- **UI:** React 19 (peer/dev dependency for components and tests).
- **Test runner:** [Vitest](https://vitest.dev) with `@vitest/coverage-v8`, jsdom, and Testing Library (`@testing-library/react`). Config in `vitest.config.js`; setup in `src/test/setup.ts`.
- **Build:** [tsup](https://tsup.egoist.dev) for dual ESM/CJS bundles, plus `tsc -p tsconfig.build.json` for declaration files (`npm run build` → `dist/`). Config in `tsup.config.ts`.
- **Key dependencies:** `@worldware/msg` (peer + dev; consumers must install it
  alongside this package), `react`, `react-dom`, `messageformat`.

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
| API docs           | blocked (see below)   |

**API docs are blocked on TypeScript 7.** The intended `npm run docs` (TypeDoc
over `src/index.ts`, writing the git-ignored `docs/` folder) cannot be added
yet: TypeDoc 0.28.x supports TypeScript only up to 6.0, and this repo uses
TypeScript 7 (the same limitation noted in `tsup.config.ts` for declaration
bundling). Until TypeDoc supports TypeScript 7, skip the generation step, say
so, and keep TSDoc comments accurate.

**Scripts imported by tests:** under Vitest, `import.meta.url` is not a
`file:` URL, so `fileURLToPath(import.meta.url)` at module load throws. Resolve
paths from `import.meta.url` only inside the CLI entry, and detect direct
execution with `import.meta.url === pathToFileURL(process.argv[1]).href`.

## Continuous integration

- `.github/workflows/ci.yml` runs on every pull request and push to `main`,
  executing the Definition-of-done checks (`npx tsc --noEmit`, `npm test`,
  `npm run build`). PRs must be green here before review.
- **Waiting on CI for the latest push:** right after a push,
  `gh pr checks --watch` can still report the previous commit's run. Wait on
  the run whose `headSha` matches `git rev-parse HEAD` instead:
  `gh run list --branch <branch> --limit 1 --json databaseId,headSha` (confirm
  the SHA, retrying after a few seconds if it is the old one), then
  `gh run watch <databaseId> --exit-status`.
- `.github/workflows/verify-and-release.yml` runs on every push to `main`. A
  `verify` job runs type-check, tests, and build (plus dependency signature
  audit); a `release` job builds again and runs `npx semantic-release` when
  verify succeeds (GitHub release + npm publish via OIDC trusted publishing /
  provenance). `package.json` also defines `"prepack": "npm run build"` so
  `dist/` is always produced before `npm pack` / publish.
