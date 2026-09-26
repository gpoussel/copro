// 🎮 CodinGame Puzzle - picture-puzzle
// https://www.codingame.com/training/hard/picture-puzzle

// Backtracking in row-major order. Identical pieces are grouped (with a
// count) so that they are never swapped with each other. Every orientation
// of every group is indexed by its (top, left) borders, so each cell only
// looks at the candidates matching the pieces above and on the left.
// The first solution found may be a rotation of the real picture: we pick
// the rotation in which the first input piece appears unrotated.
const [S] = readline().split(" ").map(Number)
const [nCols, nRows] = readline().split(" ").map(Number)
const [W, H] = readline().split(" ").map(Number)
const nPieces = nCols * nRows

type Grid = string[]
const pieces: Grid[] = []
for (let p = 0; p < nPieces; p++) {
  const g: Grid = []
  for (let i = 0; i < S; i++) g.push((readline() ?? "").padEnd(S, " ").slice(0, S))
  pieces.push(g)
}

const rotate = (g: Grid): Grid => {
  const n = g.length
  const r: Grid = []
  for (let i = 0; i < n; i++) {
    let row = ""
    for (let j = 0; j < n; j++) row += g[n - 1 - j][i]
    r.push(row)
  }
  return r
}
const rotations = (g: Grid): Grid[] => {
  const out = [g]
  for (let k = 1; k < 4; k++) out.push(rotate(out[k - 1]))
  return out
}
const top = (g: Grid): string => g[0]
const bottom = (g: Grid): string => g[g.length - 1]
const left = (g: Grid): string => g.map(r => r[0]).join("")
const right = (g: Grid): string => g.map(r => r[r.length - 1]).join("")

// group identical pieces (up to rotation)
const groups: Grid[] = []
const count: number[] = []
const groupIdx = new Map<string, number>()
for (const p of pieces) {
  const key = rotations(p)
    .map(g => g.join("\n"))
    .sort()[0]
  const gi = groupIdx.get(key)
  if (gi === undefined) {
    groupIdx.set(key, groups.length)
    groups.push(p)
    count.push(1)
  } else count[gi]++
}

type Cand = { group: number; g: Grid }
const index = new Map<string, Cand[]>()
groups.forEach((p, gi) => {
  const seen = new Set<string>()
  for (const g of rotations(p)) {
    const k = g.join("\n")
    if (seen.has(k)) continue
    seen.add(k)
    const key = top(g) + "|" + left(g)
    if (!index.has(key)) index.set(key, [])
    ;(index.get(key) as Cand[]).push({ group: gi, g })
  }
})

const wall = "#".repeat(S)
const placed: Grid[] = new Array<Grid>(nPieces)
const dfs = (cell: number): boolean => {
  if (cell === nPieces) return true
  const r = Math.floor(cell / nCols)
  const c = cell % nCols
  const t = r === 0 ? wall : bottom(placed[cell - nCols])
  const l = c === 0 ? wall : right(placed[cell - 1])
  for (const cand of index.get(t + "|" + l) ?? []) {
    if (count[cand.group] === 0) continue
    if (r === nRows - 1 && bottom(cand.g) !== wall) continue
    if (c === nCols - 1 && right(cand.g) !== wall) continue
    count[cand.group]--
    placed[cell] = cand.g
    if (dfs(cell + 1)) return true
    count[cand.group]++
  }
  return false
}
dfs(0)

// assemble the picture
const pic: string[][] = Array.from({ length: H }, () => new Array<string>(W).fill(" "))
for (let i = 0; i < nPieces; i++) {
  const r0 = Math.floor(i / nCols) * (S - 1)
  const c0 = (i % nCols) * (S - 1)
  placed[i].forEach((row, y) => row.split("").forEach((ch, x) => (pic[r0 + y][c0 + x] = ch)))
}

// choose the global orientation where piece 0 appears as given
const first = pieces[0].join("\n")
const contains = (p: Grid): boolean => {
  if (p.length !== H || p[0].length !== W) return false
  for (let r = 0; r + S <= H; r += S - 1)
    for (let c = 0; c + S <= W; c += S - 1) {
      const sub = p.slice(r, r + S).map(row => row.slice(c, c + S))
      if (sub.join("\n") === first) return true
    }
  return false
}
let picture: Grid = pic.map(r => r.join(""))
const sq = (g: Grid): Grid => {
  // rotate a possibly non-square grid by 90 degrees clockwise
  const h = g.length
  const w = g[0].length
  const r: Grid = []
  for (let i = 0; i < w; i++) {
    let row = ""
    for (let j = 0; j < h; j++) row += g[h - 1 - j][i]
    r.push(row)
  }
  return r
}
for (let k = 0; k < 4 && !contains(picture); k++) picture = sq(picture)
console.log(picture.join("\n"))
