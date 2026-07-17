// A*Craft — faithful offline simulator + simulated-annealing arrow placer.
//
// Referee facts (CodinGameCommunity/A-Star-Craft, verbatim):
//  - Grid 19x10, TORUS. A robot's state is (cellIdentity, direction); cells are
//    unique per (x,y) so state == (x, y, dir). 190-cell map.
//  - Raw map chars: UPPERCASE U/R/D/L = a robot with that facing (cell is empty
//    platform); lowercase u/r/d/l = a FIXED pre-placed arrow; '.' empty platform;
//    '#' void. (The program's stdin uppercases arrows and lists robots separately;
//    this module works from the raw contributor map used by the test cases.)
//  - Turn 0: place arrows on empty ('.') platform cells only. An arrow placed on a
//    robot's start cell overrides that robot's initial direction. Then states are
//    registered.
//  - Each turn: score += liveRobots; each robot moves 1 cell; VOID -> dead; else
//    arrow turns it; register (cell,dir); repeat -> dead. Robots never interact.
//  - Score = sum of per-robot lifetimes (turns counted while alive).
//
// This exact logic is mirrored by hand in ../a-star-craft.ts (keep in sync).

export const W = 19;
export const H = 10;
export const AREA = W * H;
export const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3, NONE = 4, VOID = 5;

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

// Precomputed neighbour table: NEXT[idx*4 + dir] = destination cell index (torus).
export const NEXT = new Int32Array(AREA * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    for (let d = 0; d < 4; d++) {
      const nx = (x + DX[d] + W) % W;
      const ny = (y + DY[d] + H) % H;
      NEXT[idx * 4 + d] = ny * W + nx;
    }
  }
}

const CHAR_TO_DIR = { U: UP, R: RIGHT, D: DOWN, L: LEFT };
const DIR_TO_CHAR = ['U', 'R', 'D', 'L'];

// Parse a raw contributor map (10 lines) into a board.
// Returns { type: Int8Array(AREA), robots: [{idx, x, y, dir}] }.
// `type` holds the FIXED terrain: VOID or a pre-placed arrow (lowercase) or NONE.
export function parseRaw(lines) {
  const type = new Int8Array(AREA).fill(NONE);
  const robots = [];
  for (let y = 0; y < H; y++) {
    const line = lines[y];
    for (let x = 0; x < W; x++) {
      const c = line[x];
      const idx = y * W + x;
      if (c === '#') type[idx] = VOID;
      else if (c === '.') type[idx] = NONE;
      else if (c >= 'A' && c <= 'Z') robots.push({ idx, x, y, dir: CHAR_TO_DIR[c] });
      else type[idx] = CHAR_TO_DIR[c.toUpperCase()]; // lowercase = fixed arrow
    }
  }
  return { type, robots };
}

// Build the board directly from the program-input format (used by the .ts solver):
// grid where arrows are UPPERCASE, robots listed separately.
export function parseInput(gridLines, robots) {
  const type = new Int8Array(AREA).fill(NONE);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = gridLines[y][x];
      const idx = y * W + x;
      if (c === '#') type[idx] = VOID;
      else if (c === '.') type[idx] = NONE;
      else type[idx] = CHAR_TO_DIR[c]; // already-placed arrow
    }
  }
  return { type, robots };
}

// Reusable visited buffer (state = idx*4+dir). Stamped to avoid clearing.
const visited = new Int32Array(AREA * 4);
let stamp = 0;

// Score a full configuration `cfg` (Int8Array over cells: a direction 0..3, NONE,
// or VOID). Robots are simulated independently; total = sum of lifetimes.
export function score(cfg, robots) {
  let total = 0;
  for (let r = 0; r < robots.length; r++) {
    const rb = robots[r];
    let cell = rb.idx;
    // Arrow placed under the robot overrides its initial facing.
    let dir = cfg[cell] < 4 ? cfg[cell] : rb.dir;
    stamp++;
    visited[cell * 4 + dir] = stamp;
    for (;;) {
      total++; // counted while alive at start of this turn
      cell = NEXT[cell * 4 + dir];
      const t = cfg[cell];
      if (t === VOID) break;
      if (t < 4) dir = t;
      const s = cell * 4 + dir;
      if (visited[s] === stamp) break;
      visited[s] = stamp;
    }
  }
  return total;
}

// Connected component of non-void cells reachable (4-neighbour torus) from any
// robot start. Only cells in such a component can ever be visited, so only those
// are worth putting arrows on.
function reachableCandidates(type, robots) {
  const seen = new Uint8Array(AREA);
  const stack = [];
  for (const rb of robots) {
    if (!seen[rb.idx]) { seen[rb.idx] = 1; stack.push(rb.idx); }
  }
  while (stack.length) {
    const idx = stack.pop();
    for (let d = 0; d < 4; d++) {
      const n = NEXT[idx * 4 + d];
      if (!seen[n] && type[n] !== VOID) { seen[n] = 1; stack.push(n); }
    }
  }
  const cands = [];
  for (let i = 0; i < AREA; i++) if (seen[i] && type[i] === NONE) cands.push(i);
  return cands;
}

// Deterministic xorshift RNG (seeded) so benches are reproducible.
function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

// Simulated annealing over single-cell arrow choices. Returns { cfg, score }.
export function solve(board, timeMs, seed = 12345) {
  const { type, robots } = board;
  const cands = reachableCandidates(type, robots);
  const cfg = Int8Array.from(type);
  let cur = score(cfg, robots);
  const best = Int8Array.from(cfg);
  let bestScore = cur;

  if (cands.length === 0) return { cfg: best, score: bestScore };

  const rng = makeRng(seed);
  const deadline = Date.now() + timeMs;
  const options = [NONE, UP, RIGHT, DOWN, LEFT];

  let T = 3.0;
  const Tmin = 0.02;
  let iter = 0;
  let sinceImprove = 0;
  const checkEvery = 4096;

  for (;;) {
    if ((iter & (checkEvery - 1)) === 0 && Date.now() >= deadline) break;
    iter++;

    const c = cands[(rng() * cands.length) | 0];
    const old = cfg[c];
    let nv = options[(rng() * 5) | 0];
    if (nv === old) nv = options[(rng() * 5) | 0];
    if (nv === old) { continue; }
    cfg[c] = nv;
    const s = score(cfg, robots);
    const delta = s - cur;
    if (delta >= 0 || rng() < Math.exp(delta / T)) {
      cur = s;
      if (s > bestScore) {
        bestScore = s;
        best.set(cfg);
        sinceImprove = 0;
      } else sinceImprove++;
    } else {
      cfg[c] = old;
      sinceImprove++;
    }

    // Geometric cooling with periodic reheat to escape local optima.
    T *= 0.99997;
    if (T < Tmin) T = Tmin;
    if (sinceImprove > 60000) {
      T = 1.5;
      cfg.set(best);
      cur = bestScore;
      sinceImprove = 0;
    }
  }
  return { cfg: best, score: bestScore, iters: iter };
}

// Turn a solved config into the CodinGame output line (only cells whose arrow
// differs from the fixed terrain, i.e. arrows we added).
export function toOutput(cfg, type) {
  const parts = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (type[idx] === NONE && cfg[idx] < 4) {
        parts.push(`${x} ${y} ${DIR_TO_CHAR[cfg[idx]]}`);
      }
    }
  }
  return parts.join(' ');
}
