// 🎮 CodinGame Puzzle - knights-jam
// https://www.codingame.com/training/medium/knights-jam

const startBoard = readline().trim() + readline().trim() + readline().trim()
const GOAL = "12345678."

// Knight moves between the 9 squares of a 3x3 board
const knightMoves: number[][] = []
for (let cell = 0; cell < 9; cell++) {
  const r = Math.floor(cell / 3)
  const c = cell % 3
  const list: number[] = []
  for (const [dr, dc] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) {
    const nr = r + dr
    const nc = c + dc
    if (nr >= 0 && nc >= 0 && nr < 3 && nc < 3) list.push(nr * 3 + nc)
  }
  knightMoves.push(list)
}

// Breadth-first search over board states
const distance = new Map<string, number>([[startBoard, 0]])
let frontier = [startBoard]
while (frontier.length > 0 && !distance.has(GOAL)) {
  const next: string[] = []
  for (const board of frontier) {
    const empty = board.indexOf(".")
    for (const from of knightMoves[empty]) {
      const cells = board.split("")
      cells[empty] = cells[from]
      cells[from] = "."
      const moved = cells.join("")
      if (distance.has(moved)) continue
      distance.set(moved, distance.get(board)! + 1)
      next.push(moved)
    }
  }
  frontier = next
}
console.log(distance.has(GOAL) ? distance.get(GOAL)! : -1)
