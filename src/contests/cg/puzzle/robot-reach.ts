// 🎮 CodinGame Puzzle - robot-reach
// https://www.codingame.com/training/easy/robot-reach

const R: number = parseInt(readline(), 10)
const C: number = parseInt(readline(), 10)
const T: number = parseInt(readline(), 10)

const digitSum = (n: number): number => {
  let s = 0
  while (n > 0) {
    s += n % 10
    n = Math.floor(n / 10)
  }
  return s
}

const value = (r: number, c: number): number => digitSum(r) + digitSum(c)

const visited: boolean[][] = Array.from({ length: R }, () => new Array<boolean>(C).fill(false))

let count = 0
if (value(0, 0) <= T) {
  const stack: Array<[number, number]> = [[0, 0]]
  visited[0][0] = true
  while (stack.length > 0) {
    const cell = stack.pop() as [number, number]
    const r = cell[0]
    const c = cell[1]
    count++
    const deltas: Array<[number, number]> = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ]
    for (const d of deltas) {
      const nr = d[0]
      const nc = d[1]
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && !visited[nr][nc] && value(nr, nc) <= T) {
        visited[nr][nc] = true
        stack.push([nr, nc])
      }
    }
  }
}

console.log(count)
