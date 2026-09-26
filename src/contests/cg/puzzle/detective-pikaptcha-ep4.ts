// 🎮 CodinGame Puzzle - detective-pikaptcha-ep4
// https://www.codingame.com/training/hard/detective-pikaptcha-ep4

// Embed the cube net in 3D (doubled coordinates, cube spans [0, 2N]):
//     1
//   2 3 4
//     5
//     6
// Each face has an origin O, a column axis u and a row axis v; a cell
// center is O + (2c+1)u + (2r+1)v. Walking off an edge rolls the direction
// around the edge (new direction = -normal, new normal = old direction).
// Then follow the wall (left or right) until back on the starting cell.
type V3 = [number, number, number]

const N = parseInt(readline())
const S = 2 * N
const faces: { o: V3; u: V3; v: V3; n: V3 }[] = [
  { o: [0, 0, S], u: [1, 0, 0], v: [0, 0, -1], n: [0, -1, 0] },
  { o: [0, 0, S], u: [0, 0, -1], v: [0, 1, 0], n: [-1, 0, 0] },
  { o: [0, 0, 0], u: [1, 0, 0], v: [0, 1, 0], n: [0, 0, -1] },
  { o: [S, 0, 0], u: [0, 0, 1], v: [0, 1, 0], n: [1, 0, 0] },
  { o: [0, S, 0], u: [1, 0, 0], v: [0, 0, 1], n: [0, 1, 0] },
  { o: [0, S, S], u: [1, 0, 0], v: [0, -1, 0], n: [0, 0, 1] },
]

const grid: string[][] = []
for (let i = 0; i < 6 * N; i++) grid.push(readline().split(""))
const side = readline().trim()

const M = S + 1
const key = (p: V3): number => (p[0] * M + p[1]) * M + p[2]
// 3D position key -> flat cell index (face * N * N + r * N + c)
const cellAt = new Map<number, number>()
const add = (a: V3, b: V3, k: number): V3 => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

let start: { p: V3; d: V3; n: V3; idx: number } | null = null
for (let f = 0; f < 6; f++) {
  const { o, u, v, n } = faces[f]
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const p = add(add(o, u, 2 * c + 1), v, 2 * r + 1)
      const idx = (f * N + r) * N + c
      cellAt.set(key(p), idx)
      const ch = grid[f * N + r][c]
      const dir: Record<string, V3> = { ">": u, "<": add([0, 0, 0], u, -1), v: v, "^": add([0, 0, 0], v, -1) }
      if (ch in dir) start = { p, d: dir[ch], n, idx }
    }
  }
}

const open = (idx: number): boolean => grid[Math.floor(idx / N)][idx % N] !== "#"
const counts = new Array<number>(6 * N * N).fill(0)

// Step from (p, n) in direction d; returns new position, direction and normal
const step = (p: V3, d: V3, n: V3): { p: V3; d: V3; n: V3 } => {
  const q = add(p, d, 2)
  const i = d[0] !== 0 ? 0 : d[1] !== 0 ? 1 : 2
  // still on the same face while the moving coordinate stays inside the cube
  if (q[i] > 0 && q[i] < S) return { p: q, d, n }
  return { p: add(add(p, d, 1), n, -1), d: add([0, 0, 0], n, -1), n: d }
}

if (start) {
  let { p, d, n } = start
  const turns = side === "L" ? [1, 0, -1, 2] : [-1, 0, 1, 2]
  for (let guard = 0; guard < 4 * 6 * N * N + 10; guard++) {
    let moved = false
    for (const t of turns) {
      let nd: V3 = d
      if (t === 1) nd = cross(n, d)
      else if (t === -1) nd = cross(d, n)
      else if (t === 2) nd = add([0, 0, 0], d, -1)
      const s = step(p, nd, n)
      const idx = cellAt.get(key(s.p))
      if (idx !== undefined && open(idx)) {
        p = s.p
        d = s.d
        n = s.n
        counts[idx]++
        moved = true
        if (idx === start.idx) guard = Infinity
        break
      }
    }
    if (!moved) break
  }
}

const out: string[] = []
for (let f = 0; f < 6; f++) {
  for (let r = 0; r < N; r++) {
    let line = ""
    for (let c = 0; c < N; c++) {
      const idx = (f * N + r) * N + c
      line += grid[f * N + r][c] === "#" ? "#" : String(counts[idx])
    }
    out.push(line)
  }
}
console.log(out.join("\n"))
