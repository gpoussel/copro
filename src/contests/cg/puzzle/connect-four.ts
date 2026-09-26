// 🎮 CodinGame Puzzle - connect-four
// https://www.codingame.com/training/hard/connect-four

// For each player and each non-full column, drop a token and check the four
// line directions through it.
const grid = Array.from({ length: 6 }, () => readline().trim().split(""))
const DIRS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

const count = (r: number, c: number, dr: number, dc: number, p: string) => {
  let n = 0
  for (let i = r + dr, j = c + dc; i >= 0 && i < 6 && j >= 0 && j < 7 && grid[i][j] === p; i += dr, j += dc) n++
  return n
}

for (const p of ["1", "2"]) {
  const wins: number[] = []
  for (let c = 0; c < 7; c++) {
    let r = 5
    while (r >= 0 && grid[r][c] !== ".") r--
    if (r < 0) continue
    if (DIRS.some(([dr, dc]) => 1 + count(r, c, dr, dc, p) + count(r, c, -dr, -dc, p) >= 4)) wins.push(c)
  }
  console.log(wins.length ? wins.join(" ") : "NONE")
}
