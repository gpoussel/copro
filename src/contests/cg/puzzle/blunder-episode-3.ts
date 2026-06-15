// 🎮 CodinGame Puzzle - blunder-episode-3
// https://www.codingame.com/training/hard/blunder-episode-3

const N: number = parseInt(readline(), 10)
const ns: number[] = []
const ts: number[] = []
for (let i = 0; i < N; i++) {
  const [a, b] = readline()
    .split(/\s+/)
    .map(x => parseInt(x, 10))
  ns.push(a)
  ts.push(b)
}

type Basis = ((n: number) => number) | "const" | "exp"

const candidates: Array<{ name: string; f: Basis }> = [
  { name: "O(1)", f: "const" },
  { name: "O(log n)", f: n => Math.log(n) },
  { name: "O(n)", f: n => n },
  { name: "O(n log n)", f: n => n * Math.log(n) },
  { name: "O(n^2)", f: n => n * n },
  { name: "O(n^2 log n)", f: n => n * n * Math.log(n) },
  { name: "O(n^3)", f: n => n * n * n },
  { name: "O(2^n)", f: "exp" },
]

// For each candidate basis f(n), fit t = a*f(n) + b (least squares with intercept)
// and score by R^2. The candidate whose basis best explains the measured times
// (highest R^2) is the most probable complexity. O(1) is scored by flatness
// (1 - coefficient of variation); O(2^n) uses a log-normalized basis to avoid
// numeric overflow.

const my = ts.reduce((s, t) => s + t, 0) / N
let syy = 0
for (const t of ts) syy += (t - my) * (t - my)

let best = ""
let bestScore = -Infinity

for (const c of candidates) {
  let r2: number
  if (c.f === "const") {
    const cv = Math.sqrt(syy / N) / my
    r2 = 1 - cv
  } else {
    let x: number[]
    if (c.f === "exp") {
      const lmax = ns[N - 1] * Math.LN2
      x = ns.map(n => Math.exp(n * Math.LN2 - lmax))
    } else {
      const fn = c.f
      x = ns.map(n => fn(n))
    }
    const mx = x.reduce((s, v) => s + v, 0) / N
    let sxy = 0
    let sxx = 0
    for (let i = 0; i < N; i++) {
      sxy += (x[i] - mx) * (ts[i] - my)
      sxx += (x[i] - mx) * (x[i] - mx)
    }
    r2 = (sxy * sxy) / (sxx * syy)
    if (!isFinite(r2)) r2 = -Infinity
  }
  if (r2 > bestScore) {
    bestScore = r2
    best = c.name
  }
}

console.log(best)
