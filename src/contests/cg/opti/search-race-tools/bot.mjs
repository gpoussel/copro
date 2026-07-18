// GA search over a horizon of (rot, thrust) EXPERT commands.
// MIRRORS src/contests/cg/opti/search-race.ts BY HAND — keep them in sync.
import { stepCar } from './engine.mjs';

export const DEFAULTS = {
  H: 15, // horizon (turns)
  POP: 48, // population size
  ELITE: 8, // elites kept each generation
  MUT: 0.12, // per-gene mutation probability
  CP_BONUS: 50000, // fitness per checkpoint passed within the horizon
  FINISH_BASE: 2e7, // fitness base for finishing within the horizon
  FINISH_W: 1e5, // per-turn weight on the finish time
  GENS: 60, // generations when TIME_MS == 0 (offline reproducible mode)
  TIME_MS: 0, // wall-clock budget per turn (online mode)
  VEL_W: 4, // fitness weight on end-of-horizon speed toward the next checkpoint
};

export function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const STATS = { lastGens: 0 };

function randRot(rng) {
  const r = rng();
  if (r < 0.2) return -18;
  if (r < 0.4) return 18;
  return Math.floor(rng() * 37) - 18;
}
function randThrust(rng) {
  const r = rng();
  if (r < 0.6) return 200;
  if (r < 0.8) return 0;
  return Math.floor(rng() * 201);
}

// Fitness: simulate H steps; finishing dominates (earlier is better, including
// the fractional collision time), else passed checkpoints then distance to next.
function evalGenome(game, rots, thrs, P, s) {
  const st = game.st;
  s.x = st.x;
  s.y = st.y;
  s.vx = st.vx;
  s.vy = st.vy;
  s.ang = st.ang;
  s.idx = st.idx;
  s.done = false;
  s.colTime = 2.0;
  const start = st.idx;
  for (let i = 0; i < P.H; i++) {
    stepCar(s, game.cx, game.cy, game.total, rots[i], thrs[i]);
    if (s.done) return P.FINISH_BASE - (i + s.colTime) * P.FINISH_W;
  }
  const dx = s.x - game.cx[s.idx];
  const dy = s.y - game.cy[s.idx];
  const dist = Math.sqrt(dx * dx + dy * dy);
  let f = (s.idx - start) * P.CP_BONUS - dist;
  if (P.VEL_W > 0 && dist > 0) f -= (P.VEL_W * (s.vx * dx + s.vy * dy)) / dist;
  return f;
}

// Greedy seed: steer toward the chased checkpoint, coast when pointing away.
function greedySeed(game, P, rots, thrs, brakeAngle) {
  const s = {
    x: game.st.x,
    y: game.st.y,
    vx: game.st.vx,
    vy: game.st.vy,
    ang: game.st.ang,
    idx: game.st.idx,
    done: false,
    colTime: 2.0,
  };
  for (let i = 0; i < P.H; i++) {
    if (s.done) {
      rots[i] = 0;
      thrs[i] = 0;
      continue;
    }
    const want = Math.atan2(game.cy[s.idx] - s.y, game.cx[s.idx] - s.x) * (180 / Math.PI);
    let diff = (((want - s.ang) % 360) + 540) % 360 - 180;
    const rot = Math.max(-18, Math.min(18, Math.round(diff)));
    const thrust = Math.abs(diff) > brakeAngle ? 0 : 200;
    rots[i] = rot;
    thrs[i] = thrust;
    stepCar(s, game.cx, game.cy, game.total, rot, thrust);
  }
}

// Search for the best genome from the game's current state.
// prev = previous turn's best {rots, thrs} for warm start (or null).
// Returns {rots, thrs, fit} (owned copies safe to keep across turns).
export function search(game, P, rng, prev) {
  const t0 = Date.now();
  const H = P.H;
  const pop = [];
  for (let i = 0; i < P.POP; i++) pop.push({ rots: new Int8Array(H), thrs: new Int16Array(H), fit: 0 });
  const scratch = { x: 0, y: 0, vx: 0, vy: 0, ang: 0, idx: 0, done: false, colTime: 2.0 };

  // Seeds: shifted previous best, two greedy variants, straight-ahead, randoms.
  let k = 0;
  if (prev) {
    const g = pop[k++];
    for (let i = 0; i < H - 1; i++) {
      g.rots[i] = prev.rots[i + 1];
      g.thrs[i] = prev.thrs[i + 1];
    }
    g.rots[H - 1] = prev.rots[H - 1];
    g.thrs[H - 1] = prev.thrs[H - 1];
  }
  greedySeed(game, P, pop[k].rots, pop[k].thrs, 90);
  k++;
  greedySeed(game, P, pop[k].rots, pop[k].thrs, 181);
  k++;
  for (let i = 0; i < H; i++) {
    pop[k].rots[i] = 0;
    pop[k].thrs[i] = 200;
  }
  k++;
  for (; k < P.POP; k++) {
    for (let i = 0; i < H; i++) {
      pop[k].rots[i] = randRot(rng);
      pop[k].thrs[i] = randThrust(rng);
    }
  }
  for (const g of pop) g.fit = evalGenome(game, g.rots, g.thrs, P, scratch);

  let gens = 0;
  outer: for (;;) {
    if (P.TIME_MS > 0) {
      if (Date.now() - t0 >= P.TIME_MS) break;
    } else if (gens >= P.GENS) break;
    gens++;
    pop.sort((a, b) => b.fit - a.fit);
    for (let slot = P.ELITE; slot < P.POP; slot++) {
      if (P.TIME_MS > 0 && Date.now() - t0 >= P.TIME_MS) break outer; // mirror of the solver's per-child check
      const pa = pop[(rng() * P.ELITE) | 0];
      let pb = pop[(rng() * P.ELITE) | 0];
      if (pb === pa) pb = pop[(rng() * P.ELITE) | 0];
      const child = pop[slot];
      for (let i = 0; i < H; i++) {
        const src = rng() < 0.5 ? pa : pb;
        child.rots[i] = src.rots[i];
        child.thrs[i] = src.thrs[i];
        if (rng() < P.MUT) child.rots[i] = randRot(rng);
        if (rng() < P.MUT) child.thrs[i] = randThrust(rng);
      }
      child.fit = evalGenome(game, child.rots, child.thrs, P, scratch);
    }
  }
  STATS.lastGens = gens;

  let best = pop[0];
  for (const g of pop) if (g.fit > best.fit) best = g;
  return { rots: Int8Array.from(best.rots), thrs: Int16Array.from(best.thrs), fit: best.fit };
}
