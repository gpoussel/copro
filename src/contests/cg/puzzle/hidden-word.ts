// 🎮 CodinGame Puzzle - hidden-word
// https://www.codingame.com/training/medium/hidden-word

const n: number = parseInt(readline(), 10)
const words: string[] = []
for (let i = 0; i < n; i++) words.push(readline().trim())
const [h, w] = readline()
  .split(" ")
  .map(s => parseInt(s, 10))
const grid: string[] = []
for (let i = 0; i < h; i++) grid.push(readline())
const struck: boolean[][] = Array.from({ length: h }, () => new Array<boolean>(w).fill(false))
const dirs: Array<[number, number]> = [
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
  let found = false
  for (let r = 0; r < h && !found; r++) {
    for (let c = 0; c < w && !found; c++) {
      for (const [dr, dc] of dirs) {
        const er = r + dr * (word.length - 1)
        const ec = c + dc * (word.length - 1)
        if (er < 0 || er >= h || ec < 0 || ec >= w) continue
        let ok = true
        for (let k = 0; k < word.length; k++) {
          if (grid[r + dr * k][c + dc * k] !== word[k]) {
            ok = false
            break
          }
        }
        if (ok) {
          for (let k = 0; k < word.length; k++) struck[r + dr * k][c + dc * k] = true
          found = true
          break
        }
      }
    }
  }
}
let res = ""
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    if (!struck[r][c]) res += grid[r][c]
  }
}
console.log(res)
