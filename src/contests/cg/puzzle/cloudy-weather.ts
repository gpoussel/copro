// 🎮 CodinGame Puzzle - cloudy-weather
// https://www.codingame.com/training/hard/cloudy-weather

// A cloud blocks the integer cells [X, X+W-1] × [Y, Y+H-1]. Compress coordinates
// using X-1, X, X+W-1, X+W for every cloud (plus start/end): between two
// consecutive kept coordinates no cloud border occurs, so a straight move between
// neighbouring grid points is legal iff both points are sunny. The shortest
// Manhattan path hugs cloud borders, so Dijkstra on this Hanan-like grid is exact.

const [xs, ys] = readline().split(" ").map(Number)
const [xd, yd] = readline().split(" ").map(Number)
const n = parseInt(readline())
const clouds: number[][] = []
for (let i = 0; i < n; i++) clouds.push(readline().split(" ").map(Number))

const uniqSorted = (v: number[]): number[] => [...new Set(v)].sort((a, b) => a - b)
const cx = uniqSorted([xs, xd, ...clouds.flatMap(([x, , w]) => [x - 1, x, x + w - 1, x + w])])
const cy = uniqSorted([ys, yd, ...clouds.flatMap(([, y, , h]) => [y - 1, y, y + h - 1, y + h])])
const nx = cx.length
const ny = cy.length
const ix = new Map<number, number>(cx.map((v, i) => [v, i]))
const iy = new Map<number, number>(cy.map((v, i) => [v, i]))

// 2D difference array of blocked points
const diff = new Int32Array((nx + 1) * (ny + 1))
for (const [x, y, w, h] of clouds) {
  const x0 = ix.get(x)!
  const x1 = ix.get(x + w - 1)! + 1
  const y0 = iy.get(y)!
  const y1 = iy.get(y + h - 1)! + 1
  diff[y0 * (nx + 1) + x0]++
  diff[y0 * (nx + 1) + x1]--
  diff[y1 * (nx + 1) + x0]--
  diff[y1 * (nx + 1) + x1]++
}
const blocked = new Uint8Array(nx * ny)
const acc = new Int32Array(nx + 1)
for (let j = 0; j < ny; j++) {
  let row = 0
  for (let i = 0; i < nx; i++) {
    row += diff[j * (nx + 1) + i]
    acc[i] += row
    blocked[j * nx + i] = acc[i] > 0 ? 1 : 0
  }
}

// Dijkstra with a binary heap on parallel typed arrays
let cap = 1 << 20
let hk = new Float64Array(cap)
let hv = new Int32Array(cap)
let size = 0
const push = (k: number, v: number): void => {
  if (size === cap) {
    cap *= 2
    const nk = new Float64Array(cap)
    nk.set(hk)
    hk = nk
    const nv = new Int32Array(cap)
    nv.set(hv)
    hv = nv
  }
  let i = size++
  while (i > 0) {
    const p = (i - 1) >> 1
    if (hk[p] <= k) break
    hk[i] = hk[p]
    hv[i] = hv[p]
    i = p
  }
  hk[i] = k
  hv[i] = v
}
const popInto = (): number => {
  const v = hv[0]
  const k = hk[--size]
  const val = hv[size]
  let i = 0
  while (true) {
    let c = 2 * i + 1
    if (c >= size) break
    if (c + 1 < size && hk[c + 1] < hk[c]) c++
    if (hk[c] >= k) break
    hk[i] = hk[c]
    hv[i] = hv[c]
    i = c
  }
  hk[i] = k
  hv[i] = val
  return v
}

const dist = new Float64Array(nx * ny).fill(Infinity)
const start = iy.get(ys)! * nx + ix.get(xs)!
const target = iy.get(yd)! * nx + ix.get(xd)!
dist[start] = 0
push(0, start)
while (size > 0) {
  const d = hk[0]
  const u = popInto()
  if (d > dist[u]) continue
  if (u === target) break
  const i = u % nx
  const j = (u - i) / nx
  const relax = (v: number, w: number): void => {
    if (blocked[v]) return
    const nd = d + w
    if (nd < dist[v]) {
      dist[v] = nd
      push(nd, v)
    }
  }
  if (i > 0) relax(u - 1, cx[i] - cx[i - 1])
  if (i + 1 < nx) relax(u + 1, cx[i + 1] - cx[i])
  if (j > 0) relax(u - nx, cy[j] - cy[j - 1])
  if (j + 1 < ny) relax(u + nx, cy[j + 1] - cy[j])
}
console.log(dist[target])
