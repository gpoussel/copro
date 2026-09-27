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
Promoted to Legend 2026-09-26; `SEVEN_RULE` is now on. In Legend the bot
loses mostly by having no legal move (the 7-rule filters moves): the eval
must value our own mobility after the reply.

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
cells). **Submitting failed**: the MCP's pre-submit ranking call errors on
league-less puzzles (fixed in codingame-mcp PR #7).

## platinum-rift-episode-2

League-less, zone graph under fog, enemy base always visible (owned by the
enemy on turn 1). Bot: each group sends 1 pod to every unowned neighbour
(platinum first, then towards the enemy base), the rest walks the shortest
path to the enemy base; 2 pods stay home when enemies are adjacent; pods in a
fight never retreat into enemy zones. 4/4 vs the boss (base taken in 13–19
turns). Same pending-submit issue as back-to-the-code (MCP PR #7).

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
Gold bot (submitted right after the promotion): both pods race with the same
6-turn plan search (known checkpoints, exact speeds/angles), one BOOST on a
> 5000 straight. No collisions, no blocker: 1/4 vs the Gold boss. Next: a
blocker pod that intercepts the leading enemy pod, collision simulation and
SHIELD, then Legend.

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

## cultist-wars

13×7, 4 leagues (Bronze start), one action per turn. Bresenham line from the
lower y (as the statement says) for shot blocking. Bot: score every action —
conversions (neutral 8, enemy cultist 12), shots (damage, +10 kill, +100
leader kill), leader steps towards the nearest convertible unit minus the
enemy fire on the destination, cultists close in on the enemy leader. 2/6 vs
the Bronze boss: wins as player 1, loses as player 2 (units shot down).
Ideas: 2-ply over actions, keep cultists out of enemy lines, read the source.

## tryangle-catch (WIP, not submitted)

4 leagues (Bronze start = league 1: spawn only). Input: houses, units per
house, paths, triangles (owner, canCapture). First bug: reserving units on
the corners of every capturable triangle left no spare units, the army never
moved. After the fix the bot still loses 0/6: its units end surrounded
(a unit dies when every neighbour house is enemy-held) and it runs out of
units. Next: read the referee (github.com/eulerscheZahl/TryAngle-Catch),
move in groups, grow from our own triangles outwards.

## game-of-life-or-death

8×8 Life, rows wrap vertically, each player evolves alone, clashes cancel;
we always control the leftmost column (input mirrored for player 2), ≤ mana
live cells per turn. Model (worked first try): set our column, then run
generations. Bot: all column patterns within the mana (≤ 256), 6 generations
simulated with empty future columns, score = goal-cell occupancy weighted
towards sooner turns. 4/4 vs the Bronze boss (~590 to 1).

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

## tron-battle

30×20 light cycles, 2–4 players by league (6 leagues, Wood 2 start). Only
tails and heads are sent each turn, so trails are accumulated (a dead
player's trail is cleared). Bot: per safe move, Voronoi (our reach vs the
opponents' next heads) while in contact, else reachable area with wall
hugging. 4/4 vs the Wood boss. Ideas: minimax/articulation points (the
classic Tron AI), better endgame filling.

## great-escape

Quoridor 9×9, 2–3 players (6 leagues, Wood 2 start). **Init values come on
one line** (the statement lists four lines). Walls: H at (x,y) blocks
(x,y−1)↔(x,y) and (x+1,y−1)↔(x+1,y); V at (x,y) blocks (x−1,y)↔(x,y) and
(x−1,y+1)↔(x,y+1); overlaps and crossings (H(x,y) × V(x+1,y−1)) rejected;
every player must keep a path. Bot: walk the BFS shortest path; when an
opponent would arrive first, place the wall with the best (their extra
length − ours). 4/4 vs the Wood boss.

## poker-chip-race (WIP, not submitted)

Counts on two separate lines (stub). Greedy chase/flee bot (neutral drops
bigger than us are threats too, flee on time-to-contact < 6, skip guarded
prey, accelerate only when the heading is off) survives longer but still
loses 0/6 to the Wood boss. Needs the physics (bounces, ejection, absorption
momentum) simulated to plan safe moves.
