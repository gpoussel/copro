const n = parseInt(readline())
const grid: number[][] = []
for (let i = 0; i < n; i++) {
  grid.push(readline().split("").map(Number))
}
for (let i = 0; i < n; i++) {
  const row = readline().split("").map(Number)
  for (let j = 0; j < n; j++) grid[i][j] += row[j]
}

let unstable = true
while (unstable) {
  unstable = false
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] >= 4) {
        grid[i][j] -= 4
        if (i > 0) grid[i - 1][j]++
        if (i < n - 1) grid[i + 1][j]++
        if (j > 0) grid[i][j - 1]++
        if (j < n - 1) grid[i][j + 1]++
        unstable = true
      }
    }
  }
}

console.log(grid.map(r => r.join("")).join("\n"))
