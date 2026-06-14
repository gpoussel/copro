// 🎮 CodinGame Puzzle - robot-reach
// https://www.codingame.com/training/robot-reach

const R = parseInt(readline())
const C = parseInt(readline())
const T = parseInt(readline())

const digitSum = (x: number): number => {
  let s = 0
  while (x > 0) {
    s += x % 10
    x = Math.floor(x / 10)
  }
  return s
}

const ok = (r: number, c: number): boolean => r >= 0 && r < R && c >= 0 && c < C && digitSum(r) + digitSum(c) <= T

const visited: boolean[][] = Array.from({ length: R }, () => new Array(C).fill(false))

let count = 0
if (ok(0, 0)) {
  const stack: number[][] = [[0, 0]]
  visited[0][0] = true
  while (stack.length > 0) {
    const [r, c] = stack.pop()!
    count++
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]
    for (const [dr, dc] of dirs) {
      const nr = r + dr,
        nc = c + dc
      if (ok(nr, nc) && !visited[nr][nc]) {
        visited[nr][nc] = true
        stack.push([nr, nc])
      }
    }
  }
}

console.log(count)
