# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single TypeScript CLI holding competitive-programming solutions for several sites. One entry point (`src/index.ts`) dispatches to a contest module by its key; each contest module owns its own argument parsing, file/template generation, and solution runner.

## Commands

```bash
pnpm install
pnpm start -- <contest> [args]
```

`<contest>` is one of `aoc`, `aosql`, `cg`, `ec`, `euler` (registered in `src/contests/index.ts`). Examples:

- `pnpm start -- aoc 2015 1` — run both parts of AoC 2015 day 1 (creates the day folder + template if missing, runs tests, prints `aoc download`/`aoc submit` helper commands).
- `pnpm start -- aoc 2015 1 2` — run only part 2.
- `pnpm start -- aoc` / `pnpm start -- aoc 5` — defaults year/day from the current Advent-of-Code clock (America/New_York).
- `pnpm start -- euler 100` — run Project Euler problem 100.
- `pnpm start -- cg golf <puzzle-slug>` — scaffold a CodinGame solution file (categories: `golf`, `puzzle`, `opti`).

`pnpm typecheck` runs `tsc --noEmit` over the whole `src` tree **except** `src/contests/cg/golf` (those are intentionally untyped, byte-minimized programs and are excluded in `tsconfig.json`). There is no build step — the app runs via `tsx` (transpile-only). "Tests" are example cases embedded in each solution and executed by the contest runner when you run that day/problem. Formatting is Prettier (`.prettierrc`); run via your editor or `pnpm exec prettier`.

## Architecture

- **Dispatch.** `src/index.ts` loads `src/contests/index.ts` (a map of key → `Contest`) and calls `contest.run(args)`. A `Contest` is just `{ name, run(args) }` (`src/types/contest.ts`).
- **Solution shape per site** (`src/types/contest.ts`):
  - AoC / aosql: `{ part1, part2 }`, each a `MultiLevelQuestPart` = `{ run(input), tests[] }`.
  - Everybody Codes: same but `part1/2/3`.
  - Project Euler: `{ solve() }`.
- **Runner flow** (AoC/EC, see `src/contests/aoc/index.ts`): parse args → `writeTemplateIfNecessary` scaffolds `years/<year>/<dd>/index.ts` if absent → dynamically `import()` that file → run embedded `tests` (`executeTests`), then run against the `input` file (`executeOnFile`). Shared helpers live in `src/contests/utils.ts`. Note: from year 2025 onward AoC is treated as a 12-day event, not 25.
- **Dynamic imports** target compiled `.js` paths (`getIndexFile`/`getFile`) even though source is `.ts` — the project runs via `tsx` with `"type": "module"`, so imports use `.js` extensions throughout.
- **CodinGame** (`src/contests/cg/`) is different: `golf/`, `puzzle/`, `opti/` hold flat per-puzzle `.ts` files (no test harness; standalone readline()→print() programs). `golf` files are byte-minimized, kept `// @ts-nocheck`, and excluded from typecheck (see above). `puzzle`/`opti` files are type-checked under `strict`: the `readline()` global is declared ambiently in `src/contests/cg/puzzle/cg.d.ts`, and `tsconfig`'s `"moduleDetection": "force"` treats each file as an isolated module so their top-level declarations don't collide in the global scope. The `cg` command only scaffolds these solution files; talking to the CodinGame backend (progress, leaderboards, etc.) is handled outside this repo by the CodinGame MCP tools.
- **Shared algorithm library** in `src/utils/` (grid, graph, math, algebra, bitset, vector, OCR, and `structures/`: priority queue, order-statistic tree, ring buffer), re-exported through `src/utils/index.ts` as `utils`. Reach for these in solutions before writing new helpers.

## Other notes

- Project Euler solutions are split by problem number (see `src/contests/euler/tools/file-generator.ts`): problems **1–99** live in this repo under `src/contests/euler/problems-00xx/`, while problems **≥ 100** live in a separate git submodule (`src/contests/euler/problems`, repo `copro-euler-100`) — run `git submodule update --init` to populate it. So when measuring this repo's Euler progress, count only `problems-00xx/`; the submodule is a different repo.
- Secrets come from `.env` (copy `.env.example`): Postgres vars for `aosql`.
- `.claude/skills/codingame-golf/` is a skill for byte-minimizing CodinGame solutions, with a `verify.mjs` runner and `golf-tricks.md` reference.
