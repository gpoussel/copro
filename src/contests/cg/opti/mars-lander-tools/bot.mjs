// GA bot for Mars Lander fuel optimisation. This module is the offline MIRROR
// of src/contests/cg/opti/mars-lander.ts — keep the two in sync BY HAND.
//
// Per turn: evolve a population of command-delta genomes (dAngle in [-15,15],
// dPower in [-1,1] per future turn) against the faithful simulator, warm-started
// from the previous turn's population, then commit the best genome's first
// command. Fitness bands: landed (fuel-graded) > crashed-in-zone (speed/angle
// graded) > outside/lost/timeout (distance graded).
import { G, DEG, makeTerrain, step, collide } from "./sim.mjs";

export const DEFAULTS = {
  H: 120, // genome horizon (turns)
  POP: 50,
  ELITE: 8,
  MUT: 0.06, // per-gene mutation probability
  BLOCK_MUT: 0.35, // per-child probability of a constant-block mutation
  MAX_VX: 20.35, // referee accepts ROUNDED speeds <= 20/40, i.e. float < 20.5/40.5
  MAX_VY: 40.35, // (0.15 safety buffer against the rounding boundary)
  EDGE: 5, // metres from flat-zone edges considered still legal
  AIM: 50, // aim this far inside the flat zone in distance shaping
  TIME_MS: 80,
};

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// mulberry32 — deterministic RNG for reproducible offline runs
export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createBot(surface, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const terrain = makeTerrain(surface);
  const flat = terrain.flat;
  const flatX1 = flat.x1 + o.EDGE;
  const flatX2 = flat.x2 - o.EDGE;
  const aimX1 = flat.x1 + o.AIM;
  const aimX2 = flat.x2 - o.AIM;
  const rng = makeRng(opts.seed ?? 0x5eed);

  // coarse max-ground per 128px bucket for a fast no-collision test
  const NB = 7000 >> 7;
  const bucketMax = new Float64Array(NB + 1);
  for (let b = 0; b <= NB; b++) {
    let m = 0;
    const from = b << 7;
    const to = Math.min(6999, ((b + 1) << 7) - 1);
    for (const s of terrain.segs) {
      if (Math.max(s.x1, s.x2) < from || Math.min(s.x1, s.x2) > to) continue;
      m = Math.max(m, s.y1, s.y2);
    }
    bucketMax[b] = m;
  }
  const maybeHit = (x0, y0, x1, y1) => {
    const lo = Math.min(y0, y1);
    let b0 = clamp(Math.min(x0, x1), 0, 6999) >> 7;
    let b1 = clamp(Math.max(x0, x1), 0, 6999) >> 7;
    for (let b = b0; b <= b1; b++) if (lo <= bucketMax[b] + 1) return true;
    return false;
  };

  // forced upright: if a gravity-only fall would reach the ground before the
  // angle could be zeroed, override the rotation request to 0.
  const mustZero = (s) => {
    const gx = clamp(Math.round(s.x), 0, 6999);
    const h = s.y - terrain.ground[gx];
    const k = Math.ceil(Math.abs(s.angle) / 15) + 1;
    return h + s.vy * k - (G / 2) * k * k <= 0;
  };

  const decode = (s, da, dp) => {
    const reqA = mustZero(s) ? 0 : clamp(s.angle + da, -90, 90);
    const reqP = clamp(s.power + dp, 0, 4);
    return [reqA, reqP];
  };

  const distToAim = (x) => (x < aimX1 ? aimX1 - x : x > aimX2 ? x - aimX2 : 0);

  // sin/cos lookup for integer angles (-90..90)
  const SIN = new Float64Array(181);
  const COS = new Float64Array(181);
  for (let a = -90; a <= 90; a++) {
    SIN[a + 90] = Math.sin(a * DEG);
    COS[a + 90] = Math.cos(a * DEG);
  }

  // scalarized hot loop — same semantics as sim.step + decode, zero allocations
  const evalGenome = (cur, da, dp) => {
    let x = cur.x;
    let y = cur.y;
    let vx = cur.vx;
    let vy = cur.vy;
    let fuel = cur.fuel;
    let angle = cur.angle;
    let power = cur.power;
    const ground = terrain.ground;
    for (let t = 0; t < o.H; t++) {
      const gx = x < 0 ? 0 : x > 6999 ? 6999 : Math.round(x);
      const h = y - ground[gx];
      const k = Math.ceil(Math.abs(angle) / 15) + 1;
      let reqA;
      if (h + vy * k - (G / 2) * k * k <= 0) reqA = 0;
      else {
        reqA = angle + da[t];
        if (reqA < -90) reqA = -90;
        else if (reqA > 90) reqA = 90;
      }
      let reqP = power + dp[t];
      if (reqP < 0) reqP = 0;
      else if (reqP > 4) reqP = 4;
      const dA = reqA - angle;
      angle += dA > 15 ? 15 : dA < -15 ? -15 : dA;
      const dP = reqP - power;
      power += dP > 1 ? 1 : dP < -1 ? -1 : dP;
      if (fuel <= 0) power = 0;
      fuel -= power;
      if (fuel < 0) fuel = 0;
      const ax = -SIN[angle + 90] * power;
      const ay = COS[angle + 90] * power - G;
      const nx = x + vx + ax * 0.5;
      const ny = y + vy + ay * 0.5;
      const nvx = vx + ax;
      const nvy = vy + ay;
      if (maybeHit(x, y, nx, ny)) {
        const hit = collide(terrain, x, y, nx, ny);
        if (hit) {
          const inZone = hit.seg.flat && hit.x >= flatX1 && hit.x <= flatX2;
          const vxOver = Math.max(0, Math.abs(nvx) - o.MAX_VX);
          const vyOver = Math.max(0, -nvy - o.MAX_VY);
          if (inZone && angle === 0 && vxOver === 0 && vyOver === 0) {
            return 3e6 + fuel * 100; // LANDED — fuel is the objective
          }
          if (inZone) {
            return 2e6 - Math.min(9e5, vxOver * 3000 + vyOver * 3000 + Math.abs(angle) * 800);
          }
          const spd = Math.hypot(nvx, nvy);
          return 1e6 - Math.min(9.5e5, distToAim(hit.x) * 120 + Math.max(0, spd - 100) * 40);
        }
      }
      if (ny > 3000 || nx < 0 || nx >= 7000) {
        return 1e6 - Math.min(9.5e5, distToAim(nx) * 120 + 3e5);
      }
      x = nx;
      y = ny;
      vx = nvx;
      vy = nvy;
    }
    const gx = x < 0 ? 0 : x > 6999 ? 6999 : Math.round(x);
    const alt = y - ground[gx];
    return 1e6 - Math.min(9.5e5, distToAim(x) * 120 + alt * 50);
  };

  // ---- heuristic seed controller (floor / population seed) ----
  const controllerCmd = (s) => {
    const cx = (flat.x1 + flat.x2) / 2;
    const dx = cx - s.x;
    const hsWant = clamp(dx * 0.05, -55, 55);
    const hsErr = s.vx - hsWant;
    let angleWant = clamp(Math.round(hsErr * 3), -60, 60);
    if (mustZero(s)) angleWant = 0;
    const gx = clamp(Math.round(s.x), 0, 6999);
    const h = s.y - terrain.ground[gx];
    const vyWant = h > 800 ? -36 : -30;
    let powerWant;
    if (s.vy < vyWant) powerWant = 4;
    else if (Math.abs(angleWant) > 20) powerWant = 3;
    else powerWant = 0;
    return [angleWant, powerWant];
  };

  const seedGenome = (cur) => {
    const da = new Int8Array(o.H);
    const dp = new Int8Array(o.H);
    let s = cur;
    for (let t = 0; t < o.H; t++) {
      const [aw, pw] = controllerCmd(s);
      da[t] = clamp(aw - s.angle, -15, 15);
      dp[t] = clamp(pw - s.power, -1, 1);
      const [reqA, reqP] = decode(s, da[t], dp[t]);
      s = step(s, reqA, reqP);
      if (s.y <= terrain.ground[clamp(Math.round(s.x), 0, 6999)]) break;
    }
    return { da, dp, fit: -Infinity };
  };

  const randGene = () => [((rng() * 31) | 0) - 15, ((rng() * 3) | 0) - 1];
  const randGenome = () => {
    const da = new Int8Array(o.H);
    const dp = new Int8Array(o.H);
    for (let t = 0; t < o.H; t++) {
      const [a, p] = randGene();
      da[t] = a;
      dp[t] = p;
    }
    return { da, dp, fit: -Infinity };
  };

  let pop = null;
  let internal = null; // float referee state, our ground truth
  let turn = 0;

  const evolveOnce = () => {
    // sort desc by fitness (already evaluated)
    pop.sort((a, b) => b.fit - a.fit);
    const next = pop.slice(0, o.ELITE);
    while (next.length < o.POP - 2) {
      const p1 = pop[(rng() * (o.POP >> 1)) | 0];
      const p2 = pop[(rng() * (o.POP >> 1)) | 0];
      const cut = (rng() * o.H) | 0;
      const da = new Int8Array(o.H);
      const dp = new Int8Array(o.H);
      for (let t = 0; t < o.H; t++) {
        const src = t < cut ? p1 : p2;
        da[t] = src.da[t];
        dp[t] = src.dp[t];
        if (rng() < o.MUT) {
          const [a, p] = randGene();
          da[t] = a;
          dp[t] = p;
        }
      }
      if (rng() < o.BLOCK_MUT) {
        const i = (rng() * o.H) | 0;
        const j = Math.min(o.H - 1, i + 1 + ((rng() * 30) | 0));
        const [a, p] = randGene();
        for (let t = i; t <= j; t++) {
          da[t] = a;
          dp[t] = p;
        }
      }
      next.push({ da, dp, fit: -Infinity });
    }
    while (next.length < o.POP) next.push(randGenome());
    pop = next;
    for (const g of pop) if (g.fit === -Infinity) g.fit = evalGenome(internal, g.da, g.dp);
  };

  return {
    // roundedInput: {x,y,vx,vy,fuel,angle,power} as ints from the referee
    onTurn(roundedInput, timeMs = o.TIME_MS) {
      const start = Date.now();
      if (turn === 0) {
        internal = { ...roundedInput };
        pop = [seedGenome(internal)];
        for (let i = 1; i < o.POP; i++) pop.push(randGenome());
      } else {
        // desync check (informational — internal floats stay authoritative)
        const dx = Math.abs(Math.round(internal.x) - roundedInput.x);
        const dy = Math.abs(Math.round(internal.y) - roundedInput.y);
        if (dx > 1 || dy > 1) {
          if (typeof process !== "undefined") process.stderr.write(`DESYNC t${turn} pred=${Math.round(internal.x)},${Math.round(internal.y)} got=${roundedInput.x},${roundedInput.y}\n`);
          internal = { ...roundedInput };
          for (const g of pop) g.fit = -Infinity;
        }
      }

      // evaluate genomes invalidated by last turn's shift (inside the budget)
      for (const g of pop) if (g.fit === -Infinity) g.fit = evalGenome(internal, g.da, g.dp);
      while (Date.now() - start < timeMs) evolveOnce();

      pop.sort((a, b) => b.fit - a.fit);
      const best = pop[0];
      const [reqA, reqP] = decode(internal, best.da[0], best.dp[0]);
      // post-decision bookkeeping is O(POP*H) copies only — no evals
      internal = step(internal, reqA, reqP);
      for (const g of pop) {
        g.da.copyWithin(0, 1);
        g.dp.copyWithin(0, 1);
        const [a, p] = randGene();
        g.da[o.H - 1] = a;
        g.dp[o.H - 1] = p;
        g.fit = -Infinity;
      }
      turn++;
      return [reqA, reqP];
    },
    bestFit: () => (pop ? pop[0].fit : -Infinity),
  };
}
