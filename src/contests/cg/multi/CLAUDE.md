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

## mad-pod-racing (Coders Strike Back)

Silver = one pod each, inputs: own pos, next checkpoint, its distance and
angle; opponent pos. Physics (verified: predicted position error 0-1 unit):
facing = atan2(cp - pos) - nextCheckpointAngle (degrees, y down); rotate by
≤ 18°, v += thrust·dir, pos += v, v = trunc(0.85·v), pos rounded; BOOST = 650.
The seed string also carries the map (`map=x y x y ...`), handy to replay.

Bot: random-restart + mutation search over 6-turn (rotation, thrust) plans,
checkpoints learnt during lap 1, heading bonus in the evaluation. Opponent
ignored (no collisions simulated, no SHIELD yet). 8/8 vs the Silver boss.

Gold changes the protocol (2 pods each, full checkpoint list given up front):
rewrite the I/O, then add a blocker pod and collisions (Magus' post-mortem:
http://files.magusgeek.com/csb/csb_en.html).

## connect-4

7 rows × 9 columns, STEAL available to the second player on its first turn.
Full board given each turn. Bot: MCTS (c = 0.5, decisive-move playouts, no
tree reuse), STEAL when the first chip is in columns 2–6. The boss is weak
(6/6, wins in 4 moves). Next: tree reuse, threat-aware evaluation.

## othello-1

8×8, 150 ms per turn (2 s first), legal moves given as `d3` (column letter,
row from the top). Bot: negamax alpha-beta, iterative deepening, classic
square weights + 8·mobility, exact disc count at game end. 3/4 vs the boss
(Gold entry league). Ideas: bitboards (two 32-bit halves) for depth, better
eval (frontier discs, stability, parity), endgame solver at ~14 empties.

## oware-abapa

12 houses, only the seeds are given (no scores): our captures are tracked from
our own moves, the opponent's = 48 − seeds on board − ours. 50 ms per turn.
Abapa rules implemented: 12+ seeds skip the starting house, grand slam cancels
the capture, a move must leave the opponent seeds (else the mover takes all).
Bot: negamax alpha-beta, eval = capture difference. 4/4 vs the boss.

## breakthrough

8×8, single league. Input: opponent's last move (`None` = we are White) and
the legal moves; the board is tracked from the moves. Bot: negamax
alpha-beta, eval = 100/pawn + 3·advancement² + 200 on the 7th rank, immediate
win detection. 4/4 vs the boss. Ideas: MCTS (strong in Breakthrough per the
literature), better eval (defended pawns, holes in the home row).
