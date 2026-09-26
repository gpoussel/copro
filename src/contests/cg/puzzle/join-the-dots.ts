// 🎮 CodinGame Puzzle - join-the-dots
// https://www.codingame.com/training/medium/join-the-dots

const [h, w] = readline().split(" ").map(Number)
const board: string[] = []
for (let i = 0; i < h; i++) board.push(readline())

const ORDER = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const positions: [number, number][] = []
for (const label of ORDER.split("")) {
  let found: [number, number] | null = null
  for (let r = 0; r < h && !found; r++) {
    const c = board[r].indexOf(label)
    if (c >= 0) found = [r, c]
  }
  if (!found) break
  positions.push(found)
}

// Every line segment crossing a cell leaves its character there
const strokes: string[][][] = board.map(() => new Array(w).fill(null).map((): string[] => []))
for (let i = 0; i + 1 < positions.length; i++) {
  const [r0, c0] = positions[i]
  const [r1, c1] = positions[i + 1]
  const dr = Math.sign(r1 - r0)
  const dc = Math.sign(c1 - c0)
  const stroke = dr === 0 ? "-" : dc === 0 ? "|" : dr === dc ? "\\" : "/"
  for (let r = r0 + dr, c = c0 + dc; r !== r1 || c !== c1; r += dr, c += dc) strokes[r][c].push(stroke)
}

const isDiagonal = (s: string) => s === "/" || s === "\\"

function render(r: number, c: number): string {
  if (board[r].charAt(c) !== ".") return "o"
  const list = strokes[r][c]
  if (list.length === 0) return " "
  if (list.length === 1) return list[0]
  if (list.length > 2) return "*"
  const [a, b] = list
  if (a === b) return a
  if (isDiagonal(a) && isDiagonal(b)) return "X"
  if (!isDiagonal(a) && !isDiagonal(b)) return "+"
  return "*"
}

for (let r = 0; r < h; r++) {
  let line = ""
  for (let c = 0; c < w; c++) line += render(r, c)
  console.log(line.replace(/ +$/, ""))
}
