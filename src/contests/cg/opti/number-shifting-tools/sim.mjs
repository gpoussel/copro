// Offline referee: plays the solver (number-shifting.ts) through consecutive
// levels exactly like the CG referee (one move per turn, 600 turns max).
// Usage: node sim.mjs [startLevel] [seedCsv]
import { writeFileSync } from "node:fs";
import { createMap, TEST_SEED } from "./gen.mjs";
const start = Number(process.argv[2] ?? 0);
const csv = process.argv[3] ?? TEST_SEED;
const origLog = console.log;
let level = start, grid, W, H, queue = [], turns = 0, t0 = 0, mapText = '', moves = [];
const dump = {};
const dx = { D: 0, R: 1, U: 0, L: -1 }, dy = { D: 1, R: 0, U: -1, L: 0 };
function load() {
  const m = createMap(level, csv);
  W = m.width; H = m.height;
  grid = m.lines.slice(1).map((l) => l.split(" ").map(Number));
  queue = m.lines.slice();
  mapText = m.lines.join('\n');
  moves = [];
}
function finish(msg) {
  if (process.env.NS_DUMP) writeFileSync(process.env.NS_DUMP, JSON.stringify(dump, null, 1)); origLog(`END level reached score=${level} turns=${turns} (${msg})`); process.exit(0); }
let first = true;
globalThis.readline = () => {
  if (first) { first = false; load(); }
  if (!queue.length) finish("solver read without map");
  t0 = Date.now();
  return queue.shift();
};

console.log = (s) => {
  if (s === "first_level" || /^[a-z]{32}$/.test(s)) return;
  turns++;
  if (turns > 600) finish("600 turns");
  const [x, y, d, op] = s.split(" ");
  const v = grid[+y]?.[+x];
  const x2 = +x + dx[d] * v, y2 = +y + dy[d] * v;
  if (!v || x2 < 0 || y2 < 0 || x2 >= W || y2 >= H || !grid[y2][x2]) finish(`invalid move ${s} at level ${level}`);
  grid[y2][x2] = Math.abs(op === "+" ? grid[y2][x2] + v : grid[y2][x2] - v);
  grid[+y][+x] = 0;
  moves.push(s);
  if (grid.every((r) => r.every((c) => !c))) { dump[level] = { map: mapText, moves: moves.slice() }; origLog(`solved level ${level} (${W}x${H}) solve+print ${Date.now() - t0}ms turns=${turns}`); level++; load(); }
};
await import("../number-shifting.ts");
finish("program exited");
