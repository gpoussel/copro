# CodinGame multiplayer — league status

Goal: at least **Gold** on every multi (an agent submitted in Gold or Legend).
Refresh with `get_arena_status`; notes and ideas per game live in `CLAUDE.md`.
`to Gold` = promotions still needed; 1- and 2-league games start in Legend / Gold,
so a submitted bot is enough there.

Surveyed 2026-09-26.

| Game | Leagues | Current | To Gold | Agent | Players | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 6-nimmt-6-qui-prend-take-5 | 1 | **Legend** ✅ | 0 | TypeScript Monte Carlo, submitted | 4 | best score in 3/4 games vs 3 bosses (single league) |
| abalone | 2 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (6–0) |
| amazons | 2 | **Legend** ✅ | 0 | TypeScript 1-ply territory, submitted | 2 | 4/4 matches vs boss |
| ataxx | 2 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 6/6 vs boss |
| back-to-the-code | — | **Legend** ✅ (no league) | 0 | TypeScript rectangles, submitted | 2–4 | 4/4 vs boss; submitted after MCP PR #7 |
| bandas | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (single league) |
| blocking | 2 | **Gold** ✅ | 0 | TypeScript greedy, submitted | 2–4 | ~40% vs boss (close scores) |
| breakthrough | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (single league) |
| chain-reaction-1 | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (single league) |
| checkers | 1 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 vs boss (single league) |
| chess | 2 | **Legend** ✅ | 0 | TypeScript alpha-beta, submitted | 2 | 4/4 matches vs boss |
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
| platinum-rift-episode-2 | — | **Legend** ✅ (no league) | 0 | TypeScript spread+rush, submitted | 2 | 4/4 vs boss; submitted after MCP PR #7 |
| poker | 2 | **Gold** ✅ | 0 | TypeScript Monte Carlo equity, submitted | 2–4 | 2/4 heads-up vs boss |
| start-up | 1 | **Legend** ✅ | 0 | TypeScript rules, submitted | 4 | valid; 106–200‰ vs bosses 450–800‰ |
| tower-dereference | 1 | **Legend** ✅ | 0 | TypeScript upgrade-first, submitted | 2 | 4/4 vs boss (single league) |
| tulips-and-daisies | 2 | **Legend** ✅ | 0 | TypeScript 2-ply spots, submitted | 2 | 4/4 vs boss (boss goes bankrupt) |
| twixt-pp | 1 | **Legend** ✅ | 0 | TypeScript distance eval, submitted | 2 | 4/6 vs boss (single league); weak, see notes |
| vindinium | 2 | **Gold** ✅ | 0 | TypeScript heuristic, submitted | 4 | most gold in 3/4 games vs 3 bosses |
| yavalath | 1 | **Legend** ✅ | 0 | TypeScript MCTS, submitted | 2 | 4/4 vs boss (single league) |
| yinsh | 1 | **Legend** ✅ | 0 | TypeScript minimal (list-based), submitted | 2 | 2/2 vs boss; no engine yet |
| beeminegame | 3 | **Gold** ✅ | 0 | TypeScript greedy hives | 2 | Silver→Gold 2026-09-26 (levels/bees in Gold: bot ignores them) |
| counting-tictactoe | 3 | **Legend** ✅ | 0 | TypeScript MCTS | 2 | Gold→Legend 2026-09-27 |
| elemental-wars | 3 | Silver | 1 | TypeScript chase/flee, submitted | 3 | best score 4/6 vs 2 bosses; awaiting promotion (more elementals + freeing prisoners next) |
| mad-pod-racing | 7 | **Legend** ✅ | 0 | TypeScript Gold 2-pod racer, submitted | 2 | 1/4 vs Gold boss; next: blocker pod + collisions (Magus) |
| night-of-war | 3 | **Legend** ✅ | 0 | TypeScript rules | 2 | Silver→Gold 2026-09-26 (Gold rules: 5×5? re-read) |
| penguins | 3 | **Legend** ✅ | 0 | TypeScript Voronoi | 2–4 | Silver→Legend 2026-09-26 |
| space-shooter | 3 | **Gold** ✅ | 0 | TypeScript steering | 2 | Silver→Gold 2026-09-26 (missiles in this league: bot ignores them) |
| spring-challenge-2022 | 6 | **Gold** ✅ | 0 | TypeScript 2 defenders + attacker, submitted | 2 | 4/4 vs Silver boss |
| spring-challenge-2026-troll-farm | 6 | Silver | 1 | C++ 169/683 (user); TS WIP not submitted | 2 | TS greedy 0/4, weaker than the C++ |
| tic-tac-toe | 5 | **Legend** ✅ | 0 | TypeScript MCTS v6 | 2 | Gold→Legend 2026-09-26 |
| volcanoes | 3 | **Legend** ✅ | 0 | TypeScript flat Monte Carlo, submitted | 2 | 4/4 vs Silver boss |
| atari-go | 4 | Silver | 1 | TypeScript tactical | 2 | Bronze→Silver; 1 promotion left |
| atari-go-9x9 | 4 | Silver | 1 | TypeScript tactical | 2 | Bronze→Silver; 1 promotion left |
| code4life | 6 | Bronze | 2 | TypeScript state machine, submitted | 2 | ~2/4 vs Bronze boss |
| coders-of-the-realm | 4 | **Legend** ✅ | 0 | TypeScript greedy placement | 2–4 | Bronze→Silver |
| coders-of-the-realm---1v1 | 4 | **Legend** ✅ | 0 | TypeScript greedy placement | 2 | Bronze→Silver |
| cultist-wars | 4 | Bronze | 2 | TypeScript action scoring, submitted | 2 | 2/6 vs Bronze boss (loses as player 2): improve shooting duels |
| game-of-life-or-death | 4 | **Legend** ✅ | 0 | TypeScript pattern search (scales to 16×16), resubmitted | 2 | 4/4 vs Silver boss (~780–0) |
| gargoyles-versus-santas | 4 | **Legend** ✅ | 0 | TypeScript interception | 2 | Bronze→Silver |
| isola | 4 | **Gold** ✅ | 0 | TypeScript alpha-beta | 2 | Bronze→Gold 2026-09-26 |
| legends-of-code-magic | 7 | Silver | 1 | TypeScript ClosetAI draft + greedy battle, submitted | 2 | 1/4 vs Silver boss |
| seabed-security | 7 | Silver | 1 | TypeScript dive/surface, submitted | 2 | 2/4 vs Bronze boss |
| spring-challenge-2021 | 6 | **Gold** ✅ | 0 | TypeScript rules bot, submitted | 2 | 4/4 vs Bronze boss |
| tryangle-catch | 4 | **Gold** ✅ | 0 | TypeScript capture teams + spawning, submitted | 2 | promoted to Gold |
| winter-challenge-2026-snakebyte | 4 | Silver | 1 | TypeScript greedy BFS, submitted | 2 | 2/4 vs Bronze boss; needs gravity-aware pathing |
| bit-runner-2048 | 5 | Bronze | 2 | TypeScript chase/ram, submitted | 2 | 3/4 vs Wood 1 boss |
| crystal-rush | 5 | Bronze | 2 | TypeScript radars + miners, submitted | 2 | 3/4 vs Bronze boss (close) |
| git-patchwork | 5 | **Legend** ✅ | 0 | TypeScript greedy + rotations, submitted | 2 | 4/4 vs Bronze boss |
| keep-off-the-grass-fall-challenge-2022 | 5 | **Gold** ✅ | 0 | TypeScript expand + recyclers, submitted | 2 | old bot reached rank 1 in Silver; resubmitted by mistake (1-2/4 vs Silver boss) |
| langton-s-ant | 5 | **Gold** ✅ | 0 | TypeScript planned picks (shared grid), submitted | 2 | 4/4 vs Silver boss |
| codebusters | 6 | **Gold** ✅ | 0 | TypeScript rules+STUN+stamina, submitted | 2 | 4/4 vs Bronze boss (close) |
| fall-challenge-2020 | 6 | **Gold** ✅ | 0 | TypeScript BFS over casts + learn, submitted | 2 | 4/4 vs Silver boss |
| fantastic-bits | 6 | Silver | 1 | TypeScript chase+throw+flipendo, submitted | 2 | 2/4 vs Silver boss |
| game-of-drones | 6 | **Gold** ✅ | 0 | TypeScript greedy allocation, submitted | 2 | 4/4 vs Wood boss (~3× its score) |
| great-escape | 6 | Silver | 1 | TypeScript path+walls | 2 | Wood 2→Wood 1 |
| green-circle | 6 | Silver | 1 | TypeScript desk choice, submitted | 2 | 2/4 vs Wood 2 boss |
| ocean-of-code | 6 | Silver | 1 | TypeScript path tracking+silence, submitted | 2 | 1/4 vs Silver boss; old bot 9/690 |
| platinum-rift-episode-1 | 6 | Silver | 1 | TypeScript spread+buy, cluster opening, submitted | 2 | best 3/3 in 4p vs bosses |
| poker-chip-race | 6 | Bronze | 2 | TypeScript rare pushes + predictions, submitted | 2 | 4/4 vs Wood 2 boss |
| smash-the-code | 6 | Silver | 1 | TypeScript 3-ply sim, submitted | 2 | 4/4 vs Wood boss; later leagues add rotations/different colours |
| spring-challenge-2020 | 6 | Silver | 1 | TypeScript beam paths, types, abilities | 2 | Silver boss ~2/6; collection efficiency and deaths |
| spring-challenge-2023-ants | 6 | Silver | 1 | TypeScript harvesting tree, submitted | 2 | 2/4 vs Silver boss |
| summer-challenge-2024-olymbits | 6 | **Gold** ✅ | 0 | TypeScript 4 mini-games, submitted | 3 | best ~4/5 vs Bronze bosses |
| tron-battle | 6 | Silver | 1 | TypeScript Voronoi + 1v1 alpha-beta, submitted | 2 | 3/4 vs Silver boss |
| xmas-rush | 6 | Silver | 1 | TypeScript push search + multi-item moves, submitted | 2 | 2/4 vs Silver boss |
| a-code-of-ice-and-fire | 7 | Silver | 1 | TypeScript levels/towers/mines, submitted | 2 | 0/4 vs Silver boss (HQ defence missing) |
| code-a-la-mode | 7 | Bronze | 2 | TypeScript plate loop + strawberries + croissants, submitted | 3 | best total 3/3 |
| code-of-kutulu | 7 | Silver | 1 | TypeScript flee + group + effects, submitted | 4 | best 2/3 vs Wood 1 bosses |
| code-royale | 7 | Bronze | 2 | TypeScript mines + towers + knights, submitted | 2 | 4/4 vs Wood 1 boss |
| coders-of-the-caribbean | 7 | Silver | 1 | TypeScript barrels + leading shots, submitted | 2 | 4/4 vs Wood 2 boss |
| ghost-in-the-cell | 7 | Bronze | 2 | TypeScript greedy + bombs/evacuation, submitted | 2 | 3/4 vs Bronze boss |
| hypersonic | 7 | Silver | 1 | TypeScript greedy + escape check, submitted | 2 | 2/4 vs Silver boss |
| mean-max | 7 | Silver | 1 | TypeScript 3 units + oil, submitted | 3 | first to 50 in 2/3 vs Wood 1 bosses |
| winter-challenge-2024 | 8 | Silver | 1 | TypeScript harvest + grow + spore, submitted | 2 | 3/3 Wood 1 scenario |
| wondev-woman | 7 | **Gold** ✅ | 0 | TypeScript 1-ply state eval, submitted | 2 | 4/4 vs Bronze boss |
| soak-overflow | 8 | Silver | 1 | TypeScript full-game heuristic, submitted | 2 | 4/4 vs Bronze boss |
| botters-of-the-galaxy | 10 | Wood 6 | 8 | TypeScript Hulk brawler, submitted | 2 | 4/4 vs Wood 6 boss |
