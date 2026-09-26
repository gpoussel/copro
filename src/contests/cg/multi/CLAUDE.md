# CodinGame multiplayer bots — working notes

Per-game notes: rules learnt, what beat which boss, what did not work. See the
`codingame-multi` skill for the general play/replay/submit loop.

## tic-tac-toe (Ultimate Tic-Tac-Toe)

Referee source: https://github.com/CodinGame/game-ultimate-tictactoe (checked):
a won **or** full small grid gives a free move; when no move is left, the
player with more small grids won wins (equal = draw); 1000 ms for each
player's first turn, 100 ms after. Inputs give only the last opponent move and
the valid moves, so the bot tracks the board itself.

Bot: MCTS (UCT) on bitboards (9-bit mask per small grid and player, 512-entry
win tables), tree reused between turns, MCTS-Solver (proven wins/losses).

Local referee: `node tic-tac-toe-tools/arena.mjs <a.ts> <b.ts> [games]`
(alternates the first seat). It measures relative strength only.

Measured (40 local games unless noted):

| Change | Result |
| --- | --- |
| Playouts play a game-winning move when one exists | 28–8–4 vs pure random |
| UCT c = 0.5 instead of 0.9 (rewards 0 / 0.5 / 1) | 27–4–9 |
| c = 0.3 vs 0.5 | 8–20–12: 0.5 stays |
| Tree reuse | 26–28–6 over 60: neutral, kept |
| MCTS-Solver | 16–15–9: neutral, kept (exact endgames) |
| Playouts avoid sending the opponent to a board where it wins | 13–21–6: slower, dropped |

On CodinGame the v4 bot (c = 0.5 + solver) beat the first submitted version
8–2 in IDE games. First submission (random playouts, c = 0.9): 1st of Silver,
35.97 vs boss 25.86.

Forum hints (Legend): c ≈ 0.5, draws 0.5, win/block in playouts, solver;
legend bots run 100k+ rollouts per turn in C++.
