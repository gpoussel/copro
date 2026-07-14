// Faithful Mars Lander referee simulator, calibrated against the real
// CodinGame runner (see validate.mjs for the captured reference trajectory).
//
// Physics per 1-second turn (all float internally, referee displays rounded):
//   angle += clamp(requestedAngle - angle, -15, 15)   (requested clamped to [-90,90])
//   power += clamp(requestedPower - power, -1, 1)     (requested clamped to [0,4])
//   if fuel == 0: power = 0 ; fuel = max(0, fuel - power)
//   ax = -sin(angle deg) * power ; ay = cos(angle deg) * power - 3.711
//   x += vx + ax/2 ; y += vy + ay/2 ; vx += ax ; vy += ay
// Collision: straight segment between successive positions vs the surface
// polyline. Safe landing: hit the flat segment with angle == 0, |vx| <= 20,
// |vy| <= 40. Lost: leaving the 7000x3000 zone.

export const G = 3.711;
export const DEG = Math.PI / 180;

export function makeTerrain(surface) {
  const segs = [];
  for (let i = 0; i + 1 < surface.length; i++) {
    const [x1, y1] = surface[i];
    const [x2, y2] = surface[i + 1];
    segs.push({ x1, y1, x2, y2, flat: y1 === y2 && x2 - x1 >= 1000 });
  }
  const flat = segs.find((s) => s.flat);
  // ground height per integer x (for guidance heuristics, not collision)
  const ground = new Float64Array(7000);
  for (const s of segs) {
    const from = Math.max(0, Math.floor(s.x1));
    const to = Math.min(6999, Math.ceil(s.x2));
    for (let x = from; x <= to; x++) {
      const t = s.x2 === s.x1 ? 0 : (x - s.x1) / (s.x2 - s.x1);
      ground[x] = s.y1 + t * (s.y2 - s.y1);
    }
  }
  return { segs, flat, ground };
}

// The real referee works on ROUNDED coordinates: a turn ending with
// round(y) == ground is still flying; the collision registers only once the
// trajectory goes strictly below the surface in rounded terms. Empirically
// (see mars-lander-tools notes in ../CLAUDE.md) that is equivalent to testing
// the float trajectory against the surface lowered by 0.5m.
export const SINK = 0.5;

// Earliest intersection of motion segment p0->p1 with the (lowered) surface.
// Returns { t, x, y, seg } or null.
export function collide(terrain, x0, y0, x1, y1) {
  const mnx = Math.min(x0, x1);
  const mxx = Math.max(x0, x1);
  let best = null;
  for (const s of terrain.segs) {
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
}

export function initialState(c) {
  return { x: c.x, y: c.y, vx: c.vx, vy: c.vy, fuel: c.fuel, angle: c.angle, power: c.power };
}

// One referee turn. Mutates nothing; returns the new state.
export function step(s, reqA, reqP) {
  let ta = reqA < -90 ? -90 : reqA > 90 ? 90 : reqA;
  let tp = reqP < 0 ? 0 : reqP > 4 ? 4 : reqP;
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
}

export const roundState = (s) => ({
  x: Math.round(s.x),
  y: Math.round(s.y),
  vx: Math.round(s.vx),
  vy: Math.round(s.vy),
  fuel: Math.round(s.fuel),
  angle: s.angle,
  power: s.power,
});

// Run a full episode. commandFn(roundedState, turn) -> [reqA, reqP].
// Returns { status: "landed"|"crashed"|"lost"|"timeout", state, turns, hit }.
export function runEpisode(c, terrain, commandFn, maxTurns = 400) {
  let s = initialState(c);
  for (let t = 0; t < maxTurns; t++) {
    const [reqA, reqP] = commandFn(roundState(s), t);
    const n = step(s, reqA, reqP);
    const hit = collide(terrain, s.x, s.y, n.x, n.y);
    if (hit) {
      // the referee judges the ROUNDED touchdown speeds (empirically verified:
      // float vy=-40.34, displayed -40, was accepted)
      const ok =
        hit.seg.flat &&
        n.angle === 0 &&
        Math.abs(Math.round(n.vx)) <= 20 &&
        Math.abs(Math.round(n.vy)) <= 40;
      return { status: ok ? "landed" : "crashed", state: n, turns: t + 1, hit };
    }
    if (n.y > 3000 || n.x < 0 || n.x >= 7000) return { status: "lost", state: n, turns: t + 1, hit: null };
    s = n;
  }
  return { status: "timeout", state: s, turns: maxTurns, hit: null };
}
