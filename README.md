# copro

My TypeScript solutions and tooling for several competitive-programming sites,
all in one place.

## Contests

| Key     | Site                                        |
| ------- | ------------------------------------------- |
| `aoc`   | [Advent of Code](https://adventofcode.com/) |
| `aosql` | Advent of Code (SQL flavour)                |
| `cg`    | [CodinGame](https://www.codingame.com/)     |
| `ec`    | [Everybody Codes](https://everybody.codes/) |
| `euler` | [Project Euler](https://projecteuler.net/)  |

Each contest lives under `src/contests/<key>/`, with shared helpers
(grids, graphs, math, data structures, …) in `src/utils/`.

## Usage

```bash
npm install
npm start -- <contest> [args]      # e.g. npm start -- aoc 2015 1
```

Copy `.env.example` to `.env` for commands that need site credentials
(such as the CodinGame API).

## License

ISC — see [LICENSE](LICENSE).
