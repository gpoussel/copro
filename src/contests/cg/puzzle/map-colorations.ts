// 🎮 CodinGame Puzzle - map-colorations
// https://www.codingame.com/training/hard/map-colorations

// Chromatic polynomial by deletion-contraction (P(G) = P(G-e) - P(G/e)),
// peeling leaves ((x-1) factor) and isolated vertices (x factor) first, with
// memoisation on the edge list. The polynomial is then evaluated per C.

type Poly = number[] // coefficients, index = power of x

const polyMul = (a: Poly, b: Poly): Poly => {
  const out = new Array(a.length + b.length - 1).fill(0)
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j]
  return out
}
const polySub = (a: Poly, b: Poly): Poly => {
  const out = new Array(Math.max(a.length, b.length)).fill(0)
  a.forEach((c, i) => (out[i] += c))
  b.forEach((c, i) => (out[i] -= c))
  return out
}
const xPow = (k: number): Poly => {
  const out = new Array(k + 1).fill(0)
  out[k] = 1
  return out
}

const memo = new Map<string, Poly>()

// n vertices labelled 0..n-1, edges as normalised [a, b] with a < b
const chrom = (n: number, edges: [number, number][]): Poly => {
  if (edges.length === 0) return xPow(n)
  const key = n + ":" + edges.map(([a, b]) => a + "-" + b).join(",")
  const cached = memo.get(key)
  if (cached) return cached

  const deg = new Array(n).fill(0)
  for (const [a, b] of edges) {
    deg[a]++
    deg[b]++
  }
  let result: Poly
  const isolated = deg.indexOf(0)
  const leaf = deg.indexOf(1)
  if (isolated >= 0) {
    result = polyMul(xPow(1), chrom(n - 1, removeVertex(edges, isolated)))
  } else if (leaf >= 0) {
    const rest = edges.filter(([a, b]) => a !== leaf && b !== leaf)
    result = polyMul([-1, 1], chrom(n - 1, relabel(rest, leaf)))
  } else {
    const [u, v] = edges[0]
    const deleted = edges.slice(1)
    // contraction: v is merged into u
    const merged = normalise(deleted.map(([a, b]) => [a === v ? u : a, b === v ? u : b]))
    result = polySub(chrom(n, deleted), chrom(n - 1, relabel(merged, v)))
  }
  memo.set(key, result)
  return result
}

const normalise = (edges: [number, number][]): [number, number][] => {
  const seen = new Set<string>()
  const out: [number, number][] = []
  for (const [a, b] of edges) {
    const e: [number, number] = a < b ? [a, b] : [b, a]
    const k = e[0] + "-" + e[1]
    if (!seen.has(k)) {
      seen.add(k)
      out.push(e)
    }
  }
  return out.sort((x, y) => x[0] - y[0] || x[1] - y[1])
}
// drops vertex v (which has no edges left) and shifts labels above it
const relabel = (edges: [number, number][], v: number): [number, number][] =>
  normalise(edges.map(([a, b]) => [a > v ? a - 1 : a, b > v ? b - 1 : b]))
const removeVertex = (edges: [number, number][], v: number) => relabel(edges, v)

const ids = new Map<string, number>()
const id = (name: string) => {
  if (!ids.has(name)) ids.set(name, ids.size)
  return ids.get(name)!
}
const N = Number(readline())
const raw: [number, number][] = []
for (let i = 0; i < N; i++) {
  const [a, b] = readline().split(" ")
  raw.push([id(a), id(b)])
}
const poly = chrom(ids.size, normalise(raw.filter(([a, b]) => a !== b)))

const K = Number(readline())
const out: string[] = []
for (let i = 0; i < K; i++) {
  const c = BigInt(readline())
  let value = 0n
  for (let p = poly.length - 1; p >= 0; p--) value = value * c + BigInt(poly[p])
  out.push(value.toString())
}
console.log(out.join("\n"))
