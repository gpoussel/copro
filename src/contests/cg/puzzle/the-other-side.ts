// 🎮 CodinGame Puzzle - the-other-side
// https://www.codingame.com/training/easy/the-other-side

const h: number = parseInt(readline(), 10)
const w: number = parseInt(readline(), 10)
const grid: string[][] = []
for (let i = 0; i < h; i++) {
  grid.push(readline().split(" "))
}

const reachable: boolean[][] = Array.from({ length: h }, () => new Array<boolean>(w).fill(false))
const stack: [number, number][] = []
for (let r = 0; r < h; r++) {
  if (grid[r][w - 1] === "+") {
    reachable[r][w - 1] = true
    stack.push([r, w - 1])
  }
}

const dr: number[] = [-1, 1, 0, 0]
const dc: number[] = [0, 0, -1, 1]
while (stack.length > 0) {
  const [r, c] = stack.pop()!
  for (let k = 0; k < 4; k++) {
    const nr: number = r + dr[k]
    const nc: number = c + dc[k]
    if (nr >= 0 && nr < h && nc >= 0 && nc < w && !reachable[nr][nc] && grid[nr][nc] === "+") {
      reachable[nr][nc] = true
      stack.push([nr, nc])
    }
  }
}

let count: number = 0
for (let r = 0; r < h; r++) {
  if (reachable[r][0]) {
    count++
  }
}
console.log(count)
