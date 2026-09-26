// 🎮 CodinGame Puzzle - cgs-next-top-model
// https://www.codingame.com/training/hard/cgs-next-top-model

// Every model is linear in some of its parameters once the others are fixed:
//   LINEAR      a*x + b                      -> features (x, 1)
//   PARABOLA    a*x^2 + b*x + c              -> features (x^2, x, 1)
//   SINE        a*sin(b*x+c) + d             -> fix (b, c), features (sin, 1)
//   EXPONENTIAL a^(x+b) + c = a^b * a^x + c  -> fix a, features (a^x, 1)
// Linear parts are fitted by exact box-constrained least squares (enumerate
// the active sets, keep the best feasible KKT point). The nonlinear parameters
// are found with a grid search followed by a local pattern search.
// The model with the smallest squared error on the test set wins.
type Pt = [number, number]

const parse = (s: string): Pt[] => {
  const v = s.trim().split(/\s+/).map(Number)
  const pts: Pt[] = []
  for (let i = 0; i + 1 < v.length; i += 2) pts.push([v[i], v[i + 1]])
  return pts
}
const train = parse(readline())
const test = parse(readline())

// Solve A z = b (small dense system), null if singular
const solve = (A: number[][], b: number[]): number[] | null => {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    if (Math.abs(M[p][c]) < 1e-300) return null
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

// Minimize sum (y - theta . g)^2 with lo <= theta <= hi
const fitBox = (feats: number[][], ys: number[], lo: number[], hi: number[]): { err: number; th: number[] } => {
  const k = lo.length
  const G: number[][] = Array.from({ length: k }, () => new Array<number>(k).fill(0))
  const Gy = new Array<number>(k).fill(0)
  let yy = 0
  for (let i = 0; i < ys.length; i++) {
    const g = feats[i]
    for (let a = 0; a < k; a++) {
      Gy[a] += g[a] * ys[i]
      for (let b = 0; b < k; b++) G[a][b] += g[a] * g[b]
    }
    yy += ys[i] * ys[i]
  }
  for (let a = 0; a < k; a++) G[a][a] += 1e-12 * (G[a][a] + 1)
  const quad = (th: number[]): number => {
    let e = yy
    for (let a = 0; a < k; a++) {
      e -= 2 * th[a] * Gy[a]
      for (let b = 0; b < k; b++) e += th[a] * G[a][b] * th[b]
    }
    return e
  }
  let best = { err: Infinity, th: lo.slice() }
  const combos = 3 ** k
  for (let m = 0; m < combos; m++) {
    // state per variable: 0 free, 1 at lo, 2 at hi
    const st: number[] = []
    for (let a = 0, t = m; a < k; a++, t = Math.floor(t / 3)) st.push(t % 3)
    const th = st.map((s, a) => (s === 1 ? lo[a] : s === 2 ? hi[a] : 0))
    const free = st.map((s, a) => (s === 0 ? a : -1)).filter(a => a >= 0)
    if (free.length) {
      const A = free.map(a => free.map(b => G[a][b]))
      const rhs = free.map(a => {
        let r = Gy[a]
        for (let b = 0; b < k; b++) if (st[b] !== 0) r -= G[a][b] * th[b]
        return r
      })
      const z = solve(A, rhs)
      if (!z) continue
      let ok = true
      free.forEach((a, i) => {
        th[a] = z[i]
        if (!(z[i] >= lo[a] - 1e-9 && z[i] <= hi[a] + 1e-9)) ok = false
      })
      if (!ok) continue
    }
    const e = quad(th)
    if (e < best.err) best = { err: e, th }
  }
  return best
}

const sse = (pts: Pt[], f: (x: number) => number): number => {
  let e = 0
  for (const [x, y] of pts) e += (y - f(x)) ** 2
  return e
}
const ys = train.map(p => p[1])
const results: [string, number][] = []

// LINEAR and PARABOLA: direct box-constrained least squares
{
  const r = fitBox(
    train.map(([x]) => [x, 1]),
    ys,
    [-20, -20],
    [20, 20]
  )
  const [a, b] = r.th
  results.push(["LINEAR", sse(test, x => a * x + b)])
}
{
  const r = fitBox(
    train.map(([x]) => [x * x, x, 1]),
    ys,
    [-20, -20, -20],
    [20, 20, 20]
  )
  const [a, b, c] = r.th
  results.push(["PARABOLA", sse(test, x => a * x * x + b * x + c)])
}

// Local pattern search on a nonlinear parameter vector
const refine = (p0: number[], steps: number[], lo: number[], hi: number[], cost: (p: number[]) => number): number[] => {
  let p = p0.slice()
  let best = cost(p)
  const st = steps.slice()
  while (st.some(s => s > 1e-10)) {
    let improved = false
    for (let i = 0; i < p.length; i++) {
      for (const sg of [-1, 1]) {
        const q = p.slice()
        q[i] = Math.min(hi[i], Math.max(lo[i], q[i] + sg * st[i]))
        const e = cost(q)
        if (e < best) {
          best = e
          p = q
          improved = true
        }
      }
    }
    if (!improved) for (let i = 0; i < st.length; i++) st[i] /= 2
  }
  return p
}

// Fast exact fit of y ~ k*g + c with k in [kl, kh], c in [-20, 20]
// (convex 2D problem: interior optimum or best point on one of the 4 edges)
const xs = train.map(p => p[0])
const n = ys.length
let yy = 0
let sy = 0
for (const y of ys) {
  yy += y * y
  sy += y
}
const fit2 = (g: number[], kl: number, kh: number): { err: number; k: number; c: number } => {
  let sg = 0
  let sgg = 0
  let sgy = 0
  for (let i = 0; i < n; i++) {
    sg += g[i]
    sgg += g[i] * g[i]
    sgy += g[i] * ys[i]
  }
  const E = (k: number, c: number): number => yy - 2 * k * sgy - 2 * c * sy + k * k * sgg + 2 * k * c * sg + n * c * c
  const clamp = (v: number, l: number, h: number): number => (v < l ? l : v > h ? h : v)
  let best = { err: Infinity, k: 0, c: 0 }
  const tryKC = (k: number, c: number): void => {
    const e = E(k, c)
    if (e < best.err) best = { err: e, k, c }
  }
  const det = sgg * n - sg * sg
  if (Math.abs(det) > 1e-12 * (sgg * n + 1)) {
    const k = (sgy * n - sg * sy) / det
    const c = (sgg * sy - sg * sgy) / det
    if (k >= kl && k <= kh && c >= -20 && c <= 20) {
      tryKC(k, c)
      return best
    }
  }
  for (const k of [kl, kh]) tryKC(k, clamp((sy - k * sg) / n, -20, 20))
  if (sgg > 0) for (const c of [-20, 20]) tryKC(clamp((sgy - c * sg) / sgg, kl, kh), c)
  return best
}

// SINE: nonlinear (b, c), linear (a, d)
{
  const g = new Array<number>(n).fill(0)
  const fit = (b: number, c: number) => {
    for (let i = 0; i < n; i++) g[i] = Math.sin(b * xs[i] + c)
    return fit2(g, -20, 20)
  }
  const cost = (p: number[]): number => fit(p[0], p[1]).err
  const cand: [number, number, number][] = []
  const CS = 48
  for (let bi = 0; bi <= 4000; bi++) {
    // keep the best phase of every frequency
    const b = bi * 0.005
    let top: [number, number, number] = [Infinity, b, 0]
    for (let ci = 0; ci < CS; ci++) {
      const c = (ci / CS) * 2 * Math.PI - Math.PI
      const e = fit(b, c).err
      if (e < top[0]) top = [e, b, c]
    }
    cand.push(top)
  }
  cand.sort((u, v) => u[0] - v[0])
  let bestErr = Infinity
  let bestP: number[] = [0, 0]
  for (const [, b, c] of cand.slice(0, 30)) {
    const p = refine([b, c], [0.005, 0.1], [-20, -20], [20, 20], cost)
    const e = cost(p)
    if (e < bestErr) {
      bestErr = e
      bestP = p
    }
  }
  const [b, c] = bestP
  const { k: a, c: d } = fit(b, c)
  results.push(["SINE", sse(test, x => a * Math.sin(b * x + c) + d)])
}

// EXPONENTIAL: nonlinear a, linear K = a^b (bounded by b in [-20, 20]) and c
{
  const g = new Array<number>(n).fill(0)
  const fit = (a: number): { err: number; k: number; c: number } => {
    const lo = Math.min(a ** -20, a ** 20)
    const hi = Math.max(a ** -20, a ** 20)
    for (let i = 0; i < n; i++) g[i] = a ** xs[i]
    if (g.some(v => !isFinite(v)) || !isFinite(lo) || !isFinite(hi)) return { err: Infinity, k: 0, c: 0 }
    return fit2(g, lo, hi)
  }
  const cost = (p: number[]): number => fit(p[0]).err
  const cand: [number, number][] = []
  for (let ai = 1; ai <= 4000; ai++) cand.push([fit(ai * 0.001).err, ai * 0.001])
  cand.sort((u, v) => u[0] - v[0])
  let bestErr = Infinity
  let bestA = 1
  for (const [, a0] of cand.slice(0, 5)) {
    const p = refine([a0], [0.001], [1e-6], [4], cost)
    const e = cost(p)
    if (e < bestErr) {
      bestErr = e
      bestA = p[0]
    }
  }
  const { k: K, c } = fit(bestA)
  results.push(["EXPONENTIAL", sse(test, x => K * bestA ** x + c)])
}

let best = results[0]
for (const r of results) if (r[1] < best[1]) best = r
console.log(best[0])
