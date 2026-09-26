// 🎮 CodinGame Puzzle - tetris
// https://www.codingame.com/training/hard/tetris

// Brute force: try every position of the shape (rows above the field count
// as empty), keep the one clearing the most lines, then the lowest, then the
// leftmost.
const [sw, sh] = readline().split(" ").map(Number)
const shape = Array.from({ length: sh }, () => readline())
const [fw, fh] = readline().split(" ").map(Number)
// field[y] is the row at height y (0 = bottom)
const field = Array.from({ length: fh }, () => readline()).reverse()

const cell = (x: number, y: number) => y < fh && field[y][x] === "*"

let best: [number, number, number] | null = null
for (let top = sh - 1; top < fh + sh - 1; top++) {
  for (let x = 0; x + sw <= fw; x++) {
    const filled = new Set<string>()
    let valid = true
    for (let r = 0; r < sh && valid; r++) {
      for (let c = 0; c < sw; c++) {
        if (shape[r][c] !== "*") continue
        if (cell(x + c, top - r)) valid = false
        filled.add(`${x + c},${top - r}`)
      }
    }
    if (!valid) continue
    let lines = 0
    for (let y = top - sh + 1; y <= top; y++) {
      if (y >= fh) continue
      let full = true
      for (let c = 0; c < fw && full; c++) if (!cell(c, y) && !filled.has(`${c},${y}`)) full = false
      if (full) lines++
    }
    if (best === null || lines > best[2]) best = [x, top, lines]
  }
}
if (best !== null) console.log(`${best[0]} ${best[1]}\n${best[2]}`)
