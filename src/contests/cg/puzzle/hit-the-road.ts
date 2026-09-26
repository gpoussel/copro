// 🎮 CodinGame Puzzle - hit-the-road
// https://www.codingame.com/training/hard/hit-the-road

// Search over (junction, arrival time) states. Windows end by time 50, so
// every time beyond LATE behaves the same (windowed junctions are closed
// forever) and is clamped to LATE, which keeps the state space tiny.
const [n, m, ntw] = readline().split(" ").map(Number)
const [s, t] = readline().split(" ").map(Number)
const win: [number, number][] = Array.from({ length: n }, (): [number, number] => [0, Infinity])
for (let i = 0; i < ntw; i++) {
  const [v, b, e] = readline().split(" ").map(Number)
  win[v] = [b, e]
}
const adj: [number, number][][] = Array.from({ length: n }, () => [])
for (let i = 0; i < m; i++) {
  const [u, v, d] = readline().split(" ").map(Number)
  adj[u].push([v, d])
}

const LATE = 51
const ok = (v: number, time: number): boolean => time >= win[v][0] && time <= win[v][1]
const seen = new Set<number>()
const stack: [number, number][] = []
let found = false
if (ok(s, 0)) {
  stack.push([s, 0])
  seen.add(s * 100)
}
while (stack.length && !found) {
  const [u, time] = stack.pop() as [number, number]
  if (u === t) found = true
  for (const [v, d] of adj[u]) {
    const nt = Math.min(LATE, time + d)
    if (!ok(v, nt) || seen.has(v * 100 + nt)) continue
    seen.add(v * 100 + nt)
    stack.push([v, nt])
  }
}
console.log(found ? "true" : "false")
