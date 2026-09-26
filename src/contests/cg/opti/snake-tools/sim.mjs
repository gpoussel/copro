// Offline referee for the Snake optim puzzle (score formula from the author's
// forum post). Usage: node sim.mjs [nGames] [seed0]  (env SN_* forwarded to bot)
// Runs visible tests 1,2 (static) + random 50/60/70 games.
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const W = 96, H = 54;
const T1 = "44 37 16 4 80 6 7 35 35 52 94 28 37 6 43 43 31 13 9 49 71 25 21 8 87 40 27 0 5 7 25 16 58 12 12 39 50 35 26 5 47 15 59 2 57 1 68 50 86 36 49 15 66 17 15 32 43 0 3 8 12 50 26 43 36 46 79 35 18 34 18 7 80 18 59 36 40 18 75 20 23 38 26 44 61 39 3 43 30 17 40 27 57 28 3 12 2 48 43 53";
const T2 = "38 35 79 2 8 0 49 23 65 52 37 43 72 33 86 11 36 42 63 17 79 38 29 12 61 39 32 36 85 34 59 36 62 9 59 21 53 28 20 11 26 30 86 29 75 33 31 22 72 18 10 21 86 48 37 40 31 0 64 18 22 14 1 30 24 14 14 2 33 50 47 3 54 51 35 16 35 50 34 18 36 15 58 18 24 28 79 29 17 46 29 17 5 6 90 45 33 35 55 25 92 15 36 12 73 18 51 38 39 43 84 35 51 28 0 13 61 3 18 37";
function pairs(s) { const a = s.split(" ").map(Number); const r = []; for (let i = 0; i < a.length; i += 2) r.push([a[i], a[i + 1]]); return r; }
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function randomRabbits(n, seed) { const r = rng(seed); const o = []; for (let i = 0; i < n; i++) o.push([Math.floor(r() * W), Math.floor(r() * H)]); return o; }

function play(rabs) {
  return new Promise((resolve) => {
    const p = spawn("node", ["--no-warnings", "-r", path.join(dir, "readline-preload.cjs"), path.join(dir, "..", "snake.ts")], { stdio: ["pipe", "pipe", "inherit"] });
    let snake = [[14, 10], [13, 10], [12, 10], [11, 10], [10, 10]];
    const vis = rabs.map(() => false);
    let score = 0, combo = 0, lt = -10000, turn = 0, caught = 0, maxMs = 0, tLast = Date.now(), err = "";
    const send = () => { p.stdin.write(snake.length + "\n" + snake.map((c) => c.join(" ")).join("\n") + "\n"); tLast = Date.now(); };
    p.stdin.write(rabs.length + "\n" + rabs.map((c) => c.join(" ")).join("\n") + "\n");
    send();
    let buf = "";
    const finish = () => { p.kill(); resolve({ score, caught, turn, maxMs, err }); };
    p.stdout.on("data", (d) => {
      buf += d;
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
        const ms = Date.now() - tLast; if (turn > 0) maxMs = Math.max(maxMs, ms);
        turn++;
        const [X, Y] = line.trim().split(" ").map(Number);
        const [hx, hy] = snake[0];
        if (Math.abs(X - hx) + Math.abs(Y - hy) !== 1) { err = "bad move " + line; return finish(); }
        if (X < 0 || Y < 0 || X >= W || Y >= H) { err = "out"; return finish(); }
        let grow = false;
        for (let i = 0; i < rabs.length; i++) if (!vis[i] && rabs[i][0] === X && rabs[i][1] === Y) {
          if (turn - lt <= 2) combo++; else combo = 1;
          const add = combo > 1 ? 15000 * combo : 0;
          const pen = lt !== -10000 && turn - lt > 10 ? turn * (turn - lt) : 0;
          score += 10000 + add - pen; vis[i] = true; lt = turn; grow = true; caught++; break;
        }
        const nsn = [[X, Y], ...snake];
        if (!grow) nsn.pop();
        for (let i = 1; i < nsn.length; i++) if (nsn[i][0] === X && nsn[i][1] === Y) { err = "self"; return finish(); }
        snake = nsn;
        if (caught === rabs.length || turn >= 600) return finish();
        send();
      }
    });
  });
}
const n = +(process.argv[2] || 6), seed0 = +(process.argv[3] || 1), only = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : null;
const games = [pairs(T1), pairs(T2)];
for (let g = 0; games.length < n; g++) games.push(randomRabbits([50, 60, 70][g % 3], seed0 + g));
let tot = 0;
for (let g = 0; g < n; g++) {
  if (only && !only.includes(g)) continue;
  const r = await play(games[g]);
  tot += r.score;
  console.log(`game ${g} n=${games[g].length} score=${r.score} caught=${r.caught} turns=${r.turn} maxMs=${r.maxMs} ${r.err}`);
}
console.log("TOTAL", tot, "MEAN", Math.round(tot / n));
