// 🎮 CodinGame Puzzle - sliding-puzzle
// https://www.codingame.com/training/expert/sliding-puzzle

// The answer is at most 10, so IDA* with the Manhattan-distance heuristic
// explores a tiny tree even on a 10x10 board.
const [rows, cols] = readline().split(" ").map(Number)
const board: number[] = []
for (let r = 0; r < rows; r++)
  for (const tok of readline().trim().split(/\s+/)) board.push(tok === "." ? 0 : parseInt(tok))
const cells = rows * cols
// tile t belongs at index t - 1
const tileCost = (t: number, i: number): number =>
  t === 0 ? 0 : Math.abs(Math.floor(i / cols) - Math.floor((t - 1) / cols)) + Math.abs((i % cols) - ((t - 1) % cols))
let heuristic = 0
let blank = 0
for (let i = 0; i < cells; i++) {
  heuristic += tileCost(board[i], i)
  if (board[i] === 0) blank = i
}
const neighbours = (i: number): number[] => {
  const out: number[] = []
  if (i >= cols) out.push(i - cols)
  if (i + cols < cells) out.push(i + cols)
  if (i % cols > 0) out.push(i - 1)
  if (i % cols < cols - 1) out.push(i + 1)
  return out
}
let solvedIn = -1
const search = (g: number, h: number, bound: number, prev: number): boolean => {
  if (h === 0) {
    solvedIn = g
    return true
  }
  if (g + h > bound) return false
  for (const nb of neighbours(blank)) {
    if (nb === prev) continue
    const t = board[nb]
    const nh = h - tileCost(t, nb) + tileCost(t, blank)
    const old = blank
    board[old] = t
    board[nb] = 0
    blank = nb
    const found = search(g + 1, nh, bound, old)
    blank = old
    board[nb] = t
    board[old] = 0
    if (found) return true
  }
  return false
}
let bound = heuristic
while (!search(0, heuristic, bound, -1)) bound++
console.log(solvedIn)
