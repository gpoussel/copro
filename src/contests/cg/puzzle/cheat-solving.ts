// 🎮 CodinGame Puzzle - cheat-solving
// https://www.codingame.com/training/hard/cheat-solving

// Reassembly only lets us permute pieces and rotate them in place, so the
// cube is solvable iff the edges are exactly the 12 solved color pairs and
// the corners are exactly the 8 solved corners *with the same chirality*
// (the cyclic order of the 3 colors around the corner, seen from outside).
// Stickers are mapped to 3D cubie positions to find the pieces.
type Sticker = { line: number; col: number; pos: string; face: string }

const lines: string[] = []
for (let i = 0; i < 11; i++) lines.push(readline() ?? "")

const faces: [string, number, number, (r: number, c: number) => number[]][] = [
  ["U", 0, 4, (r, c) => [c - 1, 1, r - 1]],
  ["L", 4, 0, (r, c) => [-1, 1 - r, c - 1]],
  ["F", 4, 4, (r, c) => [c - 1, 1 - r, 1]],
  ["R", 4, 8, (r, c) => [1, 1 - r, 1 - c]],
  ["B", 4, 12, (r, c) => [1 - c, 1 - r, -1]],
  ["D", 8, 4, (r, c) => [c - 1, -1, 1 - r]],
]
const normal: Record<string, number[]> = {
  U: [0, 1, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  R: [1, 0, 0],
  B: [0, 0, -1],
  D: [0, -1, 0],
}
const byPos = new Map<string, Sticker[]>()
for (const [f, l0, c0, cubie] of faces)
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const s = { line: l0 + r, col: c0 + c, pos: cubie(r, c).join(","), face: f }
      if (!byPos.has(s.pos)) byPos.set(s.pos, [])
      ;(byPos.get(s.pos) as Sticker[]).push(s)
    }

const det = (a: number[], b: number[], c: number[]): number =>
  a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])

// canonical piece signature given a color for each sticker
const signature = (ss: Sticker[], color: (s: Sticker) => string): string => {
  if (ss.length === 1) return ""
  if (ss.length === 2) return ss.map(color).sort().join("")
  let o = ss.slice()
  if (det(normal[o[0].face], normal[o[1].face], normal[o[2].face]) < 0) o = [o[0], o[2], o[1]]
  const cols = o.map(color)
  const rots = [0, 1, 2].map(k => cols[k] + cols[(k + 1) % 3] + cols[(k + 2) % 3])
  return rots.sort()[0]
}

const actual: string[] = []
const solved: string[] = []
for (const ss of byPos.values()) {
  actual.push(signature(ss, s => lines[s.line][s.col]))
  solved.push(signature(ss, s => s.face))
}
actual.sort()
solved.sort()
console.log(actual.join(" ") === solved.join(" ") ? "SOLVABLE" : "UNSOLVABLE")
