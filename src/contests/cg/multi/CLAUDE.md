# CodinGame multiplayer bots — working notes

Per-game notes: rules learnt, what beat which boss, what did not work. See the
`codingame-multi` skill for the general play/replay/submit loop.

**Trust the referee, not the statement.** Several statements are wrong about
the input (Ataxx row order, Checkers colour letter). When the referee lists the
legal moves, have the engine regenerate them and compare the *sets* (a
mirrored board has the same move count), and derive orientation/colour from
them. A crash shows up only as "timeout" with no stderr: replay the first
input locally (`tic-tac-toe-tools/shim.mjs` runs a bot on piped input).

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

## clobber

8×8, board given each turn (only the move count, not the list). Normal play:
no move = loss. Bot: MCTS (c = 0.5), uniform random playouts. 4/4 vs the
boss. Ideas: tree reuse, combinatorial-game decomposition of the endgame
(independent regions), MCTS-Solver.

## ataxx

7×7 with walls, 100 ms. **The statement says rows come bottom-to-top, but they
come top-to-bottom**: a mirrored board has the same move count, so the bot
checks that every referee move exists in its own move list and flips the rows
otherwise. Bot: negamax alpha-beta, eval = piece difference (incremental
counts, leaves return before move generation), spawns searched first.
0/4 before the row fix, 6/6 vs the boss after.

## dots-and-boxes

Gold entry league plays on 2×2. Input lists the boxes that still have free
sides (box name `A1` = column A, row 1 from the bottom; sides L/T/R/B).
Closing a box gives another move, so MCTS nodes store their mover. Playouts:
capture if possible, else a side that gives no 3-sided box, else random.
Wins every game as A; as B the 2×2 ends 2–2 and the referee ranks that as a
loss (tie-break not in the statement: read the referee before optimizing).
Next: check the referee's tie rule; chain/long-chain rule for bigger boards.

## hex

11×11, single league; `d4` = column d, row 4, a1 top-left; red joins top and
bottom. Neighbours (r±1 / c±1 plus (r-1,c+1) and (r+1,c-1)) confirmed by
4/4 wins vs the boss. Bot: MCTS with random-fill playouts (one flood fill per
playout), ~13k iterations per 80 ms on CG; swap if red's first stone is 2+
cells from every edge. Ideas: RAVE/AMAF (a big win in Hex), bridge patterns
in playouts, tree reuse.

## amazons

8×8, a match = 2 games with colours swapped (colour re-read each turn). Rows
top-first, `d8d1d7` = from, to, wall with chess ranks (confirmed: 4/4 wins).
Bot: 1-ply search over all moves, territory eval from queen-move BFS
distances (ties lean to the side to move). Ideas: 2-ply on the top-k moves,
king-distance + mobility terms (the usual Amazons eval mix).

## checkers

8×8 American-style (men forward only, one-step kings, mandatory chained
captures, a man reaching the far row stops). **The colour line may be `w`
although the statement says `r`/`b`**; the rank numbering and direction are not
stated either. The bot derives its colour from the piece on the first legal
move's start square, then picks the orientation (rank 8 on top or bottom ×
forward direction) that reproduces the referee's move list exactly. Negamax
alpha-beta (man 100 + 3·advance, king 160) with a capture quiescence. 4/4.

## onitama

5×5, 50 ms. Cards: 2 per player + centre; the given vectors are for the next
user of each card, a played card goes to the centre negated. Orientation found
on CG: `A1` is on the **last** input line and row delta = −dy. Actions are
`cardId A2B3` or `cardId PASS`. Bot: negamax alpha-beta, eval = 100/student
+ master distance to the enemy shrine. 4/4 vs the boss (wins in 4–8 moves).

## nine-mens-morris

24 fields, adjacency given at start; mills derived from the coordinates
(rows/columns, row 4 and column D split in two). Stones in hand tracked by
turn count. 50 ms. Bot: negamax alpha-beta (100/stone incl. hand, ±15 per
open two-in-a-mill), mill moves searched first; the engine's commands match
the referee's (no desync). 4/4 vs the boss.

## yavalath

61-cell hex board; 4 in a row wins, 3 (without 4) loses. **The opponent move
arrives as `x y` on one line** (the statement lists two lines): found with
`tools/echo-input.ts`. Coordinates: y = row, x = index in the row; axial
a = x + max(0, y − 4) gives line directions (1,0), (0,1), (1,1). Bot: MCTS,
playouts retry suicidal (3-making) moves up to 4 times, move outcomes stored
in the nodes. No steal. 4/4 vs the boss.

## lines-of-action

8×8, 150 ms, first input line = rank 8, legal moves listed (engine matches).
Bot: negamax alpha-beta; eval = 20·(groups diff) + 40·(concentration diff) +
centre table; captures and centre-bound moves searched first; the opponent's
connection is only tested after a capture. First version (no centre term,
full terminal test) lost 0/4 to the boss; this one wins 4/4 in ~13 moves.
Ideas: quads/Euler number, mobility, MCTS-Solver (Winands).

## tulips-and-daisies

Width × height up to 16, 256 turns, 50 ms. Harvest pays FibSum(N) for the N
flowers taken in one move (all directions together), so big simultaneous
harvests dominate (`XXX_XXX` = 33). A greedy "harvest now + line potential −
opponent's reply" bot lost 0/4 (~170 vs ~450 gold). Current bot: per move,
profit (harvest applied) + 0.7·(our best next spot + ½ second) − the
opponent's best next spot: 4/4, the boss runs out of gold.
Ideas: value spots that cross two lines; plant on the opponent's big spot
even at cost 10; keep a gold reserve.

## chain-reaction-1

6×6, single league, 100 ms. Rows arrive rank 6 first, 2 chars per cell.
Explosions resolved wave by wave (stop when the opponent owns nothing).
Bot: negamax alpha-beta (depth ~5), eval = orbs + 2 per cell, a cell next to
an enemy cell one orb from critical counts as lost. 4/4 vs the boss.
