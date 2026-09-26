// 🎮 CodinGame Puzzle - 1d-snake-arrange
// https://www.codingame.com/training/medium/1d-snake-arrange

function countArrangements(pattern: string, snakes: number[]): number {
  const n = pattern.length
  const m = snakes.length
  const dots: number[] = [0]
  for (let i = 0; i < n; i++) {
    dots.push(dots[i] + (pattern[i] === "." ? 1 : 0))
  }
  // memo[i][j] = ways to place snakes[j..] in pattern[i..]
  const memo: number[][] = []
  for (let i = 0; i <= n + 1; i++) memo.push(new Array<number>(m + 1).fill(-1))
  const solve = (i: number, j: number): number => {
    if (i >= n) return j === m ? 1 : 0
    if (memo[i][j] >= 0) return memo[i][j]
    let ways = 0
    // Leave position i empty
    if (pattern[i] !== "#") ways += solve(i + 1, j)
    // Place snake j starting at position i
    if (j < m) {
      const end = i + snakes[j]
      if (end <= n && dots[end] - dots[i] === 0 && (end === n || pattern[end] !== "#")) {
        ways += solve(end + 1, j + 1)
      }
    }
    memo[i][j] = ways
    return ways
  }
  // Solve from the end to avoid deep recursion
  for (let i = n - 1; i >= 0; i--) for (let j = m; j >= 0; j--) solve(i, j)
  return solve(0, 0)
}

const n = Number(readline())
for (let k = 0; k < n; k++) {
  const [pattern, list] = readline().trim().split(" ")
  console.log(countArrangements(pattern, list.split(",").map(Number)))
}
