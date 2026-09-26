// 🎮 CodinGame Puzzle - divine
// https://www.codingame.com/training/medium/divine

const N = 9
const grid: number[][] = []
for (let r = 0; r < N; r++) grid.push(readline().trim().split(/\s+/).map(Number))

/** Whether the token at (r, c) is part of a horizontal or vertical line of 3+. */
function aligned(r: number, c: number): boolean {
  const v = grid[r][c]
  const run = (dr: number, dc: number): number => {
    let count = 0
    for (let rr = r + dr, cc = c + dc; rr >= 0 && cc >= 0 && rr < N && cc < N && grid[rr][cc] === v; rr += dr, cc += dc) {
      count++
    }
    return count
  }
  return run(0, -1) + run(0, 1) >= 2 || run(-1, 0) + run(1, 0) >= 2
}

function swap(r1: number, c1: number, r2: number, c2: number): void {
  const tmp = grid[r1][c1]
  grid[r1][c1] = grid[r2][c2]
  grid[r2][c2] = tmp
}

const pairs: string[] = []
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    for (const [r2, c2] of [[r, c + 1], [r + 1, c]]) {
      if (r2 >= N || c2 >= N || grid[r][c] === grid[r2][c2]) continue
      swap(r, c, r2, c2)
      if (aligned(r, c) || aligned(r2, c2)) pairs.push(`${r} ${c} ${r2} ${c2}`)
      swap(r, c, r2, c2)
    }
  }
}
console.log(pairs.length)
pairs.forEach(p => console.log(p))
