// 🎮 CodinGame Puzzle - word-search-for-programmers
// https://www.codingame.com/training/easy/word-search-for-programmers

const size: number = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < size; i++) grid.push(readline())
const words = readline()
  .trim()
  .split(" ")
  .map(w => w.toUpperCase())

const keep: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false))
const dirs: [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

for (const word of words) {
  const len = word.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== word[0]) continue
      for (const [dr, dc] of dirs) {
        const er = r + dr * (len - 1)
        const ec = c + dc * (len - 1)
        if (er < 0 || er >= size || ec < 0 || ec >= size) continue
        let ok = true
        for (let k = 0; k < len; k++) {
          if (grid[r + dr * k][c + dc * k] !== word[k]) {
            ok = false
            break
          }
        }
        if (ok) {
          for (let k = 0; k < len; k++) {
            keep[r + dr * k][c + dc * k] = true
          }
        }
      }
    }
  }
}

const out: string[] = []
for (let r = 0; r < size; r++) {
  let line = ""
  for (let c = 0; c < size; c++) {
    line += keep[r][c] ? grid[r][c] : " "
  }
  out.push(line)
}
console.log(out.join("\n"))
