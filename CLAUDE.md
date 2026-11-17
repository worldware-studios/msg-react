# CLAUDE.md

`@worldware/msg-react` — React components for rendering messages from
[`@worldware/msg`](https://github.com/worldware-studios/msg) (TypeScript,
React 19, Vitest + Testing Library, tsup).

## Source of truth

Before working on a GitHub issue, read these in order. They are authoritative;
if anything here conflicts with them, follow them and say so.

1. [project/process.md](project/process.md) — the phased development workflow.
2. [project/rules.md](project/rules.md) — Definition of done, coding standards,
   branches, commits, and PR conventions.
3. [project/info.md](project/info.md) — repo facts, structure, and commands.

The `/implement-github-issue <n>` skill walks through that workflow.

## Commands

| Purpose     | Command              |
| ----------- | -------------------- |
| Tests       | `npm test`           |
| Watch tests | `npm run test:watch` |
| Type-check  | `npx tsc --noEmit`   |
| Build       | `npm run build`      |
| Coverage    | `npm run coverage`   |

## Non-negotiables

- **Approval gates:** phases marked **[approval]** in `project/process.md` end
  your turn. Wait for explicit approval before continuing.
- **TDD:** write failing tests first; don't weaken tests to force a pass.
- **Definition of done:** tests, type-check, build, and coverage (> 90%) pass
  before asking to advance a phase.
- **Branches:** `msg-react-<issue number>`, cut from an up-to-date `main`.
- **Commits:** prefix intermediate commits with the phase (`scaffold:`,
  `implement:`, `optimize:`, `validate:`, `document:`, `refactor:`,
  `process:`) and reference the issue (`Refs #42`).
- **PRs:** open as a draft early; the title follows Conventional Commits
  because it becomes the squashed commit.
- **Public API:** anything exported from `src/index.ts` is public; changing it
  is a breaking change and must be called out.
- **`@worldware/msg` is a peer dependency:** consumers install it themselves.
  Keep the `peerDependencies` and `devDependencies` ranges in step, and call
  out any change to the peer range.
- Never commit `dist/`, `coverage/`, `docs/`, or `.env` files.
