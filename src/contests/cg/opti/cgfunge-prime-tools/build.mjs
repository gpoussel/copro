// CGFunge Prime layout builder: randomized placement of the unrolled trial-division
// main path + Dijkstra routing of every exit to shared printers, scored with a faithful
// port of the referee's interpreter (eulerscheZahl/CGFunge-Prime, Interpreter.java).
//
// usage: node build.mjs [attempts] [seed]   -> prints best grid + score, writes out/best.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const VALIDATORS = [1, 2, 3, 4, 5, 7, 8, 9, 11, 13, 17, 19, 23, 25, 29, 31, 37, 41, 43, 47, 49, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 121, 129, 169, 179, 187, 219, 221, 235, 289, 361, 377, 391, 529, 797, 841, 923, 961, 1003, 1363, 1369, 1627, 1681, 1763, 1829, 1849, 2209, 2339, 2393, 2689, 2729, 2809, 2963, 3271, 3481, 3499, 3599, 3721, 3739, 4201, 4399, 4447, 4489, 5041, 5183, 5329, 5429, 5569, 5609, 5963, 6241, 6421, 6427, 6889, 7369, 7559, 7789, 7829, 7921, 8167, 8190, 8191, 8219, 8387, 8867, 9283, 9409, 9613, 9623, 9991];

const W = 40, H = 30;
export const FAIL = {};
const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1]; // R D L U (referee order)
const ARROW = ">v<^";
const Q = '"';
const ch = (n) => String.fromCharCode(n);

// ---------- interpreter (referee port) ----------
export function run(lines, n, maxTurns = 3000) {
  const h = lines.length, w = Math.max(...lines.map((l) => l.length));
  const g = lines.map((l) => l.padEnd(w, " "));
  const st = [n];
  let x = 0, y = 0, d = 0, quoted = false, skip = false, out = "";
  for (let turn = 1; turn < maxTurns; turn++) {
    let fin = false;
    if (skip) skip = false;
    else {
      const c = g[y][x];
      if (c === Q) quoted = !quoted;
      else if (quoted) st.push(c.charCodeAt(0));
      else if (c === "+") st.push(st.pop() + st.pop());
      else if (c === "-") { const a = st.pop(), b = st.pop(); st.push(b - a); }
      else if (c === "*") st.push(Math.imul(st.pop(), st.pop()));
      else if (c === "/") { const a = st.pop(), b = st.pop(); if (a === 0) return { err: "div0" }; st.push(Math.trunc(b / a)); }
      else if (c >= "0" && c <= "9") st.push(c.charCodeAt(0) - 48);
      else if (c === "I") out += st.pop();
      else if (c === "C") out += ch(st.pop());
      else if (c === ">") d = 0; else if (c === "v") d = 1; else if (c === "<") d = 2; else if (c === "^") d = 3;
      else if (c === ":") { const v = st.pop(); if (v < 0) d = (d + 3) % 4; if (v > 0) d = (d + 1) % 4; }
      else if (c === "P") st.pop();
      else if (c === "D") st.push(st[st.length - 1]);
      else if (c === "X") { const i = st.pop(); const v = st.splice(st.length - 1 - i, 1)[0]; st.push(v); }
      else if (c === "S") skip = true;
      else if (c === "E") fin = true;
      if (st.some((v) => v === undefined)) return { err: "stack" };
    }
    x += DX[d]; y += DY[d];
    if (x < 0 || y < 0 || x >= w || y >= h) return { err: "oob" };
    if (fin) return { out, steps: turn };
  }
  return { err: "timeout" };
}
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };

let seed = 12345;
const rnd = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296);

// ---------- layout: vertical zig-zag ----------
// Every block is vertical. A down column ends with ':' that must turn EAST on "continue"
// (negative value), an up column must turn EAST on "continue" (positive value). The stack
// holds +N or -N (sign flipped with "01X-"): the plain test "DD p/p*-:" yields -(N mod p) with
// -N and +(N mod p) with +N; the variant "DD p/p*1X-:" yields the opposite sign.
// Cutoff "N < c -> PRIME": plain "D c/:" (N/c), variant "D0 c-/:" (N/(-c)).
const PRIMES = []; for (let p = 2; p < 100; p++) if (isPrime(p)) PRIMES.push(p);
function pushNum(p) { // cells pushing p (avoid CR/LF/quote chars)
  if (p < 10) return String(p);
  if (p === 13) return "94+";
  return Q + ch(p) + Q;
}
const NOT_STR = Q + "EMIRP TON" + Q + "CCCCCCCCCE";
const PRIME_STR = Q + "EMIRP" + Q + "CCCCCE";

function attempt(opts) {
  const g = Array.from({ length: H }, () => Array(W).fill(null));
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const free = (x, y) => inb(x, y) && g[y][x] === null;
  function placePrinter(type, x, y, d, str) {
    const cells = [ARROW[d], ...str, " "];
    const n = cells.length;
    for (let i = 0; i < n; i++) if (!free(x + DX[d] * i, y + DY[d] * i)) return false;
    for (let i = 0; i < n; i++) g[y + DY[d] * i][x + DX[d] * i] = { c: cells[i], t: "printer", r: type, dir: d, rem: n - 1 - i, entry: i === 0 };
    return true;
  }
  for (const p of opts.printers) if (!placePrinter(p.type, p.x, p.y, p.d, p.type === "not" ? NOT_STR : PRIME_STR)) return null;
  const setMain = (cx, cy, c) => { if (!free(cx, cy)) throw new Error("collision at " + cx + "," + cy); g[cy][cx] = { c, t: "main" }; };
  const exits = [];
  // block list
  const bl = [{ kind: "c4" }];
  for (const p of PRIMES) {
    if (opts.cuts.has(p)) bl.push({ kind: "prime", c: p * p });
    bl.push({ kind: "not", p });
  }
  let sgn = 1;
  let x = 0, y = 0;
  setMain(0, 0, "v");
  for (let i = 1; i <= opts.topPad; i++) setMain(0, i, " ");
  y = opts.topPad; // arrow row of the first column is (0, y) (virtual)
  try {
    for (let bi = 0; bi < bl.length; bi++) {
      const b = bl[bi];
      const down = bi % 2 === 0;
      const bodyOf = (b, sgn) => {
        const plain = down ? sgn < 0 : sgn > 0;
        if (b.kind === "c4") return "D04-/:";
        if (b.kind === "prime") return plain ? "D" + pushNum(b.c) + "/:" : "D0" + pushNum(b.c) + "-/:";
        return "DD" + pushNum(b.p) + "/" + pushNum(b.p) + "*" + (plain ? "" : "1X") + "-:";
      };
      let pre = "";
      if (bi > 0 && opts.flipAt.has(bi)) { pre = "01X-"; sgn = -sgn; }
      const body = bodyOf(b, sgn);
      // pad so that the NEXT block (opposite direction) fits in [minTop, maxY]
      let pad = 0;
      if (bi + 1 < bl.length) {
        const nsgn = opts.flipAt.has(bi + 1) ? -sgn : sgn;
        const plainN = !down ? nsgn < 0 : nsgn > 0; // next block direction is !down
        const nb = bl[bi + 1];
        const nlen = (opts.flipAt.has(bi + 1) ? 4 : 0) + (nb.kind === "prime" ? (plainN ? 2 + pushNum(nb.c).length : 4 + pushNum(nb.c).length) : 6 + 2 * pushNum(nb.p).length + (plainN ? 0 : 2));
        const end = y + (down ? 1 : -1) * (pre.length + body.length);
        if (down) pad = Math.max(0, opts.minTop + nlen - end);
        else pad = Math.max(0, end + nlen - opts.maxY);
      }
      pre = " ".repeat(pad) + pre;
      const cells = pre + body;
      const dy = down ? 1 : -1;
      if (bi > 0) setMain(x, y, down ? "v" : "^");
      for (const c of cells) { y += dy; setMain(x, y, c); }
      const ex = x, ey = y + dy;
      if (!free(ex, ey)) return null;
      g[ey][ex] = { c: " ", t: "res" };
      exits.push({ x: ex, y: ey, d: down ? 1 : 3, kind: b.kind, bi });
      if (b.kind === "c4") {
        // prefix "11X-:" below: 1-N, 0 -> NOT (straight), negative -> east -> PRIME
        g[ey][ex] = null;
        let cy = y;
        for (const c of "11X-:") { cy += 1; setMain(x, cy, c); }
        exits.pop();
        for (const [xx, yy, dd, kk] of [[x, cy + 1, 1, "not"], [x + 1, cy, 0, "prime"]]) {
          if (!free(xx, yy)) return null;
          g[yy][xx] = { c: " ", t: "res" };
          exits.push({ x: xx, y: yy, d: dd, kind: kk, bi: -1 });
        }
      }
      x += 1;
      if (y < 1 || y > opts.maxY) return null;
    }
  } catch (e) { FAIL.coll = (FAIL.coll || 0) + 1; if (process.env.DBG) { console.error(e.message); console.error(toLines(g).join("\n")); } return null; }
  // continuation after the last block -> PRIME
  if (!free(x, y)) return null;
  g[y][x] = { c: " ", t: "res" };
  exits.push({ x, y, d: 0, kind: "prime", bi: bl.length });
  const order = exits.map((e, i) => i).sort((a, b) => opts.weight(exits[b]) - opts.weight(exits[a]));
  for (const i of order) {
    const e = exits[i];
    g[e.y][e.x] = null;
    const r = route(g, e, e.kind);
    if (!r) { FAIL.route = (FAIL.route || 0) + 1; if (process.env.DBG) { console.error("route fail", JSON.stringify(e)); console.error(toLines(g).map((l) => l.replace(/[^\x20-\x7e]/g, "#")).join("\n")); } return null; }
  }
  return g;
}

// Dijkstra: state = entering cell (x,y) moving dir d. Cell (x,y) must be placeable.
function route(g, e, type) {
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const N = W * H * 4;
  const dist = new Float64Array(N).fill(Infinity);
  const prev = new Int32Array(N).fill(-1);
  const how = new Array(N); // how we placed the previous cell: char
  const key = (x, y, d) => ((y * W + x) << 2) | d;
  // simple binary heap
  const heap = [];
  const push = (k, dd) => { heap.push([dd, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0]; const last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  const k0 = key(e.x, e.y, e.d);
  dist[k0] = 0; push(k0, 0);
  let bestEnd = null, bestCost = Infinity;
  // a "free" cell for this route: null
  const passable = (x, y) => inb(x, y) && g[y][x] === null;
  // can we terminate by entering cell (x,y) moving d? returns extra cost to end
  const joinCost = (x, y, d) => {
    if (!inb(x, y)) return null;
    const c = g[y][x];
    if (!c || c.r !== type) return null;
    if (c.t === "printer") return c.entry ? c.rem + 1 : null;
    if (c.t !== "route") return null;
    if (c.c === "S" || c.skipTarget) return null;
    if (c.c === " " && c.dir !== d && c.shared) return null;
    return c.rem + 1;
  };
  while (heap.length) {
    const [dd, k] = pop();
    if (dd > dist[k]) continue;
    if (dd >= bestCost) break;
    const cell = k >> 2, d = k & 3, x = cell % W, y = (cell / W) | 0;
    // at (x,y) (free), choose char: keep d (" "), turn (arrow), or S (skip next)
    for (const nd of [d, (d + 1) % 4, (d + 3) % 4]) {
      const c = nd === d ? " " : ARROW[nd];
      const nx = x + DX[nd], ny = y + DY[nd];
      const jc = joinCost(nx, ny, nd);
      if (jc !== null) { const tot = dd + 1 + jc; if (tot < bestCost) { bestCost = tot; bestEnd = { k, c, nx, ny, nd }; } }
      if (passable(nx, ny)) {
        const nk = key(nx, ny, nd); const nd2 = dd + 1;
        if (nd2 < dist[nk]) { dist[nk] = nd2; prev[nk] = k; how[nk] = c; push(nk, nd2); }
      }
      // pass straight through another route's space cell
      if (nd === d && inb(nx, ny) && g[ny][nx] && g[ny][nx].t === "route" && g[ny][nx].c === " " && (g[ny][nx].dir === nd || g[ny][nx].dir === (nd + 2) % 4 || true) && g[ny][nx].r !== type) {
        // crossing perpendicular/along a foreign space: allowed only if we don't change it; lands at next cell
        const mx = nx + DX[nd], my = ny + DY[nd];
        if (passable(mx, my)) { const nk = key(mx, my, nd); const nd2 = dd + 2; if (nd2 < dist[nk]) { dist[nk] = nd2; prev[nk] = k; how[nk] = "X" + c; push(nk, nd2); } }
      }
    }
    // S skip: cell (x,y) = S, skip next (any occupied cell), land on next-next
    {
      const nx = x + DX[d], ny = y + DY[d], mx = nx + DX[d], my = ny + DY[d];
      if (inb(nx, ny) && g[ny][nx] !== null && passable(mx, my)) {
        const nk = key(mx, my, d); const nd2 = dd + 2;
        if (nd2 < dist[nk]) { dist[nk] = nd2; prev[nk] = k; how[nk] = "S"; push(nk, nd2); }
      }
    }
  }
  if (!bestEnd) return null;
  // reconstruct: list of (x,y,char,dir) for placed cells
  const placed = [];
  placed.push({ k: bestEnd.k, c: bestEnd.c, dir: bestEnd.nd });
  let k = bestEnd.k;
  while (k !== k0) {
    const pk = prev[k]; const h = how[k];
    const pd = h === "S" ? (k & 3) : h[0] === "X" ? (k & 3) : (k & 3);
    placed.push({ k: pk, c: h === "S" ? "S" : h[0] === "X" ? h.slice(1) : h, dir: k & 3, cross: h[0] === "X" ? true : false, skipOver: h === "S" });
    k = pk;
  }
  placed.reverse();
  // rem: steps from each placed cell to E
  let rem = bestCost;
  // assign; compute remaining along path
  let acc = 0; const seq = [];
  for (const p of placed) { const cell = p.k >> 2; seq.push({ x: cell % W, y: (cell / W) | 0, ...p }); }
  // costs: each placed cell 1 step, cross adds 1, S adds 1
  const stepsAfter = []; let s = 0;
  for (let i = seq.length - 1; i >= 0; i--) { stepsAfter[i] = s; s += 1; if (i + 1 < seq.length && (seq[i + 1].cross || seq[i + 1].skipOver)) {} }
  // simpler: recompute rem by walking forward: rem(i) = bestCost - distTo(i)
  for (const p of seq) {
    const dd = p.k === k0 ? 0 : dist[p.k];
    g[p.y][p.x] = { c: p.c, t: "route", r: type, dir: p.dir, rem: bestCost - dd - 1 };
    if (p.cross) { // mark crossed foreign cell as shared
      const bx = p.x + DX[p.dir], by = p.y + DY[p.dir];
      if (g[by]?.[bx]) g[by][bx].shared = true;
    }
  }
  // fix join cell
  const j = g[bestEnd.ny][bestEnd.nx];
  if (j.t === "route" && j.c === " " && j.dir !== bestEnd.nd) j.c = ARROW[j.dir];
  if (j.t === "route") j.shared = true;
  return bestCost;
}

export function toLines(g) {
  return g.map((row) => row.map((c) => (c ? c.c : " ")).join(""));
}

function score(lines, list) {
  let tot = 0;
  for (const n of list) {
    const r = run(lines, n);
    if (r.err || r.out !== (isPrime(n) ? "PRIME" : "NOT PRIME")) return { bad: n, r };
    tot += r.steps; // referee Points = turn-1, turn 1 = reading code
  }
  return { tot };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const attempts = +(process.argv[2] || 200);
  seed = +(process.argv[3] || 1);
  let best = null;
  const baseCuts = [5, 11];
  const optCuts = [67, 89, 97, 17, 23, 31, 41, 53];
  for (let a = 0; a < attempts; a++) {
    const cuts = new Set(baseCuts);
    for (const c of optCuts) if (rnd() < 0.4) cuts.add(c);
    const flipAt = new Set();
    for (let i = 2; i < 34; i++) if (rnd() < 0.12) flipAt.add(i);
    const cfg = {
      printers: [{ type: "not", x: 0, y: 29, d: 0 }, { type: "prime", x: 39, y: 29, d: 2 }],
      topPad: 1 + Math.floor(rnd() * 4), maxY: 20 + Math.floor(rnd() * 5), minTop: 2 + Math.floor(rnd() * 3), cuts, flipAt,
      weight: (e) => (e.bi < 0 ? 3 : 100 - e.bi * 3),
    };
    const g = attempt(cfg);
    if (!g) continue;
    const lines = toLines(g);
    const s = score(lines, VALIDATORS);
    if (s.bad !== undefined) { console.error("BAD", s.bad, s.r); console.error(lines.join("\n")); process.exit(1); }
    if (!best || s.tot < best.tot) { best = { tot: s.tot, lines, cuts: [...cuts], flips: [...flipAt] }; console.error(a, s.tot); }
  }
  if (!best) { console.log("no layout", FAIL); process.exit(1); }
  for (let n = 1; n <= 10000; n++) {
    const r = run(best.lines, n);
    if (r.err || r.out !== (isPrime(n) ? "PRIME" : "NOT PRIME")) { console.log("FAIL", n, r); process.exit(1); }
  }
  console.log(best.tot, JSON.stringify({ cuts: best.cuts, flips: best.flips }));
  console.log(best.lines.map((l) => l.replace(/[^\x20-\x7e]/g, "#")).join("\n"));
  fs.mkdirSync(path.join(here, "out"), { recursive: true });
  fs.writeFileSync(path.join(here, "out/best.json"), JSON.stringify(best));
}
