// 🎮 CodinGame Optimization - Mars Lander (fuel optimisation)
// https://www.codingame.com/training/optim/mars-lander
//
// Land on the flat zone with angle 0, |vSpeed| <= 40, |hSpeed| <= 20; the score
// is the remaining fuel. The statement promises the hidden validators are
// near-copies of the 5 visible tests, so the visible tests are the objective.
//
// Referee physics per 1-second turn (calibrated bit-exact against the real
// runner — see mars-lander-tools/validate.mjs):
//   angle += clamp(reqAngle - angle, -15, 15); power += clamp(reqPower - power, -1, 1)
//   fuel -= power (power forced to 0 once fuel is 0)
//   ax = -sin(angle°)*power ; ay = cos(angle°)*power - 3.711
//   x += vx + ax/2 ; y += vy + ay/2 ; vx += ax ; vy += ay   (floats internally,
//   the inputs we receive are the rounded values)
//
// STRATEGY: per-turn GENETIC SEARCH over the future command sequence (genome =
// per-turn dAngle in [-15,15] + dPower in [-1,1]), evaluated with the faithful
// internal simulator from an internally-maintained FLOAT state (the rounded
// referee inputs are only used for a desync check). Fitness bands: safe landing
// (graded by remaining fuel — the objective) > crash inside the zone (graded by
// overspeed/angle) > crash outside / lost / timeout (graded by distance to the
// zone). A decode-time guard forces the rotation request to 0 whenever a
// gravity-only fall would reach the ground before the angle could be zeroed, so
// nearly every genome is "landing-legal" and the GA optimises fuel, not angle
// bookkeeping. The population is seeded with a hand-written descent controller
// (the floor) and warm-started across turns (shift by one, refill the tail).
// Offline this lands all 5 visible tests; see mars-lander-tools/bench.mjs.
//
// Keep this file in sync BY HAND with mars-lander-tools/bot.mjs + sim.mjs.

const H = 120; // genome horizon (turns)
const POP = 50; // population size
const ELITE = 8;
const MUT = 0.06; // per-gene mutation probability
const BLOCK_MUT = 0.35; // per-child probability of a constant-block mutation
const MAX_VX = 20.35; // referee accepts ROUNDED speeds <= 20/40, i.e. float < 20.5/40.5
const MAX_VY = 40.35; // (0.15 safety buffer against the rounding boundary)
const SINK = 0.5; // referee collision = trajectory strictly below surface in ROUNDED terms
const EDGE = 5; // metres from flat-zone edges considered still legal
const AIM = 50; // aim this far inside the flat zone in distance shaping
const TIME_MS = 80; // hard turn limit is 100ms; leave margin

const G = 3.711;
const DEG = Math.PI / 180;

interface Lander {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuel: number;
  angle: number;
  power: number;
}

interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  flat: boolean;
}

interface Genome {
  da: Int8Array;
  dp: Int8Array;
  fit: number;
}

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

// mulberry32 — same RNG as the offline harness
let rngState = 0x5eed;
const rng = (): number => {
  rngState |= 0;
  rngState = (rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ---- read the surface ----
const surfaceN = parseInt(readline());
const surface: [number, number][] = [];
for (let i = 0; i < surfaceN; i++) {
  const [a, b] = readline().split(" ").map(Number);
  surface.push([a, b]);
}

const segs: Seg[] = [];
for (let i = 0; i + 1 < surface.length; i++) {
  const [x1, y1] = surface[i];
  const [x2, y2] = surface[i + 1];
  segs.push({ x1, y1, x2, y2, flat: y1 === y2 && x2 - x1 >= 1000 });
}
const flat = segs.find((s) => s.flat)!;
const flatX1 = flat.x1 + EDGE;
const flatX2 = flat.x2 - EDGE;
const aimX1 = flat.x1 + AIM;
const aimX2 = flat.x2 - AIM;

// ground height per integer x (guidance only; collision uses exact segments)
const ground = new Float64Array(7000);
for (const s of segs) {
  const from = Math.max(0, Math.floor(s.x1));
  const to = Math.min(6999, Math.ceil(s.x2));
  for (let x = from; x <= to; x++) {
    const t = s.x2 === s.x1 ? 0 : (x - s.x1) / (s.x2 - s.x1);
    ground[x] = s.y1 + t * (s.y2 - s.y1);
  }
}

// coarse max-ground per 128px bucket for a fast no-collision test
const NB = 7000 >> 7;
const bucketMax = new Float64Array(NB + 1);
for (let b = 0; b <= NB; b++) {
  let m = 0;
  const from = b << 7;
  const to = Math.min(6999, ((b + 1) << 7) - 1);
  for (const s of segs) {
    if (Math.max(s.x1, s.x2) < from || Math.min(s.x1, s.x2) > to) continue;
    m = Math.max(m, s.y1, s.y2);
  }
  bucketMax[b] = m;
}
const maybeHit = (x0: number, y0: number, x1: number, y1: number): boolean => {
  const lo = Math.min(y0, y1);
  const b0 = clamp(Math.min(x0, x1), 0, 6999) >> 7;
  const b1 = clamp(Math.max(x0, x1), 0, 6999) >> 7;
  for (let b = b0; b <= b1; b++) if (lo <= bucketMax[b] + 1) return true;
  return false;
};

interface Hit {
  t: number;
  x: number;
  y: number;
  seg: Seg;
}

// Collision vs the surface lowered by SINK (matches the real referee, which
// only registers a collision once the ROUNDED trajectory goes strictly below).
const collide = (x0: number, y0: number, x1: number, y1: number): Hit | null => {
  const mnx = Math.min(x0, x1);
  const mxx = Math.max(x0, x1);
  let best: Hit | null = null;
  for (const s of segs) {
    if (Math.max(s.x1, s.x2) < mnx || Math.min(s.x1, s.x2) > mxx) continue;
    const sy1 = s.y1 - SINK;
    const sy2 = s.y2 - SINK;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const ex = s.x2 - s.x1;
    const ey = sy2 - sy1;
    const den = dx * ey - dy * ex;
    if (den === 0) continue;
    const t = ((s.x1 - x0) * ey - (sy1 - y0) * ex) / den;
    const u = ((s.x1 - x0) * dy - (sy1 - y0) * dx) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      if (best === null || t < best.t) best = { t, x: x0 + t * dx, y: y0 + t * dy, seg: s };
    }
  }
  return best;
};

// one referee turn (returns a new state)
const step = (s: Lander, reqA: number, reqP: number): Lander => {
  const ta = reqA < -90 ? -90 : reqA > 90 ? 90 : reqA;
  const tp = reqP < 0 ? 0 : reqP > 4 ? 4 : reqP;
  const da = ta - s.angle;
  const angle = s.angle + (da > 15 ? 15 : da < -15 ? -15 : da);
  const dp = tp - s.power;
  let power = s.power + (dp > 1 ? 1 : dp < -1 ? -1 : dp);
  if (s.fuel <= 0) power = 0;
  const fuel = s.fuel - power < 0 ? 0 : s.fuel - power;
  const rad = angle * DEG;
  const ax = -Math.sin(rad) * power;
  const ay = Math.cos(rad) * power - G;
  return {
    x: s.x + s.vx + ax * 0.5,
    y: s.y + s.vy + ay * 0.5,
    vx: s.vx + ax,
    vy: s.vy + ay,
    fuel,
    angle,
    power,
  };
};

// forced upright: if a gravity-only fall would reach the ground before the
// angle could be zeroed, override the rotation request to 0.
const mustZero = (s: Lander): boolean => {
  const gx = clamp(Math.round(s.x), 0, 6999);
  const h = s.y - ground[gx];
  const k = Math.ceil(Math.abs(s.angle) / 15) + 1;
  return h + s.vy * k - (G / 2) * k * k <= 0;
};

const decode = (s: Lander, da: number, dp: number): [number, number] => {
  const reqA = mustZero(s) ? 0 : clamp(s.angle + da, -90, 90);
  const reqP = clamp(s.power + dp, 0, 4);
  return [reqA, reqP];
};

const distToAim = (x: number): number => (x < aimX1 ? aimX1 - x : x > aimX2 ? x - aimX2 : 0);

// sin/cos lookup for integer angles (-90..90)
const SIN = new Float64Array(181);
const COS = new Float64Array(181);
for (let a = -90; a <= 90; a++) {
  SIN[a + 90] = Math.sin(a * DEG);
  COS[a + 90] = Math.cos(a * DEG);
}

// scalarized hot loop — same semantics as step + decode, zero allocations
const evalGenome = (cur: Lander, da: Int8Array, dp: Int8Array): number => {
  let x = cur.x;
  let y = cur.y;
  let vx = cur.vx;
  let vy = cur.vy;
  let fuel = cur.fuel;
  let angle = cur.angle;
  let power = cur.power;
  for (let t = 0; t < H; t++) {
    const gx = x < 0 ? 0 : x > 6999 ? 6999 : Math.round(x);
    const h = y - ground[gx];
    const k = Math.ceil(Math.abs(angle) / 15) + 1;
    let reqA: number;
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
      const hit = collide(x, y, nx, ny);
      if (hit) {
        const inZone = hit.seg.flat && hit.x >= flatX1 && hit.x <= flatX2;
        const vxOver = Math.max(0, Math.abs(nvx) - MAX_VX);
        const vyOver = Math.max(0, -nvy - MAX_VY);
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
const controllerCmd = (s: Lander): [number, number] => {
  const cx = (flat.x1 + flat.x2) / 2;
  const dx = cx - s.x;
  const hsWant = clamp(dx * 0.05, -55, 55);
  const hsErr = s.vx - hsWant;
  let angleWant = clamp(Math.round(hsErr * 3), -60, 60);
  if (mustZero(s)) angleWant = 0;
  const gx = clamp(Math.round(s.x), 0, 6999);
  const h = s.y - ground[gx];
  const vyWant = h > 800 ? -36 : -30;
  let powerWant: number;
  if (s.vy < vyWant) powerWant = 4;
  else if (Math.abs(angleWant) > 20) powerWant = 3;
  else powerWant = 0;
  return [angleWant, powerWant];
};

const seedGenome = (cur: Lander): Genome => {
  const da = new Int8Array(H);
  const dp = new Int8Array(H);
  let s = cur;
  for (let t = 0; t < H; t++) {
    const [aw, pw] = controllerCmd(s);
    da[t] = clamp(aw - s.angle, -15, 15);
    dp[t] = clamp(pw - s.power, -1, 1);
    const [reqA, reqP] = decode(s, da[t], dp[t]);
    s = step(s, reqA, reqP);
    if (s.y <= ground[clamp(Math.round(s.x), 0, 6999)]) break;
  }
  return { da, dp, fit: -Infinity };
};

const randGene = (): [number, number] => [((rng() * 31) | 0) - 15, ((rng() * 3) | 0) - 1];
const randGenome = (): Genome => {
  const da = new Int8Array(H);
  const dp = new Int8Array(H);
  for (let t = 0; t < H; t++) {
    const [a, p] = randGene();
    da[t] = a;
    dp[t] = p;
  }
  return { da, dp, fit: -Infinity };
};

let pop: Genome[] = [];
let internal: Lander | null = null;
let turn = 0;

const evolveOnce = (): void => {
  pop.sort((a, b) => b.fit - a.fit);
  const next = pop.slice(0, ELITE);
  while (next.length < POP - 2) {
    const p1 = pop[(rng() * (POP >> 1)) | 0];
    const p2 = pop[(rng() * (POP >> 1)) | 0];
    const cut = (rng() * H) | 0;
    const da = new Int8Array(H);
    const dp = new Int8Array(H);
    for (let t = 0; t < H; t++) {
      const src = t < cut ? p1 : p2;
      da[t] = src.da[t];
      dp[t] = src.dp[t];
      if (rng() < MUT) {
        const [a, p] = randGene();
        da[t] = a;
        dp[t] = p;
      }
    }
    if (rng() < BLOCK_MUT) {
      const i = (rng() * H) | 0;
      const j = Math.min(H - 1, i + 1 + ((rng() * 30) | 0));
      const [a, p] = randGene();
      for (let t = i; t <= j; t++) {
        da[t] = a;
        dp[t] = p;
      }
    }
    next.push({ da, dp, fit: -Infinity });
  }
  while (next.length < POP) next.push(randGenome());
  pop = next;
  const cur = internal!;
  for (const g of pop) if (g.fit === -Infinity) g.fit = evalGenome(cur, g.da, g.dp);
};

// ---- game loop ----
for (;;) {
  const line = readline();
  if (!line) break;
  const [X, Y, hs, vs, fuel, rotate, power] = line.split(" ").map(Number);
  const start = Date.now();

  if (turn === 0) {
    internal = { x: X, y: Y, vx: hs, vy: vs, fuel, angle: rotate, power };
    pop = [seedGenome(internal)];
    for (let i = 1; i < POP; i++) pop.push(randGenome());
  } else {
    const dx = Math.abs(Math.round(internal!.x) - X);
    const dy = Math.abs(Math.round(internal!.y) - Y);
    if (dx > 1 || dy > 1) {
      console.error(`DESYNC t${turn} pred=${Math.round(internal!.x)},${Math.round(internal!.y)} got=${X},${Y}`);
      internal = { x: X, y: Y, vx: hs, vy: vs, fuel, angle: rotate, power };
      for (const g of pop) g.fit = -Infinity;
    }
  }

  // evaluate genomes invalidated by last turn's shift (inside the budget)
  for (const g of pop) if (g.fit === -Infinity) g.fit = evalGenome(internal!, g.da, g.dp);
  while (Date.now() - start < TIME_MS) evolveOnce();

  pop.sort((a, b) => b.fit - a.fit);
  const best = pop[0];
  const [reqA, reqP] = decode(internal!, best.da[0], best.dp[0]);
  console.log(`${reqA} ${reqP}`);
  // post-output bookkeeping is O(POP*H) copies only — no evals
  internal = step(internal!, reqA, reqP);
  for (const g of pop) {
    g.da.copyWithin(0, 1);
    g.dp.copyWithin(0, 1);
    const [a, p] = randGene();
    g.da[H - 1] = a;
    g.dp[H - 1] = p;
    g.fit = -Infinity;
  }
  turn++;
}
