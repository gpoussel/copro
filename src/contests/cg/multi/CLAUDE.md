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

**Promoted to Gold on 2026-09-26.** Gold changes the protocol (2 pods each,
full checkpoint list given up front), so the Silver bot plays badly there:
rewrite the I/O, then add a blocker pod and collisions (Magus' post-mortem:
http://files.magusgeek.com/csb/csb_en.html).
Gold bot (submitted right after the promotion): both pods race with the same
6-turn plan search (known checkpoints, exact speeds/angles), one BOOST on a
> 5000 straight. No collisions, no blocker: 1/4 vs the Gold boss. Next: a
blocker pod that intercepts the leading enemy pod, collision simulation and
SHIELD, then Legend.

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

## dice-duel

Rules taken from the referee (github.com/eulerscheZahl/Dice-Duel): state =
top, front, bottom, back, left, right; U = y+1 rotates top←front←bottom←back,
R rotates top←left←bottom←right; paths are self-avoiding, cannot cross dice,
may capture on the last step only; no legal move = loss, else more dice wins.
**League 2 (Legend) only allows captures where the two tops sum to 7** (and
filters the move list accordingly): flip `SEVEN_RULE` after the promotion.
Bot: moves deduplicated by (end cell, orientation), 1-ply with a penalty when
the opponent can capture back. 4/4 vs the boss.
Promoted to Legend 2026-09-26; `SEVEN_RULE` is now on. In Legend the bot
loses mostly by having no legal move (the 7-rule filters moves): the eval
must value our own mobility after the reply.

## paper-soccer

Geometry from the referee (github.com/jdermont/CodinGame-paper-soccer):
points x 0..8, y 0..10, goals y = −1 / 11 at x 3..5; borders pre-drawn except
the mouths (3,0)–(5,0) / (3,10)–(5,10); goal posts drawn; the diagonals from
goal corners outwards ((3,−1)–(2,0) …) do not exist. Arriving on a point that
already has a line bounces; a stuck ball loses for the mover. Player 0 scores
at the top; 0 = N (y−1), clockwise. Input = opponent's last move only.
Bot: two-ply over whole turns (bounce chains enumerated with leaf caps), eval
= distance of the ball to the target goal. 4/4 vs the boss.
Ideas: deeper search with a better eval (dead ends, safe points), turn caching.

## twixt-pp

12×12 minus corners; `D6` = column D, row 6. First player joins rows 1/12,
second columns A/L; links are automatic (knight moves not crossing enemy
links; own links may cross). Input lists both sides' pegs and links.
Bot: every candidate peg scored by 2·(opponent's holes-needed) − ours, from a
0-1 BFS over knight links that cross no enemy link (crossings precomputed).
The boss swaps a central first peg (F6), so the first peg is C4. 4/6 vs the
boss: the distance eval misses bridge/edge templates. Ideas: MCTS with
random-fill playouts like Hex, or a proper two-distance / template eval.

## bandas

8×8, single league, 100 ms. Move code ported from the referee
(github.com/Oli8/CG-bandas): recursive pushes, death off-grid or in holes,
outer empty lines/columns turn into holes, 200 turns then pawn count. Bot:
negamax alpha-beta (depth 5–9), eval = 100/pawn + up to 12 for distance from
the live area's border. 4/4 vs the boss.

## domain-expansion

7×7, single league. Input: sizes and both tokens at start, then only the
opponent's last action `x y D`. Move ≤ 3 steps (walls and the enemy token
block), then a wall on one side of the token. Bot: negamax alpha-beta over
(cell, wall) moves, Voronoi eval, exact domain sizes once separated; walls
rebuilt from the history after an interrupted search. 4/4 vs the boss
(domains 42–48 vs 1–2).

## impasse

Single league. Legal moves listed (1–3 coords: move, transpose, impasse
removal, + crown). An impasse-removal+crown move also has 2 coords like a
slide: decide impasse on the whole list (no empty landing, no transpose).
Current bot: 1-ply, apply the move with bear-off/crown, eval = fewer own
checkers + progress. **Loses 0/4 to the boss.** Key insight not yet used:
an impasse is a free removal for the side in it, so blocking the opponent
helps *them*; tempo matters. TODO: full move generator (slides, transposes,
impasse), alpha-beta with a checker-count/tempo eval.

## mad-knights

3-player knight isolation, single league, 100 ms; board rows rank 8 first,
legal moves listed. Bot: paranoid alpha-beta (both opponents minimise our
value), eval = 10·our mobility − 6·each opponent's. 3/6 wins vs two bosses,
2nd otherwise. Ideas: max-n instead of paranoid, area (BFS) eval late game.
(MCP note: in 3-player games the `events` names can show "me" for another
seat — check `ranks` for the real outcome.)

## blocking

Blokus-like, 13×13, valid moves listed as `col row Xfrn`. **Geometry fitted
on a real move list (48/48), the statement is vague**: flip = transpose
(x,y)→(y,x), then r clockwise rotations (x,y)→(−y,x), and n is the square's
index in the ORIGINAL shape's reading order. Greedy bot: 10·size + our
corner cells − 1.5·each opponent's, centre pull for the first 6 moves.
~40% vs the boss with close scores (BLOCK weight 0.5 / 3 not better).
Ideas: 2-ply (opponent's best greedy reply), keep big shapes placeable.

## abalone

Hex side 5, 75 ms. Moves are `a b c d dir`; the coordinate order and the
direction labels are only in an image, so they were fitted by trying all
2 × 720 mappings against the referee's list (every game agreed): pairs are
(index, row), label k = axial direction [(1,0),(0,−1),(1,−1),(−1,0),(−1,1),
(0,1)][k] with axial r = row − 4, q = index − 4 + max(0, 4 − row). Doing that
search every turn timed out: it is hard-coded now. Bot: negamax alpha-beta
(depth ~2), eval = 1000/marble off + centrality + cohesion. 4/4 (6–0).

## minishogi

5×5, single league. Coordinates: column 5 = left file, row 1 = top line;
`5544`, `1425+`, `G*33`. Pseudo-legal engine (moves, promotions with forced
pawn promotion, drops with pawn restrictions; a king capture ends a line),
the root plays only moves from the referee's list (it handles check, pawn-drop
mate, repetition). Negamax alpha-beta, material eval (hand ×0.9). 4/4.
The same engine should carry over to dice-shogi.

## dice-shogi

Minishogi + a die choosing the destination file (extra input line). Same
engine as minishogi.ts; the referee's list applies the die at the root, the
search lets the opponent use any file (pessimistic). 4/4 vs the boss.
Ideas: expectimax over the opponent's die.

## 6-nimmt-6-qui-prend-take-5

4 players, single league. **Input order differs from the statement**: last
played cards, 4 × (count, cards), scores, hand count, hand, then the phase
(last). With an empty hand the empty hand line is still sent: read until the
`CHOOSE_…` keyword. Output `PLAY card` / `PICK line` (0–3). Bot: Monte Carlo
over the opponents' cards (sampled from unseen cards), play the card with
the fewest expected cows; pick the cheapest line. Best score in 3/4 games vs
three bosses. (The play result's `ranks` did not match the scores here: judge
by `scores`.)

## chess

Chess960, a match = 2 games, 50 ms per move (1 s only for the constants
turn, where the bot answers `fen moves`). Root = referee's legal UCI moves
(castling = king onto its rook; en passant handled when applying); search =
pseudo-legal generator (no castling/e.p., queen promotions, king capture
ends a line), alpha-beta + capture quiescence + MVV-LVA, material + small
piece-square eval. **Timeouts on the first real moves** until: time checked
every 128 nodes, 30 ms budget, and a 400 ms JIT warm-up search during the
constants turn. 4/4 matches vs the boss.

## yinsh

Single league. First turn: answer `yes` to receive legal moves. Input per
turn: row count, grid rows, action count, actions (`c6`, `STEAL`, `f2-f5`,
`h7-c7;xh5-h9xi9`…). Minimal bot: central ring placement, else the move with
the most `x` removals (each = a row + one of our rings), else random. Beats
the boss 2/2. TODO: engine (ring moves, flips, rows) + search.

## vindinium

4 heroes, 150 turns; x = column, y = row, NORTH = y−1. Heuristic: BFS to the
nearest mine we do not own; drink at a tavern when HP < 40 or when the mine
fight (−20 HP) would leave ≤ 15 (stay until 80 HP if already next to one);
never step on another hero's spawn. Most gold in 3/4 games vs three bosses.
Ideas: hunt weak heroes owning many mines, avoid adjacent stronger heroes.

## fireworks

Hanabi, 3 of 4 players per round (ids in the input are round ids; NEWGAME's
id is ours). CARD lines repeat all knowledge each turn (ours with `?`).
**Invalid actions found the hard way**: discarding with an empty deck (track
it: 35 after the deal, −1 per PLAY/DISCARD/ERROR), and naming an empty slot
(with an empty deck a played slot stays empty, letters do not shift).
Policy: play a surely playable card, else hint a partner's playable card by
level, else discard a useless / least-known card. Valid, but the lowest score
of the table. Ideas: hint what the partner does not know yet (track our own
hints), prefer colour hints for 5s, "chop" conventions.

## code-keeper---the-hero

Single league, each player plays its own maze (16×12, fog range 3, 150
turns): exit +10000, death −1000. Explorer bot: map memory, sword adjacent
monsters, bow dangerous ones (gargoyle/orc/vampire) in range, potion when
HP ≤ 10, exit when seen, else items, else nearest frontier. Scores close to
the bosses; in the tests nobody found the exit. Ideas: explore by
information gain, avoid fights, hammer/scythe on groups.

## clash-of-bots

Single league, torus arena, 5×5 minimap per robot (health values, enemies
negative), actions resolved moves → attacks → self-destructions. Rule bot:
attack the weakest orthogonal enemy, self-destruct when ≥ 3 enemies around,
HP ≤ 4 and no ally near, guard when an enemy is within 2, else close in.
1/4 vs the boss with close robot counts. Ideas: focus fire across robots,
dodge predicted attacks, keep formation.

## tower-dereference

Single league, constants from the referee (github.com/eulerscheZahl/
TowerDefense): gun 100 (dmg 5/8/15/30, range 3–6, reload 5/4/3/2), glue 70,
upgrades 50/100/150 per property level. Building 6 plain gun towers lost 0/4
(no lives left by turn ~150). Upgrades are the value: 3 gun towers + 1 glue on
the plateau cells covering the most canyon (weight = closeness to our base²),
then damage ×3, reload ×3, range ×3 on the best tower, then the next: 4/4.

## poker

Texas hold'em 2–4 players, legal actions listed (`BET_x` = min raise; output
`BET amount`). Bot: Monte Carlo equity (7-card evaluator) vs the opponents
not folded this hand (FOLDs tracked from the action log); raise the pot at
equity > 0.75, call when equity beats pot odds + 5%, else check/fold. 2/4
heads-up vs the boss. Ideas: position, stack-aware shoving as blinds grow,
opponent modelling from showdowns.

## legends-of-code-magic-constructed

Single league. Constructed turn: 120 cards, answer 30 `CHOOSE n` where **n is
the card's base number (cardNumber), not the instance id**, ≤ 2 copies per
number. Deck: value-per-cost score with a mana curve cap (≤ 10 items).
Battle: greedy summons (lane under pressure / less full, Lane1/Lane2 area
clones tracked), red items on guards/threats, green on our best creature,
blue to face, attacks: guards first, then kill-and-survive trades unless we
have lethal, else face. 6/6 vs the boss. The battle code should carry over
to legends-of-code-magic (draft variant).

## start-up

4 players, single league, **one input value per line** (the statement shows
one line of 11). Reputation = 100·features / (3·bugs + fixed bugs), capped at
2000; stealing share needs reputation ≥ the victim's, so bugs are fatal.
Bot: devs 1/5 on features, 4/5 on tests (tests ≥ 4·features ⇒ no bugs), 20
features then 2 devs; sellers from 8 features (unfilled market, competitive
once the market is full); 1 manager per 4 employees; hires capped by a 4-turn
cash reserve. First version (40% of devs on features) sat at ~10‰ share; now
106–200‰ but the bosses reach 450–800‰. Ideas: faster ramp-up (more managers
early), earlier sellers, target the leader with the focus rule.
In 4-player IDE games, check `scores` rather than `outcome`.

## back-to-the-code

League-less (old BOT_PROGRAMMING), 35×20. Bot: best rectangle by neutral
cells gained / (distance to nearest corner + perimeter cells to claim), no
enemy cell inside, walk it corner to corner, replan when an enemy cell shows
up in it (prefix sums make each rectangle O(1)). 4/4 vs the boss (~2.5× its
cells). Submitted once MCP PR #7 (ranking calls best-effort) was merged; the pre-submit ranking call used to error on
league-less puzzles (fixed in codingame-mcp PR #7).

## platinum-rift-episode-2

League-less, zone graph under fog, enemy base always visible (owned by the
enemy on turn 1). Bot: each group sends 1 pod to every unowned neighbour
(platinum first, then towards the enemy base), the rest walks the shortest
path to the enemy base; 2 pods stay home when enemies are adjacent; pods in a
fight never retreat into enemy zones. 4/4 vs the boss (base taken in 13–19
turns). Submitted after MCP PR #7.

## counting-tictactoe

10×10, 3 leagues (Silver start). Board full ⇒ most 3-cell windows wins; two
matches per game, colours swapped. Board tracked from the valid-move list
(new match = the valid count goes back up). MCTS with random-fill playouts,
reward 0.5 + 0.5·tanh(diff/4). 4/4 vs the Silver boss (≈ +40 windows).

## volcanoes

80-tile sphere (neighbours given), 3 leagues (Silver start). Connect N_k to
S_k. Bot: 1-ply over valid moves with eruptions simulated (level 4 → dormant,
spreads to empty/own neighbours, destroys enemy ones, cascades), eval =
Hex-like 0-1 BFS distance per opposite pair for both sides. Growth phases not
simulated. 3/4 vs the Silver boss. Ideas: simulate growth, 2-ply.
Silver (stuck 82/125 with the 1-ply bot). Referee: github.com/skotz/
codingame-volcanoes (`Board.java`): cycle of 6 = P1, P2, growth, P2, P1,
growth; eruption deltas +1 empty / +1 own / −4 enemy (sign flip clears),
dormant = level 4, cascades in phases; win = own chain joining Nk–Sk.
Now flat Monte Carlo: UCB1 (c 0.7) over our legal moves, uniform random
playouts of the exact rules (our turn index derived from "empty board at
our first turn" = first player), immediate wins first. 4/4 vs the Silver
boss (wins in 7–17 turns).

## penguins

Hey That's My Fish, 3 leagues (Silver start), moves listed. Rows of 7 and 8,
row 1 has 7: even-r offset (odd-numbered rows shifted right), axial
q = c − (r + (r&1))/2 with 0-based r (checked on the statement's F4
example). Bot: 1-ply, 3·fish eaten + fish-weighted Voronoi from slide-move
BFS distances − 8 per isolated penguin; placements scored the same. 4/4 vs
the Silver boss but by 5–100 points. Ideas: 2-ply / paranoid search late.

## night-of-war

3 leagues (map 4, 5, 8; levels/upgrades later). One action per turn. Attack
= target within Manhattan 2 and not behind the attacker's facing, level ≥
target, 35 bucks. Bot: attack whenever possible, else the move taking an
unowned block without ending where an enemy could attack. 4/4 vs the Silver
boss (wins in 6 turns). Re-read the statement after promotion (new rules).

## space-shooter

3 leagues. **Unit types arrive as letters** (`S` ship, `B` bullet; the
statement says Ship/Bullet). League 1 bot: steering sum (walls, keep ~350
from the enemy, flee bullets within 260, damping), fire when ready with a lead
on the enemy's velocity, bullet velocity made relative to our ship. 4/4 vs the
Silver boss. Next league adds missiles: re-read the statement.

## elemental-wars

3 players, 3 leagues (Silver start; 1 elemental per tribe on 11×11 here,
more elementals, rescuing prisoners and bigger maps later). Water > Fire >
Plant > Water. Bot: per elemental, among stay + 4 neighbours, never end
within 1 step of a predator, else get closest to a prey (all-pairs BFS on the
static map). Best score in 4/6 games vs two bosses.

## beeminegame

3 leagues (Silver start; levels and bees unused in league 1). 19×9, one
neutral square per turn next to our territory; each hive scores for the
strictly closer territory. Greedy: most hives won, then closeness to hives
still contested. 4/4 vs the Silver boss.

## isola

9×9, 4 leagues (Bronze start). Input: opponent position + its removed tile
(one value per line). Bot: negamax alpha-beta, removals limited to tiles
within 2 of the opponent, eval = 3·our mobility − 6·theirs + Voronoi
territory; the removal map is snapshotted each turn to undo a search cut
by the timeout. 4/4 vs the Bronze boss.

## atari-go / atari-go-9x9

Captures only, 80 turns, no suicide, ko = cannot recreate the board as it was
after our previous move; ties go to more stones played (never pass). x =
column. Same bot for both: every legal move scored by captures (×30), the
opponent's best immediate capture afterwards (×−25), group liberties (atari
heavily penalised), slight centre pull. 4/4 vs both Bronze bosses (e.g. 16–1,
34–0). atari-go's later leagues use 13×13 and 19×19 boards.
Silver (200 turns): crushed 0/4 (23–86, 11–97 captured stones): the boss
reads ladders / nets. Needs real capture reading (ladder search for
2-liberty groups, defend by extension only when it gains liberties) or
MCTS with capture-aware playouts.
atari-go.ts now searches 3 plies (our top 10 moves, its top 7 replies, our
top 5 follow-ups, each ranked by the 1-ply heuristic, 80 ms): 1/4 on 13×13
(scores closer), still 0/4 on 9×9 (atari-go-9x9.ts kept on the 1-ply bot).

## cultist-wars

13×7, 4 leagues (Bronze start), one action per turn. Bresenham line from the
lower y (as the statement says) for shot blocking. Bot: score every action —
conversions (neutral 8, enemy cultist 12), shots (damage, +10 kill, +100
leader kill), leader steps towards the nearest convertible unit minus the
enemy fire on the destination, cultists close in on the enemy leader. 2/6 vs
the Bronze boss: wins as player 1, loses as player 2 (units shot down).
Ideas: 2-ply over actions, keep cultists out of enemy lines, read the source.
Referee: github.com/kgeilmann/cultist-wars-referee. Exact rules: damage
7 − Manhattan distance to the unit actually hit (hp 10), range 6; the
bullet line is traced from the shooter when shooter.y < target.y, else
from the target (the hit is then the blocker closest to the shooter),
Bresenham with `e2 > -dy` / `e2 < dx` (our old line differs on ties);
friendly fire; score = units at round 150; players alternate turns. A
2-ply search on an exact simulation (`legacy/cultist-wars-2ply.ts`) went
0–1/4 (too passive: waits while the boss converts the neutrals): the old
rule bot stays submitted. Next: race for neutrals first, then fight.
Replay (0–9 loss): the leader oscillated between two cells for 40 turns
(greedy Manhattan step against a wall). The leader now follows a BFS
distance map from the free cells next to convertible units (danger ×0.5
as tie-break), and while neutrals remain that walk (4.5) beats chip
shots (kills and conversions still first). 3/4 vs the Bronze boss (arena
was 17.2 vs 28.9).
That version: arena 22.6. The boss focuses our leader (SHOOT 0 five times
in a row). Next version (A/B via the arena, IDE 1/4 and 2/4 = noise):
referee-exact firing line (legacy trace), lethal squares weigh ×5 in the
leader's walk, the leader flees a lethal square first (9), shots on
cultists that can hit our leader +3. Tried and reverted: cultists
advancing on the nearest enemy when not ahead (walked into fire one by
one, 0–1 wipe-out). **`get_arena_battles` outcomes are unreliable here**
(one "loss" had ranks [1, 0] = our win): read `ranks` in the replay.

## tryangle-catch

4 leagues (Bronze start = league 1: MOVE + SPAWN). Rules from the referee
(github.com/eulerscheZahl/TryAngle-Catch, `Board`, `Triangle`, `Node`):
a node belongs to the side with more units, or to a side with a majority
on every neighbour (surround); a triangle captured by owning its 3 nodes
STAYS ours (+1 point per turn) until the enemy captures it, even after we
leave; SPAWN uses a triangle owned since last turn: +1 unit, the triangle
is lost and cannot be recaptured until our units leave its nodes; units on
a node whose neighbours all have an enemy majority die. The first WIP
spawned all game long (killing its own income) and lost 0/6.
Bot: teams of 3 — each capturable triangle is priced by the distance of
its 3 nearest free units (+ enemy units on it), cheapest first, units step
along shortest paths avoiding death traps; spawns only while army < 6
before turn 40 (army < 10 / turn 80 did worse). 1/4 vs the Bronze boss:
we end up eliminated (units picked off one by one). Next: keep teams
together, stop walking next to enemy majorities.
The boss code is in the repo (`config/level1/Boss.cs`): it SPAWNS every
turn it owns a triangle (up to one unit per node), sends its 3 closest
units to the cheapest capturable triangle and moves the others randomly.
Spawning without limit (army < node count) instead of "army < 6, turn <
40": 4/4 vs the Bronze boss (e.g. 4937–26, 559–17).

## game-of-life-or-death

8×8 Life, rows wrap vertically, each player evolves alone, clashes cancel;
we always control the leftmost column (input mirrored for player 2), ≤ mana
live cells per turn. Model (worked first try): set our column, then run
generations. Bot: all column patterns within the mana (≤ 256), 6 generations
simulated with empty future columns, score = goal-cell occupancy weighted
towards sooner turns. 4/4 vs the Bronze boss (~590 to 1).
Silver (league 2) is 16×16 with 8 goal cells and 12 mana: the exhaustive
search timed out on turn 2. Now: time-bounded random column patterns
(often compact blocks), 16 generations, + a bonus for our cells advancing to
the centre columns. 4/4 vs the Silver boss (~780 to 0).

## gargoyles-versus-santas

4 leagues (Bronze start: 1 gargoyle, value-1 presents, no cooldown use).
y = 0 is the ground; presents fall |vy| per turn; destroy within 30 at the
end of a turn; fly ≤ 150. Bot: per gargoyle, the present interceptable
soonest (penalty if the enemy reaches it first), fly to the interception
point. 4/4 vs the Bronze boss. Later leagues: more gargoyles, values,
cooldowns.

## coders-of-the-realm---1v1

Kingdomino for 2 (4 leagues, Bronze start); each player plays two
PUT+PICK series per round (the `current` flag marks the tile to place now).
Grid is 13×13 with the castle in the middle, territory ≤ 7×7. Bot: best
placement by resulting score (Σ zone size × crowns), pick the free tile with
the best follow-up on our board. 4/4 vs the Bronze boss (~130 to 25).
The same code should suit coders-of-the-realm (2–4 players): check the input.

## coders-of-the-realm

Kingdomino 2–4 players: same bot as the 1v1 with an init line (players,
tiles per turn), 9×9 grids, 5×5 territory, one grid per player. Best score
in 4/4 vs the Bronze boss.

## winter-challenge-2026-snakebyte

Gravity snake game, 4 leagues (Bronze start). Body given as `x,y:x,y:...`
head first; directions persist until changed. Greedy bot: avoid neck,
platforms and bodies (energy is solid but edible), avoid cells next to enemy
heads, BFS distance to the nearest energy (gravity ignored), +3 when the head
stays supported. 2/4 vs the Bronze boss. Ideas: simulate falls exactly (the
referee source is on GitHub once published), plan short paths that stay
supported.
Referee: github.com/CodinGame/WinterChallenge2026-Exotec (`Game.doMoves /
doBeheadings / doFalls`): grow on energy, a head in a platform or body is
cut (≤ 3 long dies), then a snake with no cell resting on platform /
energy / another snake falls (dies below the map). New version: per snake,
simulate each first move exactly, then a BFS (depth 6, 250 nodes, 30 ms
per turn) over real moves to the soonest energy; −30 for a cut, −20 next
to an enemy head. 4/4 vs the Bronze boss (the first try without a time
guard timed out). **Not submitted yet: the old bot is rank 1/617 at 100 %
(promotion pending) — submit after it moves up.**
(It was actually below the boss: 24.18 vs 24.57 — submitted, promoted.)
Silver: search widened to depth 8 / 600 nodes (still 30 ms guard): 4/4
vs the Silver boss (3/4 before); arena was 20.7 vs 22.5.

## tron-battle

30×20 light cycles, 2–4 players by league (6 leagues, Wood 2 start). Only
tails and heads are sent each turn, so trails are accumulated (a dead
player's trail is cleared). Bot: per safe move, Voronoi (our reach vs the
opponents' next heads) while in contact, else reachable area with wall
hugging. 4/4 vs the Wood boss. Ideas: minimax/articulation points (the
classic Tron AI), better endgame filling.
Silver: with exactly two players alive, iterative-deepening alpha-beta
(our move then theirs, head-on = 0, no move = loss) on the Voronoi
difference (×4 once separated), 70 ms. Old 1-ply bot 1/4, alpha-beta 3/4
vs the Silver boss. Ideas: articulation points / tree of chambers for the
separated endgame.
Separated positions now score the fillable cells (checkerboard parity:
moves alternate colours, first the colour opposite the head, so a region
fills ≤ 2·min + 1). 3/4 again; arena 29.48 vs boss 30.90 before it.
It ranked lower (27.3): reverted to the plain alpha-beta version.

## great-escape

Quoridor 9×9, 2–3 players (6 leagues, Wood 2 start). **Init values come on
one line** (the statement lists four lines). Walls: H at (x,y) blocks
(x,y−1)↔(x,y) and (x+1,y−1)↔(x+1,y); V at (x,y) blocks (x−1,y)↔(x,y) and
(x−1,y+1)↔(x,y+1); overlaps and crossings (H(x,y) × V(x+1,y−1)) rejected;
every player must keep a path. Bot: walk the BFS shortest path; when an
opponent would arrive first, place the wall with the best (their extra
length − ours). 4/4 vs the Wood boss.
Silver: 2/4 vs the boss (KommanBoss walls us early). A 2-ply 1v1 search
(our move / top-8 walls, then its move / best wall; race margin + 0.25
per wall kept) never placed a wall and lost 1/4: reverted. Next: value
walls by the race margin *after* they are spent, save walls for when the
opponent is 2-3 moves from its goal.
Replays: the threat test counted distance ties as lost, but whoever is
to move wins a tie (everybody else plays after us), so it walled from
turn 1; as seat 1 it spent 8 walls in 8 turns for +1 each and was walled
back. Now: threat only when strictly shorter, walls only when the threat
is ≤ 3 from its goal or the wall gains ≥ 3, and moves pick the
shortest-path step a single enemy wall lengthens least. 4/6 vs the
Silver boss (arena was 24.2 vs 26.5).

## poker-chip-race

Counts on two separate lines. **Every push costs 1/15 of the chip's
matter**: the first bots pushed nearly every turn (chasing / fleeing) and
shrank until eaten (0/6; a WAIT-only bot also gets eaten). Now pushes are
rare: straight-line predictions with wall bounces; push away only when a
bigger object is predicted to touch us within 6 turns; smaller own chips
merge into the biggest; otherwise push towards prey only when our drift
touches no smaller object within 20 turns. 4/4 vs the Wood 2 boss.

## game-of-drones

2–4 players, 3–11 drones, 4–8 zones (6 leagues, Wood 2 start). Greedy
allocation: need per zone = strongest enemy group within 600 + 1 (1 to keep
an owned quiet zone), zones served cheapest first by the nearest free drones,
leftovers to the most contested zone. 4/4 vs the Wood boss (~3× its score).

## platinum-rift-episode-1

2–4 players (6 leagues, Wood 2 start). Pods cost 20, bought onto neutral or
own zones. Bot: buy on the richest neutral zones, then on our zones touching
enemies; each group sends 1 pod per unowned neighbour it outnumbers
(platinum first), the rest steps towards the nearest unowned zone. 4/4 vs the
Wood boss.
Bronze = 4-player games (rank 361/401): the 1-pod-per-rich-zone opening
got wiped out by turn 5 (test with `opponents=["boss","boss","boss"]`).
With 3+ players the opening now buys 2 pods per zone inside the richest
2-link area: best score in 3/3 four-player games (~145 vs ≤ 17).

## smash-the-code

6 leagues (Wood 2 start). League 1: vertical same-colour pairs, output a
column. Bot: drop/chain/skull simulation, 3-ply exhaustive over the known
pairs, eval = cleared blocks × chain² + same-colour contacts − height.
4/4 vs the Wood boss. Bronze: two colours per pair and rotations (`x r`,
r = 0 B right of A, 1 B above, 2 B left, 3 B below): 22 placements, search
cut to 2 plies. 4/4 vs the Bronze boss.
Silver: 1/4 vs the boss (it buries us with big combos). A beam search
(width 120, 80 ms, real score formula 10·B·(CP+CB+GB), contacts/height
potential) went 0/4 then 1/4 after reweighting: kept in
`legacy/smash-the-code-beam.ts`. Pitfall: a contact bonus larger than a
4-block clear makes the search never clear. Next: explicit "build then
fire" (fire when combo ≥ threshold or when skulls are incoming / our
stack is high), opponent danger estimate.

## codebusters

6 leagues (Wood 2 start). League 1 bot: carry home and RELEASE within 1550
of the base, BUST a ghost at 900–1760, else approach a seen ghost to ~1300,
else explore a waypoint grid (seen waypoints dropped). 4/4 vs the Wood boss.
Wood 1 adds STUN (range 1760, 20-turn reload; **the stunner drops its own
ghost too**, so never stun while carrying). Bot now: stun enemy carriers (or
any active enemy near us when ghosts are around), intercept an enemy carrier
on its straight line home, ghost memory (last seen positions, dropped when
carried or missing within 2000), step back when a ghost is closer than 900
(the old "stop at 1300" froze a buster next to its ghost for 10+ turns), camp
near the enemy base once exploration is done. 4/6 vs the Wood 1 boss, close
scores. Ideas: escort carriers, ghost stamina (next league), symmetry of the
initial ghost layout.
Bronze: ghosts have stamina 3 / 15 / 40 (ghost `state`; −1 per BUST per
buster; buster state 3 = busting). Busters now gang up (≤ 3 per ghost),
bust the weakest ghost in range, and approach by distance + 150·stamina
(+6000 for 40-stamina ghosts before turn 60). 4/4 vs the Bronze boss (close).

## fantastic-bits

6 leagues (Wood 2 start). League 1 bot: THROW at the enemy goal at 500 when
holding, else chase the nearest free snaffle (different targets per wizard),
aiming at its next position minus our momentum. 4/4 vs the Wood boss.
Later leagues: bludgers, spells (OBLIVIATE/PETRIFICUS/ACCIO/FLIPENDO) with
magic points.
Silver (spells since Bronze; the league-1 bot sat at 1044/1323): FLIPENDO
(20 magic) a free snaffle 400–3500 away whose line from the wizard (next
positions) crosses the enemy goal between y 2200–5300 (full force within
~2450: +2000 speed per turn for 3 turns on a snaffle), PETRIFICUS (10) a
snaffle crossing our line within 2 turns, throws aimed inside the posts
minus 2× our velocity, second wizard chases the snaffle nearest our goal.
2/4 vs the Silver boss (DumbleBoss). Next: simulate throws/flips with wall
bounces, ACCIO, bludger avoidance / OBLIVIATE.
Arena 20.92 → 19.79 vs boss 20.95–20.98 (a hair under). Added ACCIO (15)
on a snaffle within 4000 of our goal and 5000 of the wizard when an enemy
wizard is 500 closer to it. 2/4 in IDE tests (same as before).

## xmas-rush

6 leagues (Wood 2 start, 1 quest). Tiles are 4-digit masks (up right down
left). Bot: PUSH = simulate all 28 pushes (players/items shift with tiles,
pushed-out player lands on the inserted tile, item leaving the board goes to
our hand), keep the one whose BFS-reachable area gets closest to a quest
item; MOVE = BFS path (≤ 20) to the item or the nearest reachable tile.
4/4 vs the Wood boss.
Silver (12 quests, 3 revealed): 0/4. Now a MOVE collects as many quest
items as 20 steps allow (nearest first, recomputing reachability from each
item) and ends on the tile closest to the remaining ones; pushes score
−100 per quest item made reachable, then the gap. 2/4 vs the Silver boss.
Next: pushes that also hurt the opponent, predicting its push (same
row/column pushes cancel).
Pushes are now scored by the items the next MOVE can collect (same greedy
20-step chain), then the gap to the rest. 2/4 (arena 15.4 vs boss 21.6).

## ocean-of-code

Captain Sonar, 6 leagues (Wood 2 start: move/surface/torpedo). Bot: enemy
candidate cells filtered by its orders (MOVE shifts, SURFACE sector, TORPEDO
within water distance 4 of the target), torpedo when ≤ 20 candidates and
expected damage ≥ 0.5 without hitting us, move towards the most unvisited
reachable water, SURFACE when stuck. Start in the most open central area.
4/4 vs the Wood boss. Bronze has everything (SONAR, SILENCE, MINE/TRIGGER).
Bronze bot: SILENCE expands the candidates (0–4 cells per direction), our
sonar answer and the enemy's life loss after our blasts (when it did not
surface/fire itself) filter them (both applied *before* its new orders);
fire torpedo or trigger a mine when the expected damage is ≥ 0.5 / 0.6 and
we are out of the blast; drop a mine whenever charged; SILENCE one step
after a blast within 3 of us; sonar the likeliest sector when > 30
candidates; drift to distance ~3 of the candidates' centre when the torpedo
is ready. 6/6 vs the Bronze boss (it never hit us).
Silver boss (Cpt. Haddock) silences every ~16 turns and tracks us: 0/4.
Added: path-aware enemy hypotheses (position + its visited-cell bitset,
pruned when a move re-enters its path, reset on SURFACE, deduped/sampled to
4000 after SILENCE), self-tracking (the same from our public orders and our
life loss after its blasts) with SILENCE (the 1-4 dash keeping the most
space) when ≤ 15 positions remain for us or after a close blast, and a
stricter firing threshold (0.9 expected damage unless we are known).
Still 1/4 in IDE tests. Next: charge SILENCE right after firing, move to
torpedo range when located, sonar more, simulate the enemy's mines.

## spring-challenge-2020

Pac-Man duel, 6 leagues (Wood 2 start: 1 pac, full vision). Bot: best
value / BFS distance pellet per pac (horizontal wrap), distinct targets.
4/4 vs the Wood boss. Bronze (fog, types, SPEED/SWITCH, 10-turn shared
cooldown): the first version lost pacs to enemies arriving at speed 2.
Now: pellet memory (cells seen empty in line of sight dropped, vanished
super pellets dropped), enemies remembered 3 turns, SWITCH to the counter
type when a beating pac is ≤ 2 steps away, eat a weaker pac in reach whose
cooldown is running, SPEED when no threat ≤ 4, else BFS avoiding the
threats' reach and our pacs' destinations, and output the cell reached this
turn (the referee's own path could cross danger). 4/4 vs the Bronze boss.
Ideas: explore unseen areas by pellet probability, trap enemies in dead ends.

## spring-challenge-2023-ants

Beacon-driven ants on hex cells, 6 leagues (Wood 2 start). Bot: LINE from
the nearest own base to the closest resources, adding targets while the ants
can keep ~2 per chain cell (eggs preferred during the first 40 turns).
4/4 vs the Wood boss. Ideas: weighted beacons per chain, compete for shared
resources, the classic "minimum spanning tree of targets" approach.
**From Bronze each turn starts with a `myScore oppScore` line** (the Wood
bot read every cell one line off and sat at 1070/1072 in Silver). Now:
a harvesting tree grown each turn from our bases, attaching the resource
closest to the current tree (eggs −2 while eggs remain before turn 30,
last turn's targets first for stability) along its shortest path, while
≥ 2 ants per tree cell; BEACON strength 1 on every tree cell. 2/4 vs the
Silver boss (close); 1.5 ants/cell + egg bonus 3 went 0/4.
Forum (forum.codingame.com/t/200927): top bots simulate the referee and
search beacon layouts; a Gold heuristic picks the 2 closest eggs per base
for 4 turns, then half the eggs, then crystals up to a majority. That
selection went 1/4 here (reverted). Arena 24.4 vs boss 25.9.

## fall-challenge-2020

Witch potions, 6 leagues (Wood 2 start: BREW only). Bot: brew the priciest
affordable order; fallback for later leagues: CAST the castable spell that
reduces the tier-weighted missing ingredients of the best order (≤ 10 in
inventory), else REST. 4/4 vs the Wood boss. Gold-level bots use a BFS/beam
over CAST/REST/LEARN sequences.
Wood 1 (4 base spells, 3 potions end the game): BFS over CAST/REST states
(inventory, castable mask; repeatable casts up to ×4 for later leagues),
fastest sequence per order, play the first action of the best
price / (turns + 1); LEARN free tome spells in the opening once LEARN
exists. 4/4 vs the Wood 1 boss.
Silver (full game): 1/4 with "learn free spells in the first 6 turns".
Now the opening (turns ≤ 9) learns the affordable tome spell with the best
tier-weighted net delta (+1.5 repeatable, +1 pure gain, −0.6 per tome
index cost) while it is worth > 0.5: 4/4 vs the Silver boss.
Arena 35.7 vs boss 37.16 with that, so: a beam search (width 250, 30 ms,
depth ≤ 16) over CAST / REST / BREW sequences that may brew several
potions, value = prices × 0.93^turn + tier-weighted leftover ingredients;
the old per-order BFS is only a 3 ms fallback (both at full time = 75 ms
timed out on turn ~10). 4/4 vs the Silver boss.

## crystal-rush

30×15, HQ = column 0, 5 robots, 200 turns; the statement already describes
radars and traps (league 1 boss barely digs). Bot: one robot fetches radars
for a fixed lattice while known safe ore < 2 per live robot; the others dig
the nearest known ore with capacity left (ore − robots sent, slight bias to
the HQ), else blind-dig fresh cells from column 3. Holes that appear without
us, and holes next to an enemy robot that stood still outside the HQ, count
as possibly trapped and are skipped. 4/4 vs the Wood 1 boss (~105 to 1).
Ideas: our own traps, trap chain kills, radar spots by expected value.
Bronze boss (same rules): 1/4 at first. Any robot at the HQ now requests a
radar when none is carried and (known ore < 4 per robot or < 4 radars down),
radar carriers take distinct spots, ore cost = distance + ore column (the
trip home): 3/4 with close scores.
Arena 32.4 vs boss 34.4 (1/4 in IDE: radars were only requested by robots
coming home with ore, so for ~50 turns four robots blind-dug empty cells
at x = 3). Referee: github.com/CodinGameCommunity/UnleashTheGeek
(`Game.generateMap`: cluster centres x = 3 + 25·u^0.55, y 2..12; 5×5
clusters, ore 1–3; `config/Boss.py3` is only the Wood boss). Now a
dedicated fetcher (free robot closest to the HQ, timed to the cooldown)
keeps radars coming while known ore < 4/robot or < 5 radars, the lattice
starts at (7,7), blind digs only x ≥ 6, y 1..13: 2/4 twice.
Promoted to Silver. Arena losses there were close (82–86) with no robot
lost: every enemy-dug hole counted as trapped, wasting ore. Now only an
enemy robot that stood still at the HQ (a REQUEST) may carry a trap; the
holes around it when it next stands still (a DIG) are suspicious. 3/4 vs
the Silver boss.

## keep-off-the-grass-fall-challenge-2022

Scrap grid, 12–15 × 6–7 in league 1. Bot: defensive recyclers on own cells
an adjacent enemy stack outnumbers, up to 3 economy recyclers in the first 12
turns (most scrap in range, not next to another recycler), every unit to the
nearest unowned walkable cell (BFS; claimed targets cost more, enemy cells
preferred), spawns on own frontier cells closest to the enemy. Cells in a
recycler's range with 1 scrap count as grass. 4/4 vs the Wood 1 boss.
Ideas: the referee's MOVE pathing prefers the centre; frontier defence by
unit counts; recyclers to cut the map.
Bronze (bigger maps): the first bot walled itself in with "defensive"
recyclers built whenever any enemy touched an empty own cell (lost 9–22 on
a stable field). Now: reinforce by spawning (units hold against the stack
they face), block with a recycler only against ≥ 3 units we cannot match;
economy recyclers every 3 turns until turn 20 (≈ 1 per 40 cells, ≥ 3 steps
from the enemy, −8 per neighbour that would turn to grass); neutral targets
before enemy ones (forum: ndc, BlitzProg). Still ~1–2/4 vs the Bronze boss
with huge swings (17–102, 143–7): the boss out-produces us. **But the
first (league 1) bot had already reached rank 1 in Silver when this was
submitted**: it was restored and resubmitted; the reworked version is kept
in `legacy/keep-off-the-grass-v2.ts` (IDE results were equal). Next: count
matter per turn in replays, Voronoi-based front line, spawn stacks at the
front instead of 1-unit trickles.

## bit-runner-2048

CSB-like physics, 2 cars each, community game with wood leagues as tiers
(full rules from the start). Bot: carriers drive to the manhole; when a foe
carries, a free car rams it (strong impacts swap the prisoner); chasers are
paired with prisoners by estimated distance, aiming ahead of the prisoner;
targets corrected by −3·velocity; thrust 200 / 120 / 20 by heading error.
3/4 vs the Wood 1 boss. Ideas: simulate (referee on GitHub), block the
enemy carrier's path at the manhole.
Bronze: 1/4 vs the boss (rank 4/178 at 100 %). A 6-turn plan search per
car (`EXPERT rotation thrust`, moving targets, collisions ignored) also
went 1/4: kept in `legacy/bit-runner-2048-search.ts`, not submitted. The
losses probably come from collisions (steals): simulate car-car impacts.
Referee (`Unit.bounce`): a car-car impact above BALL_LOSE_MIN_IMPULSE
swaps the prisoners. A "carrier dodges cars predicted within 850 in 3
turns" rule went 0/4 (reverted). Arena 23.3 vs boss 32.6.

## git-patchwork

Patchwork, 9×9 quilt, 19 time points in league 1 (no rotation, no income).
**Init is 4 lines**: the empty event lists are still sent as empty lines.
Bot: value = 2·squares − price − min(time, time left); play the best of the
first 3 patches if the value is > 0 (else SKIP), at the position whose
squares touch the most filled cells / borders. 4/4 vs the Wood 1 boss.
Later leagues: income events, special patches, rotations/flips.
Bronze: flips and rotations (`PLAY id x y flip rot`, horizontal flip
first, then clockwise turns): all 8 orientations tried. 4/4 vs the Bronze
boss.

## langton-s-ant

15×15, 20 picks each, ant walks 150 steps from the centre facing up with
the first player's colour (coloured cell: turn left, take its colour, cell
turns white; white cell: turn right, paint it). Two rounds, `-1 -1` = we
start a round, `-2 -2` = round change (answer ignored, we are second next).
League 1: separate grids (`SHARED = false`). Greedy: each pick maximises our
final count in a full ant simulation. 4/4 vs the Wood 1 boss (~46 to 27).
Shared-grid leagues: set `SHARED = true` (score = ours − theirs), and
consider a 2-ply search over the opponent's reply.
Bronze (still separate grids): **on its own grid the ant carries our
colour** in both rounds (the statement's "first player's colour" is wrong
there): the old model lost every game as second player. Picks are now
planned as a set (greedy seed + hill climbing on the remaining picks,
700 ms first turn, 200 ms after), playing the plan's most important cell.
Old greedy 0/4, planned 2/4, planned + colour fix 4/4 vs the Bronze boss.
Silver = shared grid: `SHARED = true` (opponent picks applied, ant starts
with the first player's colour, score = ours − theirs); budgets cut to
250 / 180 ms (300 ms per turn, the 700 ms first turn timed out). 4/4 vs
the Silver boss.

## summer-challenge-2024-olymbits

3 players, one shared input per mini-game (GPU string + 7 registers).
League 1 = one hurdle race (30 cells, LEFT 1 / DOWN 2 / RIGHT 3 / UP jumps
2 over the next cell, a hit stuns 3 turns). Bot: backwards DP of the
minimum turns to the finish (runner stops on the hurdle it hits), play the
best first move. Gold medal in 3/3 games (21 vs 7 / 7). Later leagues run 4
mini-games at once (archery, roller, diving): one move for all, so weigh
each game's gain by our medal needs (the classic approach).
Wood 1: four hurdle races at once (score = product of per-race medal
points). The league-1 bot only drove race 0 (rank 2373/2695). Now: sum of
DP costs over non-stunned races (weight 0.3 for races where a rival is > 6
cells ahead): best score in 3/3 games.
Bronze = the full game: hurdles, archery (winds in the GPU; exact DP of
the best final distance, typed arrays: a Map version once timed out),
roller (GPU = risk order; stun at risk ≥ 5, +2 risk when sharing a cell),
diving (objective string, index tracked per round). Each game rates the 4
actions in ~[−1, 1], weighted by 1 / (3·gold + silver + 1) in that game.
Best score in ~4/5 games vs 2 bosses.

## ghost-in-the-cell

7–15 factories, one command per turn in Wood 3 (`MULTI = false`; `INC`
flag for later). Bot: spare = cyborgs − (enemy troops heading in − ours −
production); options scored value / (distance + need / 4), value =
production (+0.5 enemy, +2 for saving an own factory), need = defenders +
enemy production until arrival + enemy troops − ours + 1. 4/4 vs the
Wood 3 boss. Next leagues: several commands, BOMB, INC.
Bronze (all rules): MULTI and INC on (INC only with no enemy bomb in
flight). The boss bombs our start factory on turn 2: enemy bombs (target
unknown) now evacuate every own factory they could reach next turn (age
tracked from first sight), and we bomb the enemy's best factory on turn 1
and again after turn 30 (production ≥ 2). 1/4 → 3/4 vs the Bronze boss.
Arena 22.85 vs boss 27.57. Tried and reverted (IDE vs the Bronze boss):
moving rear leftovers to the front factory (0/4), Agade's postmortem
scoring value / (d² × need), enemy value / (d² × 8), INC at 1/10^1.6 (1/4).
Postmortem: github.com/Agade09/Agade-Ghost-in-the-Cell-Postmortem.
Timeline version (A/B in the arena from 22.85; old file kept in git
history, commit before 5070c10): each factory is simulated turn by turn
(produce, arrivals fight each other, survivors fight the garrison);
spare = min garrison over 20 turns, a falling factory gets exactly what
it lacks in time, attacks send the target's garrison at arrival + 1
(one attack per target per turn); INC is only held back on our two most
productive factories while an enemy bomb flies (the boss INCs from turn 4
and launches bombs early, which froze our INC). 2/4 in IDE, as before.

## code-royale

**`gold touchedSite` arrive on one line** (the statement lists two): the
first version timed out on turn 1. Wood bot: build the nearest free sites
(biased to our half) until 2 knight barracks + 1 archer barracks, train
knights when affordable (archers when > 2 enemy knights), queen stays in
our corner and steps away from knights within 400. 4/4 vs the Wood boss.
Later leagues: mines (gold income), towers, giants.
Wood 2 (towers, giants): build order knights → 3 towers → knights →
giants if the enemy has ≥ 2 towers → up to 5 towers; idle queen repairs
the weakest tower (param1 = tower HP) when < 700. 1/2 → 4/4 vs the Wood 2
boss. Next: mines (gold), queen positioning behind towers.
Wood 1 (mines; `goldRemaining maxMineSize` replace the ignored fields,
no free income): order mines ×3 → tower → knights → mine → towers ×3 →
knights → giants (enemy ≥ 2 towers) → mines ×6 → towers ×5; the touched
own mine is grown to its max rate first; with knights near the queen it
shelters at (and repairs) its nearest tower, or raises one (hiding in the
corner let knights raze the mines). 2/4 → 4/4 vs the Wood 1 boss.
Bronze: 18.7 vs boss 29.9. Agade's postmortem order (2 mines, 1 knight
barracks, then towers) went 0/4 vs the Bronze boss (ours 2/4): reverted.
His real edge was queen kiting by simulated annealing (depth 7), which
this bot lacks.
Bronze boss = `config/level4/Boss.java` in github.com/csj/team-2: knight
barracks at the nearest site, mines (grown to max) until income ≥ 10,
then towers on every free site, TRAIN whenever gold ≥ 80; its queen never
flees. Ours dies by turn ~50 (0/4): parked on a forward tower "repairing"
while the knight stream hits it. A home-corner tower cluster + archer
barracks + shelter at the home-most tower lasted to turn 70–80 but still
lost 0/4 (reverted). Needs real queen kiting and archers that actually
get trained (gold went to knights first).

## hypersonic

Bomberman 13×11, Wood: bombs (8 turns, range 3 counting the bomb cell)
do not hurt. Bot: BFS over free cells, best cell = undoomed boxes a bomb
there would hit / (distance + 2); BOMB when standing on it and head for
the next best cell. 4/4 vs the Wood boss (~22 to 7 boxes). Later: walls
`X`, items (boxes `1`/`2`), bombs kill: add an escape check before bombing.
Bronze (friendly fire, 2–4 players, items = entity type 2): explosion
timeline with chain reactions; a bomb showing timer k blasts before our
k-th move, so the cell held after move t faces the blasts of time t + 1.
Every step (and every BOMB) needs an escape: BFS over cell × time up to 10
turns avoiding blasts and unexploded bombs. Moves are one adjacent cell
(the referee's own MOVE pathing could walk into a blast). 4/4 vs the
Bronze boss (killed it in 3).
Silver: stood in its corner all game (bombing there had no escape, so
"best = here" never bombed and never moved): now the current cell only
counts as a target when a bomb there is survivable. 2/4 vs the Silver
boss (27–26, 49–2 losses: it destroys boxes faster). Next: bomb chains,
2-bomb planning, item pickup, trap the opponent.

## wondev-woman

Santorini-like, legal actions listed (`MOVE&BUILD i dir dir`, N = y−1).
Wood: reaching level 3 wins. Bot: 1-ply, climb to 3 at once, else score
= 30·landing level + climbable neighbours (bonus for +1 steps and a 3 we
can reach from level 2) − 200 if the opponent could climb to a 3 next turn
− its mobility. 4/4 vs the Wood boss (wins in 5–8 turns). Later: points
per climb, 2 units, PUSH&BUILD, fog: needs a real search (minimax).
Bronze (2 units, a point per climb to 3, PUSH&BUILD, enemies visible only
when adjacent): the 1-unit heuristic lost 0/4 by small margins. Now 1-ply
with a state eval: 100/point + per unit (12·height + 3·mobility, −60 if
stuck) for us minus the visible enemies, + 2 per cell our side reaches
first (BFS, climbing rule); pushes applied (enemy moved, its cell +1). 4/4
vs the Bronze boss. Next: track unseen enemies, 2-ply.

## coders-of-the-caribbean

Hex 23×21 (odd-r offset), Wood 3: one ship, MOVE/SLOWER/WAIT. Bot: best
barrel by rum / (hex distance + 1), distinct targets; no barrel left: go
to the enemy. `FIRE` flag for the next league (range 10, every other
turn, predicted position TODO). 4/4 vs the Wood 3 boss. Later: mines,
cannonballs, up to 3 ships, manual control (referee on GitHub).
Wood 2 (mines, FIRE): the barrel-only bot lost 0/2. Now fires every
other turn at the enemy's centre extrapolated along its heading for the
flight time (1 + round(d/3), from our bow, range 10) when rum > 50 or no
barrel is left, never while a cannonball is about to land on our ship,
and skips barrels next to a mine. 4/4 vs the Wood 2 boss (sunk it in
18–60 turns). Offset-grid neighbours: even rows (+1,0) (0,−1) (−1,−1)
(−1,0) (−1,+1) (0,+1), odd rows (+1,0) (+1,−1) (0,−1) (−1,0) (0,+1) (+1,+1).

## code-of-kutulu

4 explorers, the first entity is ours. Wood bot: among WAIT and the 4
moves, 10·min(6, BFS distance to the nearest minion, spawn delay added)
− 50 if ≤ 1, +15 near another explorer (else drift towards the closest).
Best (surviving) score in 4/4 games vs 3 bosses, by small margins.
Later leagues: slashers, shelters, PLAN / LIGHT / YELL.
Wood 1 (slashers, PLAN, LIGHT, YELL, shelters): the wood bot mostly
WAITed alone and lost. Now: −30/−60 for cells in a slasher's row/column
sight (−60 when stalking/rushing), PLAN when sanity < 200 with company and
no minion within 2, LIGHT when a wanderer targeting us is within 3, +12 on
a shelter with energy, +25 with company else −2 per maze step to the
closest explorer. Best score in 2/3 games vs 3 bosses.

## mean-max

3 players, Wood: one Reaper (mass 0.5, friction 0.2). Bot: wreck with the
best (water + 3·overlapping wrecks) / (distance + 600), aim = target − v,
ACC = min(300, 0.5·|correction|), coast when inside and slow. Reached 50
water first in 3/3 games vs 2 bosses. Later: Destroyer (break tankers),
Doof (rage, skills: grenade, tar, oil).
Wood 1 = all three units + skills (tar, oil; grenade later?). Now: the
destroyer rams the tanker minimising d(destroyer) + ½·d(our reaper), the
reaper waits next to it when no wreck exists, the doof rams the leading
enemy reaper and oils it (30 rage) when it sits in a wreck ≥ 1500 from
our reaper. Wood-3 reaper-only bot: 0/3; now 50 water first in 2/3.
Silver (19.2 vs boss 22.2): wrecks inside an oil zone are skipped (no
harvest there), and the destroyer throws a grenade (60 rage, range 2000)
at an enemy reaper sitting in a wreck with ≥ 2 water when ours is ≥ 1300
away, landing 200 towards the wreck centre so it is pushed outwards (a
grenade on a vehicle's centre does nothing). 3/4 firsts vs 2 bosses.

## a-code-of-ice-and-fire

12×12, Wood 3: level-1 units only. Init lists the mine spots (read them
even if unused). Bot: units (closest to the enemy HQ first) BFS to the
nearest unowned cell (enemy HQ first, ties towards it), distinct targets;
train level 1 on free own/border cells closest to the enemy HQ while
gold − 10 + 5·(income − 1) ≥ 0. 4/4 vs the Wood 3 boss (HQ taken).
Later: levels 2/3 (kill lower levels), mines, towers (Bronze = full game).
Silver: the level-1 bot lost 0/4 (HQ taken). Rewritten for the full
rules: moves only onto cells the unit may take (enemy unit level + 1,
level 3 next to an active enemy tower), a tower next to our HQ when enemy
units come within 3, mines on spots inside our territory while income
< 25, training at the level each border cell needs (enemy units first)
while gold covers cost + 4 turns of upkeep. Still 0/4 vs the Silver boss
("Broken Boss" walks to our HQ): submitted as it covers more rules. Next:
HQ defence (kill units within 2 of the HQ), cutting enemy territory.

## code-a-la-mode

3 players, 3 rounds of 2 cooperating chefs. Wood 3: ICE_CREAM (crate I)
and BLUEBERRIES (B); plates from the dishwasher D, deliver at W. Player
lines are `x y item` on one line. Bot: plate → missing desserts of the best
order the plate can still become (USE on a crate with a plate adds it) →
window; a plate matching no order goes back to D. Best total in 3/3.
Later: strawberries (chop at C), croissants (dough H + oven), tarts;
cooperate with the partner via tables.
Wood 2 (CHOPPED_STRAWBERRIES: crate S → board C → a free table, since a
chef holds one thing): chop first when the best order needs some and none
lies on a table; plates on tables that still fit an order are reused;
missing desserts from crates or tables; a plate waiting on strawberries is
parked on a table. Best total in 3/3.
Wood 1 (CROISSANT: dough H baked 10 turns in oven O, burns 10 turns after
ready; oven line `contents timer`): bake when an order wants a croissant,
none lies on a table and the oven is empty; take a ready croissant at once
(onto the plate if holding one, else to a table). Best total in 3/3.
Bronze (TART: dough → board = CHOPPED_DOUGH → + blueberries = RAW_TART →
oven = TART): dough goes to the board when a tart is wanted (and no
croissant is, or the oven is busy); RAW_TART into the oven when empty else
onto a table (picked up later); anything baked is taken at once. Best total
2/3 (third within 1 point). Arena was 13.1 vs boss 23.9 before this.
Arena 18.5 vs boss 23.9. The boss (`config/Boss.kt` in
github.com/csj/code-a-la-mode) is naive: first customer, builds every item
onto tables then plates them, WAITs every third turn. Ours now targets
the order with the best award / estimated work (crate or ready item 1,
strawberries 4, croissant 13, tart 16 or 8 with a raw tart ready; the
carried plate must fit) and only bakes/chops for that order. 2/3 with
higher totals (13–14k).
Arena 22.2 with that. Partner coordination added: the order the
partner's plate fits is left to it, and chopping / baking is skipped when
the partner already carries that chain (strawberries, dough, raw tart).
Best total in 2/3 (close second in the third).

## soak-overflow

Summer 2025. Wood leagues are tutorials with one fixed goal each (3 of 5
successes vs the boss). **Tiles come one line per row** (`x y type`
triples), not one line per cell. Wood 4 (`LEAGUE = 1`): agents to (6,1)
and (6,3). Read each new league's goal and bump `LEAGUE`.
Wood 3 (`LEAGUE = 2`): every agent SHOOTs the wettest enemy. **The CG TS
judge fails on type errors** (a `LEAGUE === 1` comparison on a literal
`2` type timed out turn 1): type the constant as `number`.
Wood 2 (`LEAGUE = 3`): cover. A cover tile (1 low = 50 %, 2 high = 75 %)
orthogonally adjacent to the agent protects against shots from its far
side, ignored if the shooter touches the same cover. Move to the
neighbour cell with the best worst-case cover, then SHOOT the enemy in
range with the least cover (ties: closest). Output `id;MOVE x y;SHOOT id`.
**Referee: github.com/CodinGame/SummerChallenge2025-SoakOverflow**
(`Game.getCoverModifier`, `TutorialManager`). Exact cover: for each axis
where |d| > 1, the tile next to the target on the shooter's side counts
unless it touches the shooter (Chebyshev 1); best cover wins (×0.5 low,
×0.25 high). The league-3 checker expects the cell next to the HIGH cover
((0,1) if (1,1) is high, else (0,3); mirrored on the right) and the enemy
in the facing column whose x-side tile is not high cover — it ignores the
y-axis cover, so our target mimics that. Failed ~half the maps before.
Wood 1 (`LEAGUE = 4`, bunkers; promoted within minutes of the fix): 4
bunkers (3×3 inside a high-cover ring), one traps our second agent; the
bomber (most bombs, fixed at the start — the trapped agent once became
"bomber" and bombed itself) throws at each other bunker's centre (splash
covers the interior, range 4 Manhattan), never shooting. Checks pass 2/2.
Bronze = the full game (`LEAGUE = 5`; boss code redacted): per agent,
move (stay / 4 steps) to the cell maximising cover against enemies within
12 − |distance to nearest enemy − optimal range| − distance to the centre;
THROW at a 3×3 hitting ≥ 2 enemies and none of ours, else SHOOT the best
expected damage (kills +50) within 2× range, else HUNKER_DOWN. Scoring:
each turn +(our zone − theirs) when positive, zone = cells strictly closer
(Manhattan × distance multiplier) to our agents. 4/4 vs the Bronze boss.
Silver boss crushed it (654–0 in 19 turns: we huddled and hunkered while
its zone lead hit the 600-point cap). Moves now also score the zone
difference with the agent at the candidate cell (wet ≥ 50 doubles its
distance), −12 next to one of our agents (3×3 bombs), −2 within 5 of an
enemy, −3 per cell beyond optimal range; shots focus on the enemy others
already target. 2/4 vs the Silver boss.

## botters-of-the-galaxy

MOBA lane, 10 leagues (Wood 6 start). The Wood boss (DoubleHulk) walks
straight at our hero: IRONMAN (820 HP) died by turn ~35–70 whether it
stood still or kited (kiting got cornered at the map edge). HULK fighting
the enemy hero within 400 next to our tower wins 4/4. Otherwise: stay
behind our frontmost creep, last-hit, weakest creep in range. Later:
items, last hit/deny, neutrals (GROOT), bushes, 2nd hero, skills.
Referee + every league boss: github.com/Illedan/BOTG-Refree (`config/
levelN/Boss.java`, `Referee.setupLeague` — its switch falls through, so
each league keeps the later cases' settings). Wood 6 = no creeps, towers
1500 HP dealing 1 damage, no items; win = kill the hero or tower, else
the tie-break at turn 200 is creep kills + denies (0–0 → draw). The old
bot waited at its tower (draws: 8.4 vs boss 17.1). Duel mode (no UNIT on
the map): attack whichever of enemy hero / tower dies sooner (hero if
our tower would fall first): 4/4, games over by turn 24. Wood 5 adds
items (boss: DOCTOR_STRANGE, cheapest item, hits the nearest tower); the
bot now buys the best affordable non-potion item (15·damage + maxHealth;
+ 2·speed) while it has < 4. Wood 4 adds creeps (last hits/denies = gold).
**itemsOwned is field 21 of the unit line** (read as 24 at first: NaN,
so nothing was ever bought and a bladed IRONMAN out-traded us). Duel
mode now runs while the enemy tower deals ≤ 1 damage (Wood 6–4) and
fights back whenever the enemy hero can hit us. Lane mode (Wood 3+):
stay out of the enemy tower's range + 40, last-hit / deny (own creeps
≤ 40 % HP), duel the hero away from its tower when we have more HP,
retreat under 30 % HP while something threatens us (no HP regeneration:
an unconditional retreat parked the hero at its tower until it died).
Wood 2 (Groots): a hero under 50 % HP buys the biggest affordable potion
(potions need a free slot, so regular items stop at 3), items are valued
15·damage + maxHealth (boots were bought before), and the hero stands
120 behind the front creep (60 let enemy creeps target it). 3/4 vs the
Wood 2 boss; Wood 3 went up with the lane mode at once.

## legends-of-code-magic

Draft variant (30 × PICK of 3, one board, ≤ 6 creatures; player lines have
5 ints: health mana deck rune draw; cards have 11 fields). Derived from
the constructed bot: pick by value-per-cost with a −3 penalty when the
cost bucket / item quota is full; battle = greedy summons, items, guards,
favourable trades unless lethal, face. 3/4 vs the Bronze boss. Replaces
the user's old agent (kept in `legacy/legends-of-code-magic.ts`).
Silver: 0/2. Draft now uses ClosetAI's leaked card values (the array in
gym-locm's ClosetAIDraftAgent, indexed by cardNumber − 1) with a curve
penalty; summons pick the subset using the most mana (brute force over
the hand). 1/4 vs the Silver boss: the battle logic is the weak part
(next: search over attack orders / trades, lethal through guards).

## code4life

Bronze (limited molecules, expertise, projects, travel times). State
machine: SAMPLES (rank 1 / 2 / 3 by total expertise < 3 / < 8 / more) →
DIAGNOSIS (diagnose, upload samples the greedy molecule plan cannot fit,
download good cloud samples — never one we uploaded: the first version
looped upload/download all game) → MOLECULES (what the planned samples
need, first samples first) → LABORATORY. ~2/4 vs the Bronze boss (close
scores); rank thresholds 2/6 did worse (0/4), 4/10 similar. Replaces the
user's Rust agent (`legacy/code4life.rs`). Ideas: science projects, block
the enemy's molecules, better sample mix.
Science projects (+50) now weigh in: missing expertise of projects nobody
completed raises the value of samples with that gain (plan order, cloud
downloads). Arena was 30.85 vs boss 32.87.
Arena 30.7 vs 33.1. Replays showed rank-3 trips uploading 2 of 3 samples
(they did not fit one molecule load together) for a single medicine per
~20-turn cycle. Now a sample that fits on its own (≤ 10 needed, enough in
pool + storage) is kept and done on a second LABORATORY → MOLECULES pass;
waiting at MOLECULES is capped at 4 turns (then DIAGNOSIS uploads what
the pool cannot serve). 3/4 vs the Bronze boss with higher scores.

## green-circle

Samsara-like deck building; possible moves are listed. Bot: MOVE to the
desk whose card most reduces Σ missing / (missing + 1) over the open
applications (missing = tasks not covered by 2 per matching skill card,
minus 2 per BONUS), RELEASE the offered app with the fewest missing tasks,
other phases take the first listed move. 2/4 vs the Wood 2 boss (the
user's C++ agent, `legacy/green-circle.cpp`: 1/4). Later: card actions,
giving cards when too close, bigger apps.
Referee: github.com/societe-generale/GreenCircle (`LeagueRules`, `Game.
move`, `config/level1/Boss.java`): the Wood 2 boss just plays the first
listed move; league 1 has small apps only and no cycle / proximity
penalties; the 5th app must be clean. Now: desks feed the application
needing the fewest extra skill cards (the clean finisher), releases pick
the least debt with the current HAND (not the whole deck). 4/6 vs the
boss (arena was 17.86 vs 18.84).
Wood 1 (big apps, card play, give a card when adjacent; its boss also
plays the first listed move): PLAY_CARD prefers REFACTORING (with debt in
hand), TRAINING, CODING, CODE_REVIEW, ARCHITECTURE_STUDY, DAILY_ROUTINE;
GIVE_CARD gives the skill the open apps need least. 3/4 (first version 2/4,
losing as second player).
Bronze (full game: wrapping past desk 0 throws 2 cards, gifts near the
opponent, complex cards; its boss = `config/Boss.java`, a sensible
heuristic): rewrote on the boss's structure — first desk ahead whose skill
an app needs more of (2/card + bonuses), avoiding wrap-around and desks
next to the opponent; card play REFACTORING (with debt) > DAILY_ROUTINE >
ARCHITECTURE_STUDY > CODE_REVIEW > CONTINUOUS_INTEGRATION > TRAINING;
release when clean or ≤ 2 botched tasks before the 5th; give/throw bonus
first. 3/4 vs the Bronze boss (the Wood bot lost 0/3).
Silver boss (5 apps in ~18 turns): 0/4. Fixes: the referee only offers
feasible releases, so before the 5th any offered one is taken (least
debt); CONTINUOUS_INTEGRATION automates BONUS first (automated cards count
on every release, forum tip) and CODE_REVIEW feeds bonuses; desks 5/6 get
a small bonus early but **never at the cost of wrapping past desk 0** (a
5↔6 shuttle wrapped every other turn and threw 2 cards each time). 2/4.

## winter-challenge-2024

Cellularena, 8 leagues (the wood ones are 5-match scenarios vs the boss).
Costs: BASIC A, HARVESTER C+D, TENTACLE B+C, SPORER B+D, ROOT A+B+C+D. Bot
per organism: a harvester facing an unharvested source (A first) on a free
cell next to our organs when C and D allow, else a BASIC (or any
affordable organ) on the free neighbour with the most free space, never on
a source we harvest (other sources are eaten for +3). Won 3/3 Wood 3
(harvester) scenarios by one cell. Replaces the user's TS agent
(`legacy/winter-challenge-2024.ts`).
Wood 1 (tentacle, sporer): TENTACLE (B+C) on a free cell facing an
adjacent enemy organ; SPORER (B+D, when A, C and 2 B / 2 D are in stock)
facing the longest free line, then `SPORE id x y` far along it (next to a
source if possible) with one protein of each type. 2/3 in the scenario
(ends when proteins run out). Referee:
github.com/CodinGame/WinterChallenge2024-Cellularena (`GridMaker.
initTutorialGrid`): the Wood 1 scenario is a 3-row corridor per player with
one A source 15–17 cells away and exactly A6 B2 C2 D3: sporer → spore a
root → harvester facing the source → BASIC growth. Our spore landed ON the
source (eaten); spore targets now skip sources and prefer a cell whose
free neighbour touches an unharvested source: 3/3 (13–12). Bronze = full
game next.
Silver (full game): 3/4 vs the boss, but one loss spent every protein on
early spores then WAITed 90 turns. A fix (spore only with reserves,
grow towards sources, eat sources when short) went 1/4: reverted. Arena
17.6 vs boss 19.7. Needs a real economy plan (harvesters first, spores
only near rich sources) and tentacle defence.

## spring-challenge-2021

Photosynthesis, 24 days, possible actions listed. Rules bot: COMPLETE
(richest first) from day 19 or with ≥ 4 big trees from day 11; GROW the
biggest affordable tree unless it cannot pay off (seed→1 ≤ day 20, 1→2 ≤ 21,
2→3 ≤ 22); SEED only when free (no seed of ours) before day 19, richest
cell not adjacent to our trees; else WAIT. 4/4 vs the Bronze boss
(~160 to 70). Replaces the user's Rust agent (`legacy/spring-challenge-2021.rs`).
Ideas: shadow simulation for the sun points, day-by-day sun planning.

## seabed-security

Bronze (monsters). Bot: each drone dives its lane (x 2500 / 7500, drifting
towards the side with more wanted fish below per radar) until y 8800 or no
wanted fish below, then surfaces to save (first saves score double);
light every 2nd turn below 2000 with no monster in sight; heading search
(24 × 600u) closest to the wanted direction keeping > 900u from each
visible monster's next position. 2/4 vs the Bronze boss (the user's C++
agent, `legacy/seabed-security.cpp`, scored 0 in the same test). The boss
saves ~96 points by turn 70: our avoidance zig-zags too much on the way up.

## spring-challenge-2022

Entity line: id type x y shield controlled health vx vy nearBase threatFor.
Bot: 2 defenders at posts ~4500 from our base intercept the threats to us
(soonest first, WIND towards the enemy base when one is < 2500 from our
base and within 1280); otherwise farm near their post. The attacker farms
mid-map until turn 70, then prowls ~4300 from the enemy base: WIND (mana
≥ 20) monsters within 6500 of that base, SHIELD (mana ≥ 50) monsters
already heading there. 4/4 vs the Silver boss. Replaces the user's Rust
agent (`legacy/spring-challenge-2022.rs`).

## spring-challenge-2026-troll-farm (WIP, not submitted)

Silver with the user's C++ agent (`legacy/…troll-farm.cpp`, 169/683; 1/2
vs the Silver boss in a quick test). A greedy TS bot (harvest best
fruits / distance, drop when full, chop size ≥ 2 trees after turn 200,
train one troll early) scored ~100 vs 110–360: 0/4, **weaker than the
user's agent, so not submitted**. Wood (4 points per unit, a size-4 tree
= 16) and more trolls look like the levers; read the referee
(github.com/eulerscheZahl/Troll-Farm) before retrying.
