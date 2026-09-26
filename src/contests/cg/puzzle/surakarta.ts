// 🎮 CodinGame Puzzle - surakarta
// https://www.codingame.com/training/hard/surakarta

// The board has two circuits: the small one uses lines 1 and 4, the big one lines 2 and 3.
// Each circuit is a cycle of 24 points made of 4 segments joined by corner loops.
// For each of our pieces, each occurrence on a circuit and each direction, we walk along
// the cycle: our own pieces block the way (the moving piece has left its square), and an
// opponent piece is captured only if at least one loop was traversed.

const grid: string[][] = []
for (let i = 0; i < 6; i++) grid.push(readline().split(""))

type Point = [number, number]
const buildCircuit = (k: number): Point[] => {
  const cells: Point[] = []
  for (let r = 0; r < 6; r++) cells.push([r, k]) // down column k
  for (let c = 0; c < 6; c++) cells.push([5 - k, c]) // row 5-k, left to right
  for (let r = 5; r >= 0; r--) cells.push([r, 5 - k]) // up column 5-k
  for (let c = 5; c >= 0; c--) cells.push([k, c]) // row k, right to left
  return cells
}

let count = 0
for (const circuit of [buildCircuit(1), buildCircuit(2)]) {
  const n = circuit.length
  for (let start = 0; start < n; start++) {
    const [sr, sc] = circuit[start]
    if (grid[sr][sc] !== "X") continue
    for (const dir of [1, -1]) {
      let loops = 0
      let i = start
      for (let steps = 0; steps < n; steps++) {
        const j = (i + dir + n) % n
        // A loop joins the end of a segment (index 5, 11, 17, 23) to the next one
        const edge = dir === 1 ? i : j
        if (edge % 6 === 5) loops++
        i = j
        const [r, c] = circuit[i]
        if (r === sr && c === sc) continue
        const cell = grid[r][c]
        if (cell === "X") break
        if (cell === "O") {
          if (loops > 0) count++
          break
        }
      }
    }
  }
}

console.log(count)
