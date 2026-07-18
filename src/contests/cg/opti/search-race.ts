// Search Race (Illedan) — CodinGame optimization puzzle.
//
// RULES (ported verbatim from github.com/Illedan/CGSearchRace):
//   Drive a car through 3 laps of circular checkpoints (radius 600) on a
//   16000x9000 map, at most 600 turns. Per turn: rotate at most 18 degrees toward
//   the target (the EXPERT output format gives the relative rotation directly),
//   add heading*thrust (0..200) to the velocity, move with swept-circle
//   checkpoint collection, then truncate position, multiply velocity by 0.85 and
//   truncate, round the angle to whole degrees. The state handed to us each turn
//   is therefore fully integer — we replan from it every turn with no float carry.
//
// SCORE = timer + colTime (completed turns + fractional collision time of the
//   final checkpoint), lower is better; 1000 if not finished. The finishing turn
//   does not increment the timer. Calibrated bit-exact against the real referee
//   (trajectory and final score) via run_puzzle_tests probes.
//
// APPROACH: per-turn genetic algorithm over a horizon of (rotation, thrust)
//   commands evaluated by the faithful inline simulator. Fitness: finishing
//   within the horizon dominates (earlier + fractional time better), else
//   checkpoints passed then distance to the next one. Population warm-started
//   from the previous turn's best (shifted) plus greedy seeds. Time-budgeted so
//   it adapts to CG's slower hardware.
//
// The offline mirror lives in search-race-tools/ (engine.mjs + bot.mjs + bench)
//   — KEEP THEM IN SYNC BY HAND.
//
// PITFALL (see a-star-craft notes): readline() blocks until the referee sends
//   the turn data, so the per-turn clock starts AFTER the read.

// ---- Tunables -------------------------------------------------------------
const H = 15; // horizon (turns)
const POP = 48; // population size
const ELITE = 8; // elites kept each generation
const MUT = 0.12; // per-gene mutation probability
const CP_BONUS = 50000; // fitness per checkpoint passed within the horizon
const VEL_W = 4; // fitness weight on end-of-horizon speed toward the next checkpoint
const FINISH_BASE = 2e7; // fitness base for finishing within the horizon
const FINISH_W = 1e5; // per-turn weight on the finish time
const TURN_MS = 25; // per-turn wall-clock budget (limit 50ms; grading machines randomly stall — a lost validator costs 1000, far more than the search quality lost here)
const FIRST_TURN_MS = 600; // first turn budget (limit 1000ms incl. process boot)
// ---------------------------------------------------------------------------

const CP_RADIUS = 600;
const DEG2RAD = Math.PI / 180;

interface CarState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ang: number; // integer degrees in [0, 360]
  idx: number; // next checkpoint index in the streamed sequence
  done: boolean;
  colTime: number;
}

// Utility.truncate: round if within 1e-5 of an int, else trunc toward zero.
function truncate(x: number): number {
  const s = x < 0 ? -1 : 1;
  const r = s * Math.round(s * x);
  if (Math.abs(r - x) < 0.00001) return r;
  return x < 0 ? Math.ceil(x) : Math.floor(x);
}

function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Input ----------------------------------------------------------------
const total: number = parseInt(readline(), 10);
const cx = new Float64Array(total);
const cy = new Float64Array(total);
for (let i = 0; i < total; i++) {
  const parts = readline().split(' ');
  cx[i] = parseInt(parts[0], 10);
  cy[i] = parseInt(parts[1], 10);
}

// ---- Simulation (referee port, EXPERT semantics) --------------------------
function stepCar(st: CarState, rot: number, thrust: number): void {
  const nd = st.ang + rot; // integer degrees, possibly outside [0, 360]
  const rad = nd * DEG2RAD;
  st.vx += Math.cos(rad) * thrust;
  st.vy += Math.sin(rad) * thrust;

  let t = 0.0;
  st.colTime = 2.0;
  let collided = true;
  while (!st.done && collided) {
    collided = false;
    const dx = st.x - cx[st.idx];
    const dy = st.y - cy[st.idx];
    let ct = -1.0;
    if (Math.sqrt(dx * dx + dy * dy) <= CP_RADIUS) {
      ct = 0.0;
    } else {
      const a = st.vx * st.vx + st.vy * st.vy;
      if (a > 0.0) {
        const b = 2.0 * (dx * st.vx + dy * st.vy);
        const c = dx * dx + dy * dy - CP_RADIUS * CP_RADIUS;
        const delta = b * b - 4.0 * a * c;
        if (delta >= 0.0) {
          const tt = (-b - Math.sqrt(delta)) / (2.0 * a);
          if (tt > 0.0) ct = tt;
        }
      }
    }
    if (ct >= 0.0 && ct + t <= 1.0) {
      collided = true;
      st.idx++;
      t += ct;
      st.colTime = t;
      st.x += st.vx * ct;
      st.y += st.vy * ct;
      if (st.idx >= total) st.done = true;
    }
  }
  st.x += st.vx * (1.0 - t);
  st.y += st.vy * (1.0 - t);

  st.x = truncate(st.x);
  st.y = truncate(st.y);
  st.vx = truncate(st.vx * 0.85);
  st.vy = truncate(st.vy * 0.85);
  let d = nd;
  while (d > 360) d -= 360;
  while (d < 0) d += 360;
  st.ang = d;
}

// ---- GA -------------------------------------------------------------------
interface Genome {
  rots: Int8Array;
  thrs: Int16Array;
  fit: number;
}

const rng = makeRng(0x5eac4ace);

function randRot(): number {
  const r = rng();
  if (r < 0.2) return -18;
  if (r < 0.4) return 18;
  return Math.floor(rng() * 37) - 18;
}
function randThrust(): number {
  const r = rng();
  if (r < 0.6) return 200;
  if (r < 0.8) return 0;
  return Math.floor(rng() * 201);
}

const scratch: CarState = { x: 0, y: 0, vx: 0, vy: 0, ang: 0, idx: 0, done: false, colTime: 2.0 };

function evalGenome(st0: CarState, rots: Int8Array, thrs: Int16Array): number {
  const s = scratch;
  s.x = st0.x;
  s.y = st0.y;
  s.vx = st0.vx;
  s.vy = st0.vy;
  s.ang = st0.ang;
  s.idx = st0.idx;
  s.done = false;
  s.colTime = 2.0;
  const start = st0.idx;
  for (let i = 0; i < H; i++) {
    stepCar(s, rots[i], thrs[i]);
    if (s.done) return FINISH_BASE - (i + s.colTime) * FINISH_W;
  }
  const dx = s.x - cx[s.idx];
  const dy = s.y - cy[s.idx];
  const dist = Math.sqrt(dx * dx + dy * dy);
  let f = (s.idx - start) * CP_BONUS - dist;
  if (dist > 0) f -= (VEL_W * (s.vx * dx + s.vy * dy)) / dist;
  return f;
}

// Greedy seed: steer toward the chased checkpoint, coast above brakeAngle.
function greedySeed(st0: CarState, rots: Int8Array, thrs: Int16Array, brakeAngle: number): void {
  const s: CarState = {
    x: st0.x,
    y: st0.y,
    vx: st0.vx,
    vy: st0.vy,
    ang: st0.ang,
    idx: st0.idx,
    done: false,
    colTime: 2.0,
  };
  for (let i = 0; i < H; i++) {
    if (s.done) {
      rots[i] = 0;
      thrs[i] = 0;
      continue;
    }
    const want = Math.atan2(cy[s.idx] - s.y, cx[s.idx] - s.x) / DEG2RAD;
    const diff = ((((want - s.ang) % 360) + 540) % 360) - 180;
    const rot = Math.max(-18, Math.min(18, Math.round(diff)));
    const thrust = Math.abs(diff) > brakeAngle ? 0 : 200;
    rots[i] = rot;
    thrs[i] = thrust;
    stepCar(s, rot, thrust);
  }
}

const pop: Genome[] = [];
for (let i = 0; i < POP; i++) pop.push({ rots: new Int8Array(H), thrs: new Int16Array(H), fit: 0 });
// Warm-start buffers reused every turn (no per-turn allocation: GC pauses are a
// real timeout hazard on CG's hardware).
const prevBest: Genome = { rots: new Int8Array(H), thrs: new Int16Array(H), fit: 0 };
let havePrev = false;

function search(st0: CarState, budgetMs: number, t0: number): Genome {
  let k = 0;
  if (havePrev) {
    const g = pop[k++];
    for (let i = 0; i < H - 1; i++) {
      g.rots[i] = prevBest.rots[i + 1];
      g.thrs[i] = prevBest.thrs[i + 1];
    }
    g.rots[H - 1] = prevBest.rots[H - 1];
    g.thrs[H - 1] = prevBest.thrs[H - 1];
  }
  greedySeed(st0, pop[k].rots, pop[k].thrs, 90);
  k++;
  greedySeed(st0, pop[k].rots, pop[k].thrs, 181);
  k++;
  for (let i = 0; i < H; i++) {
    pop[k].rots[i] = 0;
    pop[k].thrs[i] = 200;
  }
  k++;
  for (; k < POP; k++) {
    for (let i = 0; i < H; i++) {
      pop[k].rots[i] = randRot();
      pop[k].thrs[i] = randThrust();
    }
  }
  for (const g of pop) g.fit = evalGenome(st0, g.rots, g.thrs);

  outer: while (Date.now() - t0 < budgetMs) {
    pop.sort((a, b) => b.fit - a.fit);
    for (let slot = ELITE; slot < POP; slot++) {
      if (Date.now() - t0 >= budgetMs) break outer; // per-child check: never bust 50ms
      const pa = pop[(rng() * ELITE) | 0];
      let pb = pop[(rng() * ELITE) | 0];
      if (pb === pa) pb = pop[(rng() * ELITE) | 0];
      const child = pop[slot];
      for (let i = 0; i < H; i++) {
        const src = rng() < 0.5 ? pa : pb;
        child.rots[i] = src.rots[i];
        child.thrs[i] = src.thrs[i];
        if (rng() < MUT) child.rots[i] = randRot();
        if (rng() < MUT) child.thrs[i] = randThrust();
      }
      child.fit = evalGenome(st0, child.rots, child.thrs);
    }
  }

  let best = pop[0];
  for (const g of pop) if (g.fit > best.fit) best = g;
  return best;
}

// ---- Game loop ------------------------------------------------------------
const predicted: CarState = { x: 0, y: 0, vx: 0, vy: 0, ang: 0, idx: 0, done: false, colTime: 2.0 };
let havePrediction = false;
let firstTurn = true;

for (;;) {
  const line = readline();
  if (!line) break;
  const t0 = Date.now(); // clock starts AFTER the blocking read
  const parts = line.split(' ');
  const st: CarState = {
    idx: parseInt(parts[0], 10),
    x: parseInt(parts[1], 10),
    y: parseInt(parts[2], 10),
    vx: parseInt(parts[3], 10),
    vy: parseInt(parts[4], 10),
    ang: parseInt(parts[5], 10),
    done: false,
    colTime: 2.0,
  };
  if (havePrediction) {
    if (
      predicted.idx !== st.idx ||
      predicted.x !== st.x ||
      predicted.y !== st.y ||
      predicted.vx !== st.vx ||
      predicted.vy !== st.vy ||
      predicted.ang !== st.ang
    ) {
      console.error(
        `DESYNC pred ${predicted.idx} ${predicted.x} ${predicted.y} ${predicted.vx} ${predicted.vy} ${predicted.ang} got ${line}`,
      );
    }
  }
  const budget = firstTurn ? FIRST_TURN_MS : TURN_MS;
  firstTurn = false;
  const best = search(st, budget, t0);
  const rot = best.rots[0];
  const thrust = best.thrs[0];
  console.log(`EXPERT ${rot} ${thrust}`);
  prevBest.rots.set(best.rots);
  prevBest.thrs.set(best.thrs);
  havePrev = true;
  predicted.x = st.x;
  predicted.y = st.y;
  predicted.vx = st.vx;
  predicted.vy = st.vy;
  predicted.ang = st.ang;
  predicted.idx = st.idx;
  predicted.done = false;
  predicted.colTime = 2.0;
  stepCar(predicted, rot, thrust);
  havePrediction = true;
}
