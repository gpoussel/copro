// 🎮 CodinGame Puzzle - squares-order
// https://www.codingame.com/training/expert/squares-order

// Peel the drawing backwards: the last square drawn has its whole border visible. A square is
// a valid "next to peel" if every border cell shows its label or was already peeled (covered
// by a later square), no border cell is empty, and every visible cell of its label lies on
// that border. Depth-first search over labels and candidate squares until all are peeled.
const [gridH, gridW]: number[] = readline().split(" ").map(Number)
const nbSquares: number = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < gridH; i++) grid.push(readline())

type Square = { x: number; y: number; s: number; cells: number[] }

const onBorder = (sq: Square, r: number, c: number): boolean =>
  r >= sq.y &&
  r < sq.y + sq.s &&
  c >= sq.x &&
  c < sq.x + sq.s &&
  (r === sq.y || r === sq.y + sq.s - 1 || c === sq.x || c === sq.x + sq.s - 1)

// Candidate squares per label: border never on an empty cell, covering all cells of the label
const candidates: Square[][] = []
for (let lab = 1; lab <= nbSquares; lab++) {
  const ch: string = String(lab)
  const own: number[] = []
  for (let r = 0; r < gridH; r++) for (let c = 0; c < gridW; c++) if (grid[r][c] === ch) own.push(r * gridW + c)
  const list: Square[] = []
  for (let s = 2; s <= Math.min(gridH, gridW); s++) {
    for (let y = 0; y + s <= gridH; y++) {
      for (let x = 0; x + s <= gridW; x++) {
        const sq: Square = { x, y, s, cells: [] }
        let ok: boolean = true
        for (let r = y; r < y + s && ok; r++) {
          for (let c = x; c < x + s; c++) {
            if (!onBorder(sq, r, c)) continue
            if (grid[r][c] === ".") {
              ok = false
              break
            }
            sq.cells.push(r * gridW + c)
          }
        }
        if (ok && own.every((k: number) => onBorder(sq, Math.floor(k / gridW), k % gridW))) list.push(sq)
      }
    }
  }
  candidates.push(list)
}

const covered: number[] = new Array<number>(gridH * gridW).fill(0)
const used: boolean[] = new Array<boolean>(nbSquares + 1).fill(false)
const peeled: [number, number][] = []

const solve = (): boolean => {
  if (peeled.length === nbSquares) {
    // every drawn cell must be explained by some square
    for (let r = 0; r < gridH; r++)
      for (let c = 0; c < gridW; c++) if (grid[r][c] !== "." && !covered[r * gridW + c]) return false
    return true
  }
  for (let lab = 1; lab <= nbSquares; lab++) {
    if (used[lab]) continue
    const ch: string = String(lab)
    for (const sq of candidates[lab - 1]) {
      if (!sq.cells.every((k: number) => covered[k] > 0 || grid[Math.floor(k / gridW)][k % gridW] === ch)) continue
      used[lab] = true
      for (const k of sq.cells) covered[k]++
      peeled.push([lab, sq.s])
      if (solve()) return true
      peeled.pop()
      for (const k of sq.cells) covered[k]--
      used[lab] = false
    }
  }
  return false
}

solve()
console.log(
  peeled
    .reverse()
    .map(([lab, s]: [number, number]) => `${lab} ${s}`)
    .join("\n")
)
