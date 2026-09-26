// Offline referee for block-the-spreading-fire (port of the rules, calibrated with a
// run_puzzle_tests probe: cut applied before propagation; burning cells +1; a cell
// reaching fireDuration ignites its -1 neighbours at 0 (chained when D=0)).
// Usage: node referee.mjs [testIdx,...]   env BF_BUDGET=<ms> for the turn-1 budget.
import { spawn } from "child_process";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
const dir = path.dirname(fileURLToPath(import.meta.url));
const tests = JSON.parse(readFileSync(path.join(dir, "tests.json"), "utf8"));
const solver = process.env.BF_SOLVER || path.join(dir, "..", "block-the-spreading-fire.ts");

async function play(idx) {
  const text = tests[idx - 1];
  const L = text.split("\n");
  const nums = (l) => l.trim().split(/\s+/).map(Number);
  const tree = nums(L[0]), house = nums(L[1]), [w, h] = nums(L[2]), fs = nums(L[3]);
  const params = [[0, 0, 0], tree, house];
  const kind = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const ch = L[4 + y][x]; kind.push(ch === "." ? 1 : ch === "X" ? 2 : 0); }
  const prog = kind.map((k) => (k === 0 ? -2 : -1));
  const fd = (c) => params[kind[c]][1];
  prog[fs[1] * w + fs[0]] = 0;
  const p = spawn("node", ["--no-warnings", "-r", path.join(dir, "readline-preload.cjs"), solver], { stdio: ["pipe", "pipe", "pipe"] });
  let err = ""; p.stderr.on("data", (d) => (err += d));
  let obuf = ""; const lines = []; let waiter = null;
  p.stdout.on("data", (d) => { obuf += d; let k; while ((k = obuf.indexOf("\n")) >= 0) { lines.push(obuf.slice(0, k)); obuf = obuf.slice(k + 1); } if (waiter && lines.length) { const wt = waiter; waiter = null; wt(); } });
  const next = () => new Promise((r) => { if (lines.length) r(); else waiter = r; });
  p.stdin.write(L.slice(0, 4 + h).join("\n") + "\n");
  let cooldown = 0, alive = true, turn = 0, firstT = 0, maxT = 0;
  for (;;) {
    let burning = false;
    for (let c = 0; c < w * h; c++) if (prog[c] >= 0 && prog[c] < fd(c)) { burning = true; break; }
    if (!burning) break;
    if (alive) {
      let s = cooldown + "\n";
      for (let y = 0; y < h; y++) s += prog.slice(y * w, y * w + w).join(" ") + "\n";
      const t0 = Date.now(); p.stdin.write(s); await next(); const dt = Date.now() - t0;
      if (turn === 0) firstT = dt; else maxT = Math.max(maxT, dt);
      const out = lines.shift().trim();
      if (out !== "WAIT") {
        const [x, y] = out.split(/\s+/).map(Number); const c = y * w + x;
        if (cooldown > 0 || prog[c] !== -1) { console.log(`test ${idx}: INVALID '${out}' turn ${turn} cd ${cooldown} prog ${prog[c]}`); alive = false; }
        else { prog[c] = -2; kind[c] = kind[c] + 10; cooldown = params[kind[c] - 10][0]; }
      }
    }
    const st = [];
    for (let c = 0; c < w * h; c++) { const k = kind[c]; if (k === 0 || k >= 10) continue; if (prog[c] >= 0 && prog[c] < fd(c)) { prog[c]++; if (prog[c] === fd(c)) st.push(c); } }
    while (st.length) { const c = st.pop(); for (const n of [c - 1, c + 1, c - w, c + w]) if (prog[n] === -1) { prog[n] = 0; if (fd(n) === 0) st.push(n); } }
    cooldown = Math.max(0, cooldown - 1); turn++;
  }
  p.kill();
  let score = 0;
  for (let c = 0; c < w * h; c++) if (kind[c] > 0 && kind[c] < 10 && prog[c] === -1) score += params[kind[c]][2];
  const info = err.split("\n").filter(l=>/PLAN|SKIP/.test(l)).join(" ");
  console.log(`test ${idx}: ${score}  turns ${turn} first ${firstT}ms max ${maxT}ms ${info}`);
  return score;
}
const idxs = process.argv[2] ? process.argv[2].split(",").map(Number) : [1, 2, 3, 4, 5, 6, 7, 8];
let tot = 0;
for (const i of idxs) tot += await play(i);
console.log("TOTAL", tot);
