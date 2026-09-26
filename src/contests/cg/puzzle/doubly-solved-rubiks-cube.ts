// 🎮 CodinGame Puzzle - doubly-solved-rubiks-cube
// https://www.codingame.com/training/hard/doubly-solved-rubiks-cube

// If the scramble moved the sticker from home position h to position q
// (X[q] = solved[h], i.e. P(q) = h), solving twice applies the inverse
// permutation to the solved cube: Y[h] = solved[q].
// Each sticker's home is identified by its piece: the set of colors on the
// cubie (unique for centers, edges and corners) plus its own color.
type Sticker = { line: number; col: number; pos: string; normal: string }

const lines: string[] = []
for (let i = 0; i < 11; i++) lines.push(readline() ?? "")

// Net layout: face letter, top-left (line, col), cubie coordinates of (r, c)
const faces: [string, number, number, (r: number, c: number) => number[]][] = [
  ["U", 0, 4, (r, c) => [c - 1, 1, r - 1]],
  ["L", 4, 0, (r, c) => [-1, 1 - r, c - 1]],
  ["F", 4, 4, (r, c) => [c - 1, 1 - r, 1]],
  ["R", 4, 8, (r, c) => [1, 1 - r, 1 - c]],
  ["B", 4, 12, (r, c) => [1 - c, 1 - r, -1]],
  ["D", 8, 4, (r, c) => [c - 1, -1, 1 - r]],
]
const stickers: Sticker[] = []
for (const [f, l0, c0, cubie] of faces)
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) stickers.push({ line: l0 + r, col: c0 + c, pos: cubie(r, c).join(","), normal: f })

const color = (s: Sticker): string => lines[s.line][s.col]
const byPos = new Map<string, Sticker[]>()
for (const s of stickers) {
  if (!byPos.has(s.pos)) byPos.set(s.pos, [])
  ;(byPos.get(s.pos) as Sticker[]).push(s)
}
// solved piece color set -> cubie position
const home = new Map<string, string>()
for (const [pos, ss] of byPos)
  home.set(
    ss
      .map(s => s.normal)
      .sort()
      .join(""),
    pos
  )

const out = lines.map(l => l.split(""))
for (const q of stickers) {
  const piece = (byPos.get(q.pos) as Sticker[]).map(color).sort().join("")
  const hPos = home.get(piece) as string
  const h = (byPos.get(hPos) as Sticker[]).find(s => s.normal === color(q)) as Sticker
  out[h.line][h.col] = q.normal
}
console.log(out.map(l => l.join("").trimEnd()).join("\n"))
