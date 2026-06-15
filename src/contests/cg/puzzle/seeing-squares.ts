// 🎮 CodinGame Puzzle - seeing-squares
// https://www.codingame.com/

const [r, c]: number[] = readline()
  .split(" ")
  .map((v: string) => parseInt(v, 10))

const grid: string[] = []
for (let i = 0; i < r; i++) {
  const row: string = readline()
  grid.push(row.padEnd(c, " "))
}

const at = (y: number, x: number): string => {
  if (y < 0 || y >= r || x < 0 || x >= c) return " "
  return grid[y][x] ?? " "
}

// horizRun[y][x] = number of consecutive horizontal-capable chars (- or +)
// starting at (y, x) going right.
// vertRun[y][x] = number of consecutive vertical-capable chars (| or +)
// starting at (y, x) going down.
const horizRun: number[][] = []
const vertRun: number[][] = []
for (let y = 0; y < r; y++) {
  horizRun.push(new Array<number>(c).fill(0))
  vertRun.push(new Array<number>(c).fill(0))
}

for (let y = 0; y < r; y++) {
  for (let x = c - 1; x >= 0; x--) {
    const ch: string = at(y, x)
    if (ch === "-" || ch === "+") {
      horizRun[y][x] = (x + 1 < c ? horizRun[y][x + 1] : 0) + 1
    }
  }
}

for (let x = 0; x < c; x++) {
  for (let y = r - 1; y >= 0; y--) {
    const ch: string = at(y, x)
    if (ch === "|" || ch === "+") {
      vertRun[y][x] = (y + 1 < r ? vertRun[y + 1][x] : 0) + 1
    }
  }
}

let count: number = 0
// Each square has top-left corner at (y, x), height h >= 2, width w = 2h - 1.
for (let y = 0; y < r; y++) {
  for (let x = 0; x < c; x++) {
    if (at(y, x) !== "+") continue
    for (let h = 2; ; h++) {
      const w: number = 2 * h - 1
      const bottom: number = y + h - 1
      const right: number = x + w - 1
      if (bottom >= r || right >= c) break
      // Corners must be '+'.
      if (at(y, right) !== "+" || at(bottom, x) !== "+" || at(bottom, right) !== "+") continue
      // Top side: row y from x to right (length w).
      if (horizRun[y][x] < w) continue
      // Bottom side: row bottom from x to right.
      if (horizRun[bottom][x] < w) continue
      // Left side: column x from y to bottom (length h).
      if (vertRun[y][x] < h) continue
      // Right side: column right from y to bottom.
      if (vertRun[y][right] < h) continue
      count++
    }
  }
}

console.log(count)
