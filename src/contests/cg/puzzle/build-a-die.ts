// 🎮 CodinGame Puzzle - build-a-die
// https://www.codingame.com/training/hard/build-a-die

// Brute force: try every distinct labelling of the 6 net cells, fold the net
// into a cube (tracking the outward normal and the net's "up"/"right" axes on
// the cube), check each 3D image against the folded die, and group valid
// labellings by die up to the 24 rotations (keeping the smallest one per group).
type Vec = [number, number, number]

const faces = readline()
const n = parseInt(readline())
const imgLines: string[] = []
for (let i = 0; i < 5; i++) imgLines.push(readline() ?? "")
const [W, H] = readline().split(" ").map(Number)
const net: string[] = []
for (let i = 0; i < H; i++) net.push((readline() ?? "").padEnd(W, " "))

const DIRS: Vec[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]
const dirIndex = (v: Vec): number => DIRS.findIndex(d => d[0] === v[0] && d[1] === v[1] && d[2] === v[2])
const neg = (v: Vec): Vec => [-v[0], -v[1], -v[2]]
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

// Fold the net: cube direction of every '?' cell, in reading order
const cells: [number, number][] = []
for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (net[r][c] === "?") cells.push([r, c])
const cellDir = new Array<number>(6).fill(-1)
{
  const state = new Map<number, [Vec, Vec, Vec]>() // cell -> [normal, up, right]
  const key = (r: number, c: number): number => r * W + c
  state.set(key(cells[0][0], cells[0][1]), [
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
  ])
  const queue: [number, number][] = [cells[0]]
  while (queue.length) {
    const [r, c] = queue.shift()!
    const [nv, u, rt] = state.get(key(r, c))!
    const moves: [number, number, [Vec, Vec, Vec]][] = [
      [0, 1, [rt, u, neg(nv)]],
      [0, -1, [neg(rt), u, nv]],
      [1, 0, [neg(u), nv, rt]],
      [-1, 0, [u, neg(nv), rt]],
    ]
    for (const [dr, dc, next] of moves) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr >= H || nc < 0 || nc >= W || net[nr][nc] !== "?" || state.has(key(nr, nc))) continue
      state.set(key(nr, nc), next)
      queue.push([nr, nc])
    }
  }
  cells.forEach(([r, c], i) => (cellDir[i] = dirIndex(state.get(key(r, c))![0])))
}

// The 24 rotations as permutations of the direction indices
const rotations: number[][] = []
{
  const rx = (v: Vec): Vec => [v[0], -v[2], v[1]]
  const ry = (v: Vec): Vec => [v[2], v[1], -v[0]]
  const seen = new Set<string>()
  const stack: number[][] = [[0, 1, 2, 3, 4, 5]]
  while (stack.length) {
    const p = stack.pop()!
    const k = p.join()
    if (seen.has(k)) continue
    seen.add(k)
    rotations.push(p)
    for (const f of [rx, ry]) stack.push(p.map(d => dirIndex(f(DIRS[d]))))
  }
}

// Image constraints: corner views (A top, B left, C right) need dir(A) x dir(B) = dir(C);
// two-face views only need the two labels on adjacent faces.
const corners: string[][] = []
const pairs: string[][] = []
for (let i = 0; i < n; i++) {
  const at = (r: number, c: number): string => imgLines[r][6 * i + c] ?? " "
  if (at(0, 0) === "\\") corners.push([at(0, 2), at(3, 0), at(3, 4)])
  else if (at(1, 0) === "/") pairs.push([at(1, 2), at(3, 2)])
  else pairs.push([at(2, 0), at(2, 4)])
}

const valid = (die: string[]): boolean => {
  for (const [a, b] of pairs) {
    let ok = false
    for (let i = 0; i < 6 && !ok; i++)
      for (let j = 0; j < 6 && !ok; j++) if (i >> 1 !== j >> 1 && die[i] === a && die[j] === b) ok = true
    if (!ok) return false
  }
  for (const [a, b, c] of corners) {
    let ok = false
    for (let i = 0; i < 6 && !ok; i++)
      for (let j = 0; j < 6 && !ok; j++) {
        if (i >> 1 === j >> 1 || die[i] !== a || die[j] !== b) continue
        if (die[dirIndex(cross(DIRS[i], DIRS[j]))] === c) ok = true
      }
    if (!ok) return false
  }
  return true
}

// Enumerate distinct permutations of the labels (sorted, so generated in lexicographic order)
const labels = faces.split("").sort()
const best = new Map<string, string>()
const used = new Array<boolean>(6).fill(false)
const perm: string[] = []
const rec = (): void => {
  if (perm.length === 6) {
    const die = new Array<string>(6)
    perm.forEach((l, i) => (die[cellDir[i]] = l))
    if (!valid(die)) return
    const canon = rotations.map(p => p.map(d => die[d]).join("")).sort()[0]
    if (!best.has(canon)) best.set(canon, perm.join(""))
    return
  }
  for (let i = 0; i < 6; i++) {
    if (used[i] || (i > 0 && labels[i] === labels[i - 1] && !used[i - 1])) continue
    used[i] = true
    perm.push(labels[i])
    rec()
    perm.pop()
    used[i] = false
  }
}
rec()

const results = [...best.values()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
const out: string[] = [String(results.length)]
for (const res of results) {
  let k = 0
  for (const line of net) out.push(line.replace(/\?/g, () => res[k++]).trimEnd())
}
console.log(out.join("\n"))
