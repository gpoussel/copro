# copro

My TypeScript solutions and tooling for several competitive-programming sites,
all in one place.

## Contests

| Key     | Site                                        | Progress                        |
| ------- | ------------------------------------------- | ------------------------------- |
| `aoc`   | [Advent of Code](https://adventofcode.com/) | 524 stars (2015–2025, complete) |
| `aosql` | [Advent of SQL](https://adventofsql.com/)   | 24 puzzles (2024, complete)     |
| `cg`    | [CodinGame](https://www.codingame.com/)     | 247 puzzles, 21 golf solutions  |
| `ec`    | [Everybody Codes](https://everybody.codes/) | 46 quests (2024–2025)           |
| `euler` | [Project Euler](https://projecteuler.net/)  | 99 problems (1–99)              |

Each contest lives under `src/contests/<key>/`, with shared helpers
(grids, graphs, math, data structures, …) in `src/utils/`.

## Usage

```bash
pnpm install
pnpm start -- <contest> [args]      # e.g. pnpm start -- aoc 2015 1
```

Copy `.env.example` to `.env` for commands that need site credentials
(such as the CodinGame API).

## License

MIT — see [LICENSE](LICENSE).
