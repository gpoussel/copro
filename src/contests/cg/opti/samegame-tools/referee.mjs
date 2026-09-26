// Offline referee: plays samegame.ts (as a child process) on the visible tests.
// Usage: node referee.mjs [testIdx,...]   env SG_BUDGET=<ms> for turn-1 budget.
import { spawn } from "child_process";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
const dir = path.dirname(fileURLToPath(import.meta.url));
const tests = JSON.parse(readFileSync(path.join(dir, "tests.json"), "utf8"));
const N = 15;
function parse(t) {
  const rows = t.trim().split("\n").map((l) => l.trim().split(/\s+/).map(Number));
  const b = [];
  for (let x = 0; x < N; x++) { b.push([]); for (let y = 0; y < N; y++) b[x].push(rows[N - 1 - y][x]); }
  return b;
}
function render(b) {
  const out = [];
  for (let y = N - 1; y >= 0; y--) { const r = []; for (let x = 0; x < N; x++) r.push(b[x][y]); out.push(r.join(" ")); }
  return out.join("\n") + "\n";
}
function move(b, x, y) {
  const c = b[x]?.[y];
  if (c === undefined || c < 0) return -1;
  const st = [[x, y]]; const seen = new Set([x * N + y]); const cells = [];
  while (st.length) { const [a, d] = st.pop(); cells.push([a, d]);
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = a + dx, ny = d + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; if (b[nx][ny] !== c || seen.has(nx * N + ny)) continue;
      seen.add(nx * N + ny); st.push([nx, ny]); } }
  if (cells.length < 2) return -1;
  for (const [a, d] of cells) b[a][d] = -1;
  const cols = [];
  for (let i = 0; i < N; i++) { const col = b[i].filter((v) => v >= 0); if (col.length) cols.push(col); }
  for (let i = 0; i < N; i++) { const col = cols[i] || []; for (let j = 0; j < N; j++) b[i][j] = j < col.length ? col[j] : -1; }
  return (cells.length - 2) ** 2;
}
function hasMove(b) { for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) { const c = b[x][y]; if (c < 0) continue;
  if ((x + 1 < N && b[x + 1][y] === c) || (y + 1 < N && b[x][y + 1] === c)) return true; } return false; }
async function play(idx) {
  const b = parse(tests[idx - 1].testIn);
  const p = spawn("node", ["--no-warnings", "-r", path.join(dir, "readline-preload.cjs"), path.join(dir, "..", "samegame.ts")], { stdio: ["pipe", "pipe", "pipe"] });
  let err = ""; p.stderr.on("data", (d) => (err += d));
  let obuf = ""; const lines = []; let waiter = null;
  p.stdout.on("data", (d) => { obuf += d; let k; while ((k = obuf.indexOf("\n")) >= 0) { lines.push(obuf.slice(0, k)); obuf = obuf.slice(k + 1); } if (waiter && lines.length) { const w = waiter; waiter = null; w(); } });
  const next = () => new Promise((r) => { if (lines.length) r(); else waiter = r; });
  let score = 0; let turn = 0; let maxT = 0; let firstT = 0;
  while (hasMove(b)) {
    const t = Date.now(); p.stdin.write(render(b)); await next(); const dt = Date.now() - t;
    if (turn === 0) firstT = dt; else maxT = Math.max(maxT, dt);
    const [x, y] = lines.shift().split(" ").map(Number);
    const s = move(b, x, y); if (s < 0) { console.log(`test ${idx}: ILLEGAL move ${x} ${y}`); score = 0; break; }
    score += s; turn++;
  }
  if (b[0][0] < 0) score += 1000;
  p.kill();
  console.log(`test ${idx}: ${score}  (turns ${turn}, t1 ${firstT}ms, max ${maxT}ms) ${err.split("\n")[0]}`);
  return score;
}
const which = process.argv[2] ? process.argv[2].split(",").map(Number) : tests.map((_, i) => i + 1);
let tot = 0; for (const i of which) tot += await play(i);
console.log("TOTAL", tot);
