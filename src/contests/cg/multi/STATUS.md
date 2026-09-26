# CodinGame multiplayer — league status

Goal: at least **Gold** on every multi (an agent submitted in Gold or Legend).
Refresh with `get_arena_status`; notes and ideas per game live in `CLAUDE.md`.
`to Gold` = promotions still needed; 1- and 2-league games start in Legend / Gold,
so a submitted bot is enough there.

Surveyed 2026-09-26.

| Game | Leagues | Current | To Gold | Agent | Players | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 6-nimmt-6-qui-prend-take-5 | 1 | **Legend** ✅ | 0 | TypeScript Monte Carlo, submitted | 4 | best score in 3/4 games vs 3 bosses (single league) |
| abalone | 2 | **Gold** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (6–0) |
| amazons | 2 | **Legend** ✅ | 0 | TypeScript 1-ply territory, submitted | 2 | 4/4 matches vs boss |
| ataxx | 2 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 6/6 vs boss |
| back-to-the-code | — | ready (no league) | 1 | TypeScript rectangles, **not submitted yet** (needs MCP PR #7 + reconnect) | 2–4 | 4/4 vs boss (~2.5× its cells) |
| bandas | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (single league) |
| blocking | 2 | **Gold** ✅ | 0 | TypeScript greedy, submitted | 2–4 | ~40% vs boss (close scores) |
| breakthrough | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (single league) |
| chain-reaction-1 | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (single league) |
| checkers | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (single league) |
| chess | 2 | **Gold** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 matches vs boss |
| clash-of-bots | 1 | **Legend** ✅ | 0 | TypeScript rules, submitted | 2 | 1/4 vs boss, close counts |
| clobber | 2 | **Legend** ✅ | 0 | TypeScript MCTS, submitted | 2 | 4/4 vs boss |
| code-keeper---the-hero | 1 | **Legend** ✅ | 0 | TypeScript explorer, submitted | 4 | 1/4, scores close to bosses; nobody reaches the exit |
| connect-4 | 2 | **Legend** ✅ | 0 | TypeScript MCTS | 2 | Gold→Legend 2026-09-26 |
| dice-duel | 2 | **Legend** ✅ | 0 | TypeScript 1-ply, SEVEN_RULE on, resubmitted | 2 | 1/4 vs Legend boss: dies of no moves, add own-mobility to eval |
| dice-shogi | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta (minishogi engine), submitted | 2 | 4/4 vs boss (single league) |
| domain-expansion | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta Voronoi, submitted | 2 | 4/4 vs boss (single league) |
| dots-and-boxes | 2 | **Legend** ✅ | 0 | TypeScript MCTS, submitted | 2 | 2/4 vs boss (2x2: wins as A, 2–2 ranked as loss as B) |
| fireworks | 2 | **Gold** ✅ | 0 | TypeScript Hanabi rules, submitted | 4 | valid but lowest score vs bosses: improve hints |
| hex | 1 | **Legend** ✅ | 0 | TypeScript MCTS, submitted | 2 | 4/4 vs boss (single league) |
| impasse | 1 | **Legend** ✅ | 0 | TypeScript 1-ply, submitted | 2 | **weak: 0/4 vs boss**, needs a real engine + search |
| legends-of-code-magic-constructed | 1 | **Legend** ✅ | 0 | TypeScript heuristic, submitted | 2 | 6/6 vs boss (single league) |
| lines-of-action | 2 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss |
| mad-knights | 1 | **Legend** ✅ | 0 | TypeScript paranoid alpha-beta, submitted | 3 | 3/6 wins vs 2 bosses (single league) |
| minishogi | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (single league) |
| nine-mens-morris | 2 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss |
| onitama | 2 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss |
| othello-1 | 2 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 3/4 vs boss; weak: improve (MCTS or deeper search) |
| oware-abapa | 2 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss |
| paper-soccer | 1 | **Legend** ✅ | 0 | TypeScript 2-ply turns, submitted | 2 | 4/4 vs boss (single league) |
| platinum-rift-episode-2 | — | ready (no league) | 1 | TypeScript spread+rush, **not submitted yet** (needs MCP PR #7 + reconnect) | 2 | 4/4 vs boss (base taken in 13–19 turns) |
| poker | 2 | **Gold** ✅ | 0 | TypeScript Monte Carlo equity, submitted | 2–4 | 2/4 heads-up vs boss |
| start-up | 1 | **Legend** ✅ | 0 | TypeScript rules, submitted | 4 | valid; 106–200‰ vs bosses 450–800‰ |
| tower-dereference | 1 | **Legend** ✅ | 0 | TypeScript upgrade-first, submitted | 2 | 4/4 vs boss (single league) |
| tulips-and-daisies | 2 | **Legend** ✅ | 0 | TypeScript 2-ply spots, submitted | 2 | 4/4 vs boss (boss goes bankrupt) |
| twixt-pp | 1 | **Legend** ✅ | 0 | TypeScript distance eval, submitted | 2 | 4/6 vs boss (single league); weak, see notes |
| vindinium | 2 | **Gold** ✅ | 0 | TypeScript heuristic, submitted | 4 | most gold in 3/4 games vs 3 bosses |
| yavalath | 1 | **Legend** ✅ | 0 | TypeScript MCTS, submitted | 2 | 4/4 vs boss (single league) |
| yinsh | 1 | **Legend** ✅ | 0 | TypeScript minimal (list-based), submitted | 2 | 2/2 vs boss; no engine yet |
| beeminegame | 3 | **Gold** ✅ | 0 | TypeScript greedy hives | 2 | Silver→Gold 2026-09-26 (levels/bees in Gold: bot ignores them) |
| counting-tictactoe | 3 | **Gold** ✅ | 0 | TypeScript MCTS | 2 | Silver→Gold 2026-09-26 |
| elemental-wars | 3 | Silver | 1 | TypeScript chase/flee, submitted | 3 | best score 4/6 vs 2 bosses; awaiting promotion (more elementals + freeing prisoners next) |
| mad-pod-racing | 7 | **Gold** ✅ | 0 | TypeScript Gold 2-pod racer, submitted | 2 | 1/4 vs Gold boss; next: blocker pod + collisions (Magus) |
| night-of-war | 3 | **Gold** ✅ | 0 | TypeScript rules | 2 | Silver→Gold 2026-09-26 (Gold rules: 5×5? re-read) |
| penguins | 3 | **Legend** ✅ | 0 | TypeScript Voronoi | 2–4 | Silver→Legend 2026-09-26 |
| space-shooter | 3 | **Gold** ✅ | 0 | TypeScript steering | 2 | Silver→Gold 2026-09-26 (missiles in this league: bot ignores them) |
| spring-challenge-2022 | 6 | Silver | 1 | Rust 1526/2401 | 2 | |
| spring-challenge-2026-troll-farm | 6 | Silver | 1 | C++ 169/683 | 2 | |
| tic-tac-toe | 5 | **Legend** ✅ | 0 | TypeScript MCTS v6 | 2 | Gold→Legend 2026-09-26 |
| volcanoes | 3 | Silver | 1 | TypeScript 1-ply | 2 | stuck 82/125 in Silver: needs growth simulation / search |
| atari-go | 4 | Silver | 1 | TypeScript tactical | 2 | Bronze→Silver; 1 promotion left |
| atari-go-9x9 | 4 | Silver | 1 | TypeScript tactical | 2 | Bronze→Silver; 1 promotion left |
| code4life | 6 | Bronze | 2 | Rust 1221/1535 | 2 | |
| coders-of-the-realm | 4 | Bronze | 2 | TypeScript greedy placement, submitted | 2–4 | best score 4/4 vs Bronze boss; awaiting promotions |
| coders-of-the-realm---1v1 | 4 | Bronze | 2 | TypeScript greedy placement, submitted | 2 | 4/4 vs Bronze boss (~130–25); awaiting promotions |
| cultist-wars | 4 | Bronze | 2 | TypeScript action scoring, submitted | 2 | 2/6 vs Bronze boss (loses as player 2): improve shooting duels |
| game-of-life-or-death | 4 | Bronze | 2 | TypeScript pattern search, submitted | 2 | 4/4 vs Bronze boss (~590–1); awaiting promotions |
| gargoyles-versus-santas | 4 | Bronze | 2 | TypeScript interception, submitted | 2 | 4/4 vs Bronze boss; awaiting promotions |
| isola | 4 | **Gold** ✅ | 0 | TypeScript alpha-beta | 2 | Bronze→Gold 2026-09-26 |
| legends-of-code-magic | 7 | Bronze | 2 | TypeScript 518/1629 | 2 | |
| seabed-security | 7 | Bronze | 2 | C++ 274/707 | 2 | |
| spring-challenge-2021 | 6 | Bronze | 2 | Rust 255/3033 | 2 | |
| tryangle-catch | 4 | Bronze | 2 | TypeScript WIP, **not submitted** (0/6) | 2 | units get surrounded; study the referee before retrying |
| winter-challenge-2026-snakebyte | 4 | Bronze | 2 | — | 2 | |
| bit-runner-2048 | 5 | Wood 1 | 3 | — | 2 | |
| crystal-rush | 5 | Wood 1 | 3 | — | 2 | |
| git-patchwork | 5 | Wood 1 | 3 | — | 2 | |
| keep-off-the-grass-fall-challenge-2022 | 5 | Wood 1 | 3 | — | 2 | |
| langton-s-ant | 5 | Wood 1 | 3 | — | 2 | |
| codebusters | 6 | Wood 2 | 4 | — | 2 | |
| fall-challenge-2020 | 6 | Wood 2 | 4 | — | 2 | |
| fantastic-bits | 6 | Wood 2 | 4 | — | 2 | |
| game-of-drones | 6 | Wood 2 | 4 | — | 2 | |
| great-escape | 6 | Wood 2 | 4 | — | 2 | |
| green-circle | 6 | Wood 2 | 4 | C++ 250/544 | 2 | |
| ocean-of-code | 6 | Wood 2 | 4 | — | 2 | |
| platinum-rift-episode-1 | 6 | Wood 2 | 4 | — | 2 | |
| poker-chip-race | 6 | Wood 2 | 4 | — | 2 | |
| smash-the-code | 6 | Wood 2 | 4 | — | 2 | |
| spring-challenge-2020 | 6 | Wood 2 | 4 | — | 2 | |
| spring-challenge-2023-ants | 6 | Wood 2 | 4 | — | 2 | |
| summer-challenge-2024-olymbits | 6 | Wood 2 | 4 | — | 3 | |
| tron-battle | 6 | Wood 2 | 4 | — | 2 | |
| xmas-rush | 6 | Wood 2 | 4 | — | 2 | |
| a-code-of-ice-and-fire | 7 | Wood 3 | 5 | — | 2 | |
| code-a-la-mode | 7 | Wood 3 | 5 | — | 3 | |
| code-of-kutulu | 7 | Wood 3 | 5 | — | 4 | |
| code-royale | 7 | Wood 3 | 5 | — | 2 | |
| coders-of-the-caribbean | 7 | Wood 3 | 5 | — | 2 | |
| ghost-in-the-cell | 7 | Wood 3 | 5 | — | 2 | |
| hypersonic | 7 | Wood 3 | 5 | — | 2 | |
| mean-max | 7 | Wood 3 | 5 | — | 3 | |
| winter-challenge-2024 | 8 | Wood 3 | 5 | TypeScript 104/1145 | 2 | |
| wondev-woman | 7 | Wood 3 | 5 | — | 2 | |
| soak-overflow | 8 | Wood 4 | 6 | — | 2 | |
| botters-of-the-galaxy | 10 | Wood 6 | 8 | — | 2 | |
