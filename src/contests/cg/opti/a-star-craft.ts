// A*Craft (CodinGame optimization puzzle).
//
// Rules (from the referee, CodinGameCommunity/A-Star-Craft):
//  - 19x10 TORUS grid. A robot's state is (cell, direction); each (x,y) is a
//    unique cell, so state == (x, y, dir).
//  - You place arrows once, on empty ('.') platform cells only (placing one under
//    a robot overrides that robot's initial direction). Then the game runs.
//  - Each turn: score += number of live robots; every robot advances one cell in
//    its facing; stepping onto void kills it; an arrow rotates it; re-entering an
//    already-visited (cell,dir) state kills it. Robots do not interact.
//  - Score = sum of per-robot lifetimes. Goal: maximize it.
//
// Approach: it is a one-shot combinatorial optimization. Build a faithful, fast
// simulator (score a whole arrow configuration in a few thousand ops) and run
// simulated annealing over single-cell arrow choices within the time budget,
// keeping the best configuration found. Only cells reachable from a robot on the
// non-void platform can ever be visited, so only those are candidates.
//
// This mirrors src/contests/cg/opti/a-star-craft-tools/solver.mjs (keep in sync).

const TIME_MS = 900; // stay well under the 1s response limit

const W = 19,
  H = 10,
  AREA = W * H;
const UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
  NONE = 4,
  VOID = 5;
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];
const CHAR_TO_DIR: Record<string, number> = { U: UP, R: RIGHT, D: DOWN, L: LEFT };
const DIR_TO_CHAR = ['U', 'R', 'D', 'L'];

const NEXT = new Int32Array(AREA * 4);
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

// --- Read input --- (start the clock only after input arrives: the first
// readline() blocks until the referee sends turn-0 data, and that wait must not
// count against the search budget.)
const gridLines: string[] = [];
for (let i = 0; i < H; i++) gridLines.push(readline());
const robotCount = parseInt(readline(), 10);
const robotIdx: number[] = [];
const robotDir: number[] = [];
for (let i = 0; i < robotCount; i++) {
  const parts = readline().split(' ');
  const x = parseInt(parts[0], 10);
  const y = parseInt(parts[1], 10);
  robotIdx.push(y * W + x);
  robotDir.push(CHAR_TO_DIR[parts[2]]);
}
const T0 = Date.now();

const type = new Int8Array(AREA).fill(NONE);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const c = gridLines[y][x];
    const idx = y * W + x;
    if (c === '#') type[idx] = VOID;
    else if (c === '.') type[idx] = NONE;
    else type[idx] = CHAR_TO_DIR[c]; // pre-placed arrow (uppercased on stdin)
  }
}

// --- Simulator ---
const visited = new Int32Array(AREA * 4);
let stamp = 0;

function score(cfg: Int8Array): number {
  let total = 0;
  for (let r = 0; r < robotCount; r++) {
    let cell = robotIdx[r];
    let dir = cfg[cell] < 4 ? cfg[cell] : robotDir[r];
    stamp++;
    visited[cell * 4 + dir] = stamp;
    for (;;) {
      total++;
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

// Candidate cells: empty platform cells reachable from some robot.
function reachableCandidates(): number[] {
  const seen = new Uint8Array(AREA);
  const stack: number[] = [];
  for (let r = 0; r < robotCount; r++) {
    if (!seen[robotIdx[r]]) {
      seen[robotIdx[r]] = 1;
      stack.push(robotIdx[r]);
    }
  }
  while (stack.length) {
    const idx = stack.pop() as number;
    for (let d = 0; d < 4; d++) {
      const n = NEXT[idx * 4 + d];
      if (!seen[n] && type[n] !== VOID) {
        seen[n] = 1;
        stack.push(n);
      }
    }
  }
  const cands: number[] = [];
  for (let i = 0; i < AREA; i++) if (seen[i] && type[i] === NONE) cands.push(i);
  return cands;
}

// Deterministic RNG.
let rngState = 0x9e3779b9 >>> 0;
function rng(): number {
  let s = rngState;
  s ^= s << 13;
  s >>>= 0;
  s ^= s >> 17;
  s ^= s << 5;
  s >>>= 0;
  rngState = s;
  return s / 4294967296;
}

// --- Simulated annealing ---
const cands = reachableCandidates();
const cfg = Int8Array.from(type);
let cur = score(cfg);
const best = Int8Array.from(cfg);
let bestScore = cur;

if (cands.length > 0) {
  const options = [NONE, UP, RIGHT, DOWN, LEFT];
  let T = 3.0;
  const Tmin = 0.02;
  let iter = 0;
  let sinceImprove = 0;
  for (;;) {
    if ((iter & 4095) === 0 && Date.now() - T0 >= TIME_MS) break;
    iter++;
    const c = cands[(rng() * cands.length) | 0];
    const old = cfg[c];
    let nv = options[(rng() * 5) | 0];
    if (nv === old) nv = options[(rng() * 5) | 0];
    if (nv === old) continue;
    cfg[c] = nv;
    const s = score(cfg);
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
    T *= 0.99997;
    if (T < Tmin) T = Tmin;
    if (sinceImprove > 60000) {
      T = 1.5;
      cfg.set(best);
      cur = bestScore;
      sinceImprove = 0;
    }
  }
}

// --- Output the arrows we added ---
const parts: string[] = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    if (type[idx] === NONE && best[idx] < 4) {
      parts.push(`${x} ${y} ${DIR_TO_CHAR[best[idx]]}`);
    }
  }
}
console.log(parts.join(' '));
