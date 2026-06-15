// 🎮 CodinGame Puzzle - minesweeper-level-generator
// https://www.codingame.com/training/easy/minesweeper-level-generator

const line: string = readline()
const [width, height, n, x, y, seed]: number[] = line.split(" ").map((v: string) => parseInt(v, 10))

let state: number = seed >>> 0
const next = (): number => {
  state = ((Math.imul(214013, state) + 2531011) >>> 0) >>> 16
  return state
}

const mines: boolean[][] = []
for (let row = 0; row < height; row++) {
  mines.push(new Array<boolean>(width).fill(false))
}

const isFree = (cx: number, cy: number): boolean => Math.abs(cx - x) <= 1 && Math.abs(cy - y) <= 1

let placed: number = 0
while (placed < n) {
  const mx: number = next() % width
  const my: number = next() % height
  if (isFree(mx, my) || mines[my][mx]) {
    continue
  }
  mines[my][mx] = true
  placed++
}

const output: string[] = []
for (let row = 0; row < height; row++) {
  let str: string = ""
  for (let col = 0; col < width; col++) {
    if (mines[row][col]) {
      str += "#"
      continue
    }
    let count: number = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) {
          continue
        }
        const ny: number = row + dy
        const nx: number = col + dx
        if (ny >= 0 && ny < height && nx >= 0 && nx < width && mines[ny][nx]) {
          count++
        }
      }
    }
    str += count === 0 ? "." : String(count)
  }
  output.push(str)
}

console.log(output.join("\n"))
