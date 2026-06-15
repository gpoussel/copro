// 🎮 CodinGame Puzzle - word-search-for-programmers
// https://www.codingame.com/

const size: number = parseInt(readline(), 10)
const grid: string[] = []
for (let i = 0; i < size; i++) {
  grid.push(readline())
}
const words: string[] = readline()
  .split(" ")
  .filter((w: string) => w.length > 0)
  .map((w: string) => w.toUpperCase())

const used: boolean[][] = grid.map((row: string) => new Array<boolean>(row.length).fill(false))

const dirs: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

for (const word of words) {
  const len: number = word.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      for (const [dr, dc] of dirs) {
        const er: number = r + dr * (len - 1)
        const ec: number = c + dc * (len - 1)
        if (er < 0 || er >= size || ec < 0 || ec >= grid[r].length) {
          continue
        }
        let match: boolean = true
        for (let k = 0; k < len; k++) {
          if (grid[r + dr * k][c + dc * k] !== word[k]) {
            match = false
            break
          }
        }
        if (match) {
          for (let k = 0; k < len; k++) {
            used[r + dr * k][c + dc * k] = true
          }
        }
      }
    }
  }
}

const output: string[] = grid.map((row: string, r: number) =>
  row
    .split("")
    .map((ch: string, c: number) => (used[r][c] ? ch : " "))
    .join("")
)
console.log(output.join("\n"))
