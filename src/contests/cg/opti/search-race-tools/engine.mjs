// Faithful port of the Search Race referee (github.com/Illedan/CGSearchRace).
// Sources: Car.java / Unit.java / Game.java / Utility.java / Constants.java.
// The whole car state is integer after each turn (positions/speeds truncated,
// angle rounded to whole degrees), so a state is exactly {x,y,vx,vy,ang,idx}.
//
// Turn order (Game.onRound):
//   1. handleInput: rotate (EXPERT: angle += rot verbatim; X Y: clamp ±18° toward
//      target, no-op if target == position), then vx += cos*thrust, vy += sin*thrust.
//   2. checkCollisions: repeated swept-circle test against the next checkpoint
//      (radius 600, instant hit if already inside), advancing partial time t;
//      then move(1 - t).
//   3. adjust: truncate x/y, vx/vy *= 0.85 then truncate, angle rounded to whole
//      degrees and normalized into [0, 360] (360 included, referee keeps 2π).
//   4. if (!done) timer++; timer == 600 && !done => lose (score 1000).
// Score on finish = round2(timer + colTime of the final collision) — the
// finishing turn does NOT increment the timer. Lower is better.

export const CP_RADIUS = 600;
export const MAX_ROT = 18; // degrees per turn
export const MAX_THRUST = 200;
const DEG2RAD = Math.PI / 180;

// Utility.truncate: round if within 1e-5 of an int, else trunc toward zero.
export function truncate(x) {
  const s = x < 0 ? -1 : 1;
  const r = s * Math.round(s * x);
  if (Math.abs(r - x) < 0.00001) return r;
  return x < 0 ? Math.ceil(x) : Math.floor(x);
}

export function round2(a) {
  return Math.round(a * 100) / 100;
}

// "x y;x y;..." -> [{x,y}] (the distinct checkpoints; car starts on the first).
export function parseCheckpoints(str) {
  return str
    .trim()
    .split(';')
    .map((s) => {
      const [x, y] = s.trim().split(/\s+/).map(Number);
      return { x, y };
    });
}

// The referee streams 3 laps starting at checkpoint index 1: seq[i] = cps[(i+1) % n].
// The next checkpoint to hit is always seq[st.idx].
export function makeGame(cps) {
  const n = cps.length;
  const total = n * 3;
  const cx = new Float64Array(total);
  const cy = new Float64Array(total);
  for (let i = 0; i < total; i++) {
    const c = cps[(i + 1) % n];
    cx[i] = c.x;
    cy[i] = c.y;
  }
  let ang = Math.round(Math.atan2(cps[1].y - cps[0].y, cps[1].x - cps[0].x) / DEG2RAD);
  if (ang < 0) ang += 360;
  return {
    cx,
    cy,
    n,
    total,
    timer: 0,
    st: { x: cps[0].x, y: cps[0].y, vx: 0, vy: 0, ang, idx: 0, done: false, colTime: 2.0 },
  };
}

// One EXPERT turn: rot in [-18, 18] (integer degrees), thrust in [0, 200].
// Mutates st. cx/cy/total describe the streamed checkpoint sequence.
export function stepCar(st, cx, cy, total, rot, thrust) {
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

export function stepGame(game, rot, thrust) {
  stepCar(game.st, game.cx, game.cy, game.total, rot, thrust);
  if (!game.st.done) game.timer++;
}

// Final referee score for a finished (or timed-out) game.
export function gameScore(game) {
  return game.st.done ? round2(game.timer + game.st.colTime) : 1000;
}
