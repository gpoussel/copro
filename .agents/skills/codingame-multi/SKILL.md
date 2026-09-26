---
name: codingame-multi
description: >-
  Build and climb with a CodinGame MULTIPLAYER bot (the "Multi" / bot programming
  arenas: Mad Pod Racing, Ultimate Tic-Tac-Toe, Tron, Code Royale, Fantastic Bits,
  Spring/Fall/Winter challenges, board games like Connect 4 or Othello…), where
  your program plays games against other players' bots and you climb leagues
  (Wood → Bronze → Silver → Gold → Legend) by beating the league boss. Use this
  whenever the user wants to start, improve, debug, or promote a CodinGame
  multiplayer / arena / bot-programming bot, mentions a league, a boss, win rate,
  replays, or submitting to the arena. Not for solo puzzles, optim puzzles (use
  codingame-optim) or code golf (use codingame-golf).
---

# CodinGame multiplayer bots

A multi is a **game against other bots**, played turn by turn over stdin/stdout.
There are no test cases: the only measures are games. You get feedback from
two places, and the loop is about moving from the cheap one to the expensive
one only when a change is worth it:

1. **IDE games** (`play_arena_games`): free, no effect on the ranking, one game
   every few seconds. Your truth for "is version B better than A?".
2. **Arena submission** (`submit_arena_bot`): replaces the ranked agent and
   replays a few hundred games against the room. Decides promotion.

## Tools (codingame MCP server, writes enabled)

| Step | Tool |
| --- | --- |
| Where am I? League, rank, score, boss, submission progress, neighbours' `agentId` | `get_arena_status(pretty_id)` |
| Rules + input stub **of the current league** | `get_puzzle_tests(pretty_id)` (`statement`, `stubGenerator`; no test cases) |
| Play N games vs boss / self / an agent, seats rotated | `play_arena_games(pretty_id, code_file=…, games=N, opponents=[…])` |
| Replay a precise game (same seed) | `play_arena_games(…, seed="seed=123")` |
| Turn-by-turn log (stdout, stderr, referee summary) | `get_game_replay(game_id, seat=…)` |
| How did the ranked agent fare? | `get_arena_battles(pretty_id)` |
| Submit | `submit_arena_bot(pretty_id, code_file=…)` then poll `get_arena_status` |

Pass `code_file` (absolute path to `src/contests/cg/multi/<slug>.ts`) rather
than pasting the bot: the language comes from the extension. `pretty_id` is the
slug of `list_puzzles(level="multi")` (e.g. `mad-pod-racing`, whose
leaderboard id is `coders-strike-back`: the tools resolve that themselves).

## Workflow

1. **Read the league.** `get_arena_status` + `get_puzzle_tests`. The statement
   and the input format **change with the league** (Wood leagues are tutorials
   that unlock rules one by one): always re-read them after a promotion, and
   make the parser follow the new `stubGenerator`.
2. **Scaffold** `pnpm start -- cg multi <slug>`, write a bot that plays legal
   moves and never times out, `pnpm typecheck`.
3. **Beat the boss locally first.** `play_arena_games(games=10)` against
   `"boss"`. Seats rotate by default: some games are asymmetric (first player
   advantage), so compare versions on the same seats and, when it matters, the
   same seeds.
4. **Compare versions with numbers, not impressions.** 10 games give a win rate
   ± 30 %; to decide between two close versions play 20+ games, or play the new
   version against the old one's submitted agent (its `agentId`), or against
   `"self"` with the old code saved elsewhere. Do not conclude from one game.
5. **Submit** when the IDE win rate against the boss is clearly above 50 %.
   Promotion is not instant: the agent must finish its games (`percentage` 100)
   with a score above the boss's, and promotions are checked every
   `promotionIntervalSeconds`. Meanwhile, `get_arena_battles` shows the
   losses to study.
6. **Debug a loss**: `get_game_replay(game_id, seat=<my seat>)` for the moves,
   the referee summary and your stderr; replay its seed with the fixed code.

## Pitfalls that cost games

- **Timeouts are losses.** The first turn usually allows ~1 s, later turns
  ~50–100 ms (read the statement's constraints). A search must check the clock
  (`performance.now()`) and stop with margin (~80 % of the budget). A timeout
  shows up as a `"me timeout!"` event.
- **stdout is for moves only.** Debug on stderr (`console.error`), otherwise the
  referee reads garbage as an invalid action. Keep stderr short: it is also
  what you read back in replays (`stderr_tail`).
- **Read every input line every turn**, even the ones you ignore, or the next
  turn is shifted.
- A bot that crashes or prints an invalid action loses immediately; an
  exception in TypeScript is a crash. Guard the parsing. A crash surfaces as
  a bare "timeout" with no stderr: pipe the first input into the bot locally.
- **Statements lie about details** (row order, colour letters, coordinate
  origin). When the referee lists legal moves, regenerate them in the engine
  and compare the *sets*, not the counts (a mirrored board has the same
  count), and derive orientation/colour from them on the first turn.
- The CodinGame TypeScript judge compiles as a script: top-level names like
  `name`, `open`, `status`, `close` clash with globals. Prefix them.
- Long games (100+ turns) take a while per IDE game: series of 4–8 games are
  enough to beat a boss; save longer series for comparing close versions.
- `play_arena_games` saves the code as the puzzle's IDE draft (like a test
  run). Nothing else changes until `submit_arena_bot`.
- `submit_arena_bot` **replaces the ranked agent**, even with a worse bot: a
  multi keeps the last submission, not the best one. Ask the user before
  submitting.

## Files

Bots live in `src/contests/cg/multi/<slug>.ts`, type-checked like `opti` (the
ambient `readline()` is declared in `src/contests/cg/puzzle/cg.d.ts`). Keep one
file per game: CodinGame takes a single source. League-specific notes (rules
learned, what beat which boss) go in `src/contests/cg/multi/CLAUDE.md`.
