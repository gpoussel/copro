// 🎮 CodinGame Puzzle - no-more-pythons-please
// https://www.codingame.com/training/medium/no-more-pythons-please

const [rows, cols] = readline().split(" ").map(Number)
const field: string[] = []
for (let i = 0; i < rows; i++) field.push(readline())

// Directions: 0 up, 1 right, 2 down, 3 left
const DR = [-1, 0, 1, 0]
const DC = [0, 1, 0, -1]
const TAIL_FOR_DIR = ["^", ">", "v", "<"]
const at = (r: number, c: number): string => (r >= 0 && r < rows && c >= 0 && c < cols ? field[r][c] : ".")

const onPath: boolean[][] = field.map(row => row.split("").map(() => false))

// Whether the cell (r, c), entered while moving in direction d, can be part of a snake here
const fits = (r: number, c: number, d: number): boolean => {
  if (onPath[r] === undefined || onPath[r][c] === undefined || onPath[r][c]) return false
  const ch = at(r, c)
  if (ch === "*") return true
  if (ch === TAIL_FOR_DIR[d]) return true
  return d % 2 === 0 ? ch === "|" : ch === "-"
}

// Returns the length of the remaining snake starting at (r, c) entered moving in direction d, or -1
const follow = (r: number, c: number, d: number): number => {
  const ch = at(r, c)
  if (ch === TAIL_FOR_DIR[d]) return 1
  const nextDirs = ch === "*" ? [(d + 1) % 4, (d + 3) % 4] : [d]
  onPath[r][c] = true
  let result = -1
  for (const nd of nextDirs) {
    const nr = r + DR[nd]
    const nc = c + DC[nd]
    if (!fits(nr, nc, nd)) continue
    if (ch === "*" && at(nr, nc) === "*") continue
    const sub = follow(nr, nc, nd)
    if (sub > 0) {
      result = sub + 1
      break
    }
  }
  onPath[r][c] = false
  return result
}

let best = 0
let bestCount = 0
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (field[r][c] !== "o") continue
    let size = -1
    onPath[r][c] = true
    for (let d = 0; d < 4 && size < 0; d++) {
      const nr = r + DR[d]
      const nc = c + DC[d]
      if (!fits(nr, nc, d) || at(nr, nc) === "*") continue
      const sub = follow(nr, nc, d)
      if (sub > 0) size = sub + 1
    }
    onPath[r][c] = false
    if (size > best) {
      best = size
      bestCount = 1
    } else if (size === best) bestCount++
  }
}

console.log(best)
console.log(bestCount)
