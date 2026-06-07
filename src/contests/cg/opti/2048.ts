// 🎮 CodinGame Optimization - 2048
// https://www.codingame.com/training/optim/2048
//
// The referee exposes the spawn seed every turn, so the game is fully
// DETERMINISTIC: given (board, seed) we know exactly which tile spawns where
// after every move. That turns Expectimax into a plain deterministic search.
// We run a beam search over the move tree, replicating the engine's spawn
// (eulerscheZahl/2048 Board.java), and commit a batch of moves per turn.
//
// Engine spawn (verbatim logic): free cells listed column-major (x outer,
// y inner) as idx = x + y*4; position = seed % freeCount; value = (seed & 0x10)
// ? 4 : 2; then seed = seed*seed % 50515093 (stays < 50515093, exact in JS
// doubles). Move/merge order ported from Board.applyMove.
//
// Board is stored as a length-16 Int8Array of EXPONENTS (0 = empty, e => 2^e),
// indexed idx = x + y*4 (x = column, y = row), matching the engine.

// ---- Tunables -------------------------------------------------------------
// Tuned on the 8 first visible seeds (offline harness, mean score 652k, every
// game reaching 32768). The game ends on the 600-output cap, not a stuck board,
// so committing ~28 moves/turn is what fills those outputs with useful play;
// the lookahead keeps the committed prefix from steering into a trap. These are
// a fairly sharp optimum — see 2048-tools and opti/CLAUDE.md before changing.
const FIRST_TURN_MS = 450; // budget on turn 1 (limit is 1s, but Node cold-start
// + GC variance eat into it; turn 1 commits the same 28 moves as any turn so it
// does not need more — keeping well under 1s avoids random turn-1 timeouts)
const TURN_MS = 42; // budget on later turns (limit is 50ms; leave GC/output margin)
const BEAM_WIDTH = 200; // states kept per depth layer
const COMMIT_LEN = 28; // moves committed per turn when the board stays healthy
const LOOKAHEAD = 60; // extra depth searched beyond the commit (trap guard)
const EARLY_FRAC = 0.5; // when a line dies before COMMIT_LEN, commit this fraction
const MAX_DEPTH = 400; // hard safety cap on search depth

// Heuristic weights. Mutable so the offline harness can sweep them; the shipped
// bot just uses these defaults.
export const W = {
  empty: 270, // bonus per empty cell
  mono: 2.0, // penalty per unit of magnitude-weighted non-monotonicity
  smooth: 3, // penalty per unit of exponent roughness between neighbors
  merge: 50, // bonus per adjacent equal pair (a merge waiting to happen)
  max: 8, // bonus * largest exponent
  corner: 24, // bonus * largest exponent when it sits in a corner
};
// ---------------------------------------------------------------------------

const TARGET_START = [0, 3, 12, 0];
const TARGET_STEP = [1, 4, 1, 4];
const SOURCE_STEP = [4, -1, -4, 1];
const DIR_CHARS = "URDL";
const CORNERS = [0, 3, 12, 15];

export function valuesToExp(values: number[]): Int8Array {
  const g = new Int8Array(16);
  for (let i = 0; i < 16; i++) {
    const v = values[i];
    g[i] = v > 0 ? Math.round(Math.log2(v)) : 0;
  }
  return g;
}

// Apply a move on the exponent board. Mutates g, returns score gained (actual
// points, i.e. sum of merged tile values). Mirrors Board.applyMove exactly.
export function applyMoveExp(g: Int8Array, dir: number): number {
  let turnScore = 0;
  let merged = 0;
  const targetStart = TARGET_START[dir];
  const targetStep = TARGET_STEP[dir];
  const sourceStep = SOURCE_STEP[dir];
  for (let i = 0; i < 4; i++) {
    const finalTarget = targetStart + i * targetStep;
    for (let j = 1; j < 4; j++) {
      let source = finalTarget + j * sourceStep;
      if (g[source] === 0) continue;
      for (let k = j - 1; k >= 0; k--) {
        const inter = finalTarget + k * sourceStep;
        if (g[inter] === 0) {
          g[inter] = g[source];
          g[source] = 0;
          source = inter;
        } else {
          if (!(merged & (1 << inter)) && g[inter] === g[source]) {
            g[source] = 0;
            g[inter]++;
            merged |= 1 << inter;
            turnScore += 1 << g[inter];
          }
          break;
        }
      }
    }
  }
  return turnScore;
}

// Spawn the deterministic tile for `seed`. Mutates g, returns the next seed.
export function spawnExp(g: Int8Array, seed: number): number {
  let free = 0;
  for (let i = 0; i < 16; i++) if (g[i] === 0) free++;
  if (free === 0) return seed; // shouldn't happen (engine only spawns after a move)
  const target = seed % free;
  let c = 0;
  let idx = -1;
  // column-major order: x outer, y inner -> idx = x + y*4
  for (let x = 0; x < 4 && idx < 0; x++) {
    for (let y = 0; y < 4; y++) {
      const id = x + y * 4;
      if (g[id] === 0) {
        if (c === target) {
          idx = id;
          break;
        }
        c++;
      }
    }
  }
  g[idx] = (seed & 0x10) === 0 ? 1 : 2;
  return (seed * seed) % 50515093;
}

function changesBoard(g: Int8Array, dir: number): boolean {
  // Cheap legality test without allocating: scanning each line from the target
  // edge inward, the move changes the board iff some tile sits after an empty
  // cell (it will slide) or two consecutive tiles are equal (they will merge).
  const targetStart = TARGET_START[dir];
  const targetStep = TARGET_STEP[dir];
  const sourceStep = SOURCE_STEP[dir];
  for (let i = 0; i < 4; i++) {
    const ft = targetStart + i * targetStep;
    let last = 0; // exponent of the previous tile with no gap before it
    let emptySeen = false;
    for (let j = 0; j < 4; j++) {
      const cur = g[ft + j * sourceStep];
      if (cur === 0) {
        emptySeen = true;
      } else {
        if (emptySeen) return true;
        if (cur === last) return true;
        last = cur;
      }
    }
  }
  return false;
}

const VAL = new Float64Array(20);
for (let e = 1; e < 20; e++) VAL[e] = 1 << e;

export function evaluate(g: Int8Array): number {
  let empty = 0;
  let maxExp = 0;
  let pairs = 0;
  let smoothPen = 0;
  for (let i = 0; i < 16; i++) {
    const v = g[i];
    if (v === 0) empty++;
    else if (v > maxExp) maxExp = v;
  }
  // horizontal neighbors
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 3; x++) {
      const a = g[x + y * 4];
      const b = g[x + 1 + y * 4];
      if (a && b) {
        smoothPen += Math.abs(a - b);
        if (a === b) pairs++;
      }
    }
  }
  // vertical neighbors
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 3; y++) {
      const a = g[x + y * 4];
      const b = g[x + (y + 1) * 4];
      if (a && b) {
        smoothPen += Math.abs(a - b);
        if (a === b) pairs++;
      }
    }
  }
  // Monotonicity penalty, weighted by tile VALUE so a misplaced large tile
  // dominates: each line contributes the smaller of its left/right "wrong way"
  // value mass, i.e. how much it deviates from being monotone in one direction.
  let monoPen = 0;
  for (let y = 0; y < 4; y++) {
    let left = 0;
    let right = 0;
    for (let x = 0; x < 3; x++) {
      const a = VAL[g[x + y * 4]];
      const b = VAL[g[x + 1 + y * 4]];
      if (a > b) left += a - b;
      else right += b - a;
    }
    monoPen += Math.min(left, right);
  }
  for (let x = 0; x < 4; x++) {
    let up = 0;
    let down = 0;
    for (let y = 0; y < 3; y++) {
      const a = VAL[g[x + y * 4]];
      const b = VAL[g[x + (y + 1) * 4]];
      if (a > b) up += a - b;
      else down += b - a;
    }
    monoPen += Math.min(up, down);
  }
  let cornerMax = false;
  for (let c = 0; c < 4; c++) if (g[CORNERS[c]] === maxExp) cornerMax = true;

  return (
    W.empty * empty -
    W.mono * monoPen -
    W.smooth * smoothPen +
    W.merge * pairs +
    W.max * maxExp +
    (cornerMax ? W.corner * maxExp : -W.corner * maxExp)
  );
}

interface BeamNode {
  g: Int8Array;
  seed: number;
  gain: number; // cumulative actual score from the root
  ev: number;
  pm: number; // move taken from parent (0..3)
  pi: number; // index of parent in the previous layer
}

export interface BatchResult {
  moves: string; // e.g. "ULDR"
  dirs: number[];
  predictedGain: number;
  depth: number;
}

export interface SearchOpts {
  beamWidth: number;
  commitLen: number; // moves to commit per turn when the board stays healthy
  lookahead: number; // extra depth searched beyond commitLen (trap guard)
  earlyFrac: number; // when the line dies before commitLen, commit this fraction
  maxDepth: number; // hard safety cap on search depth
}

const DEFAULT_OPTS: SearchOpts = {
  beamWidth: BEAM_WIDTH,
  commitLen: COMMIT_LEN,
  lookahead: LOOKAHEAD,
  earlyFrac: EARLY_FRAC,
  maxDepth: MAX_DEPTH,
};

// Run a deterministic beam search from (root, seed) within timeMs, then commit
// a prefix of the best line found.
export function chooseBatch(
  root: Int8Array,
  seed: number,
  timeMs: number,
  opts: SearchOpts = DEFAULT_OPTS
): BatchResult {
  const start = Date.now();
  const layers: BeamNode[][] = [];
  layers.push([{ g: root.slice(), seed, gain: 0, ev: evaluate(root), pm: -1, pi: -1 }]);

  // Search to commitLen + lookahead: we commit commitLen moves but look further
  // so the committed prefix leads to a board that is still good beyond it.
  const target = Math.min(opts.maxDepth, opts.commitLen + opts.lookahead);

  let depth = 0;
  while (depth < target) {
    if (Date.now() - start >= timeMs) break;
    const cur = layers[depth];
    if (cur.length === 0) break;
    const children: BeamNode[] = [];
    for (let pi = 0; pi < cur.length; pi++) {
      const node = cur[pi];
      for (let dir = 0; dir < 4; dir++) {
        if (!changesBoard(node.g, dir)) continue;
        const ng = node.g.slice();
        const sc = applyMoveExp(ng, dir);
        const nseed = spawnExp(ng, node.seed);
        const ev = evaluate(ng);
        children.push({ g: ng, seed: nseed, gain: node.gain + sc, ev, pm: dir, pi });
      }
    }
    if (children.length === 0) break; // everything is a dead end
    children.sort((a, b) => b.ev - a.ev);
    const kept = children.length > opts.beamWidth ? children.slice(0, opts.beamWidth) : children;
    layers.push(kept);
    depth++;
  }

  // Best-eval node in the deepest layer we reached.
  const reached = depth;
  const path: number[] = [];
  let layer = reached;
  let idx = 0;
  while (layer > 0) {
    const node = layers[layer][idx];
    path.push(node.pm);
    idx = node.pi;
    layer--;
  }
  path.reverse();

  if (path.length === 0) {
    // No move improved anything but the engine still asked us: play any legal move.
    for (let dir = 0; dir < 4; dir++) {
      if (changesBoard(root, dir)) {
        path.push(dir);
        break;
      }
    }
  }

  // Commit commitLen moves when we searched the full horizon; if the best line
  // died early (board near-stuck), back off to a fraction so we can re-plan.
  let commit: number;
  if (reached >= target) {
    commit = opts.commitLen;
  } else {
    commit = Math.floor(path.length * opts.earlyFrac);
  }
  if (commit < 1) commit = 1;
  if (commit > path.length) commit = path.length;
  const dirs = path.slice(0, commit);

  // Re-simulate the committed moves to get the exact predicted gain.
  const sim = root.slice();
  let s = seed;
  let gain = 0;
  let chars = "";
  for (const dir of dirs) {
    gain += applyMoveExp(sim, dir);
    s = spawnExp(sim, s);
    chars += DIR_CHARS[dir];
  }
  return { moves: chars, dirs, predictedGain: gain, depth };
}

// ---- I/O loop (runs only on CodinGame, where readline is defined) ----------
declare function readline(): string;

function firstLegalMove(g: Int8Array): string {
  for (let dir = 0; dir < 4; dir++) if (changesBoard(g, dir)) return DIR_CHARS[dir];
  return "U"; // the engine only asks when a move exists; this is just a guard
}

function main(): void {
  let turn = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const seed = parseInt(readline());
    parseInt(readline()); // score (we track it ourselves, not needed)
    const values: number[] = [];
    for (let y = 0; y < 4; y++) {
      const row = readline().split(" ");
      for (let x = 0; x < 4; x++) values[x + y * 4] = parseInt(row[x]);
    }
    const g = valuesToExp(values);
    const budget = turn === 0 ? FIRST_TURN_MS : TURN_MS;
    const t0 = Date.now();
    let moves: string;
    try {
      moves = chooseBatch(g, seed, budget).moves;
    } catch (e) {
      // Never crash the whole game on one bad turn: play a single legal move.
      moves = firstLegalMove(g);
      console.error(`turn ${turn} error: ${(e as Error).message}`);
    }
    const elapsed = Date.now() - t0;
    // Diagnostics on stderr (shown in the CodinGame console): turn 1 always, and
    // any later turn that runs long enough to risk the 50ms limit.
    if (turn === 0 || elapsed > 42) console.error(`turn ${turn}: ${elapsed}ms`);
    console.log(moves);
    turn++;
  }
}

if (typeof readline !== "undefined") {
  main();
}
