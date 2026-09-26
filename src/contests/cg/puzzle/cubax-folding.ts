// 🎮 CodinGame Puzzle - cubax-folding
// https://www.codingame.com/training/hard/cubax-folding

// Backtracking: each run of aligned blocks takes a direction perpendicular to the
// previous one, must stay inside the N³ box and only cover free cells, and must
// end on (N,N,N). Permuting the x/y/z axes keeps both corners fixed, so we only
// search solutions starting with R then U and derive the 6 images afterwards.
// Pruning: a free cell next to the new segment (and not next to the chain head)
// left with no free neighbour can never be filled, and with a single one it must
// be the chain's end, i.e. the (N,N,N) corner.

const n = parseInt(readline())
const blocks = readline().trim().split("").map(Number)
const DIRS: [string, number, number, number][] = [
  ["B", 0, 0, -1],
  ["D", 0, -1, 0],
  ["F", 0, 0, 1],
  ["L", -1, 0, 0],
  ["R", 1, 0, 0],
  ["U", 0, 1, 0],
]
const axis = (d: number): number => (DIRS[d][1] ? 0 : DIRS[d][2] ? 1 : 2)

const used = new Uint8Array(n * n * n)
const idx = (x: number, y: number, z: number): number => (x * n + y) * n + z
const path: string[] = []
const out: string[] = []

const freeNeighbours = (x: number, y: number, z: number): number => {
  let c = 0
  if (x > 0 && !used[idx(x - 1, y, z)]) c++
  if (x < n - 1 && !used[idx(x + 1, y, z)]) c++
  if (y > 0 && !used[idx(x, y - 1, z)]) c++
  if (y < n - 1 && !used[idx(x, y + 1, z)]) c++
  if (z > 0 && !used[idx(x, y, z - 1)]) c++
  if (z < n - 1 && !used[idx(x, y, z + 1)]) c++
  return c
}
const NB = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]
// true if some free cell around the new segment became unreachable
const stranded = (
  x: number,
  y: number,
  z: number,
  dx: number,
  dy: number,
  dz: number,
  len: number,
  ex: number,
  ey: number,
  ez: number
): boolean => {
  for (let s = 0; s <= len; s++) {
    const cx = x + dx * s
    const cy = y + dy * s
    const cz = z + dz * s
    for (const [ax, ay, az] of NB) {
      const fx = cx + ax
      const fy = cy + ay
      const fz = cz + az
      if (fx < 0 || fy < 0 || fz < 0 || fx >= n || fy >= n || fz >= n || used[idx(fx, fy, fz)]) continue
      const nearHead = Math.abs(fx - ex) + Math.abs(fy - ey) + Math.abs(fz - ez) === 1
      const deg = freeNeighbours(fx, fy, fz)
      if (!nearHead) {
        // unreachable, or a dead end that is not the final corner
        if (deg === 0) return true
        if (deg === 1 && !(fx === n - 1 && fy === n - 1 && fz === n - 1)) return true
      }
    }
  }
  return false
}

const dfs = (k: number, x: number, y: number, z: number, prevAxis: number): void => {
  if (k === blocks.length) {
    if (x === n - 1 && y === n - 1 && z === n - 1) out.push(path.join(""))
    return
  }
  const len = blocks[k] - 1
  for (let d = 0; d < 6; d++) {
    if (axis(d) === prevAxis) continue
    const [ch, dx, dy, dz] = DIRS[d]
    const ex = x + dx * len
    const ey = y + dy * len
    const ez = z + dz * len
    if (ex < 0 || ey < 0 || ez < 0 || ex >= n || ey >= n || ez >= n) continue
    let ok = true
    for (let s = 1; s <= len; s++)
      if (used[idx(x + dx * s, y + dy * s, z + dz * s)]) {
        ok = false
        break
      }
    if (!ok) continue
    for (let s = 1; s <= len; s++) used[idx(x + dx * s, y + dy * s, z + dz * s)] = 1
    if (k === 0 && ch !== "R") ok = false
    if (k === 1 && ch !== "U") ok = false
    if (ok && !stranded(x, y, z, dx, dy, dz, len, ex, ey, ez)) {
      path.push(ch)
      dfs(k + 1, ex, ey, ez, axis(d))
      path.pop()
    }
    for (let s = 1; s <= len; s++) used[idx(x + dx * s, y + dy * s, z + dz * s)] = 0
  }
}

used[0] = 1
dfs(0, 0, 0, 0, -1)
// apply the 6 axis permutations (x,y,z) -> letters
const AXES: [string, string][] = [
  ["R", "L"],
  ["U", "D"],
  ["F", "B"],
]
const perms = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
]
const all = new Set<string>()
for (const sol of out)
  for (const p of perms) {
    let t = ""
    for (const ch of sol)
      for (let a = 0; a < 3; a++) {
        if (AXES[a][0] === ch) t += AXES[p[a]][0]
        else if (AXES[a][1] === ch) t += AXES[p[a]][1]
      }
    all.add(t)
  }
console.log([...all].sort().join("\n"))
