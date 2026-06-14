// 🎮 CodinGame Puzzle - sand-fall
// https://www.codingame.com/training/easy/sand-fall

const [w, h] = readline().split(" ").map(Number)
const n: number = parseInt(readline())
const grid: string[][] = Array.from({ length: h }, () => new Array(w).fill(" "))

for (let i = 0; i < n; i++) {
  const parts = readline().split(" ")
  const ch = parts[0]
  let col = parseInt(parts[1])
  let row = -1
  const lower = ch >= "a" && ch <= "z"
  while (true) {
    if (row + 1 < h && grid[row + 1][col] === " ") {
      row++
      continue
    }
    let moved = false
    const dirs = lower ? [1, -1] : [-1, 1]
    for (const d of dirs) {
      const nc = col + d
      if (row + 1 < h && nc >= 0 && nc < w && grid[row + 1][nc] === " ") {
        col = nc
        row++
        moved = true
        break
      }
    }
    if (!moved) break
  }
  grid[row][col] = ch
}

const out: string[] = []
for (let r = 0; r < h; r++) {
  out.push("|" + grid[r].join("") + "|")
}
out.push("+" + "-".repeat(w) + "+")
console.log(out.join("\n"))
