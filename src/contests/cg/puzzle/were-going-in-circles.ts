// 🎮 CodinGame Puzzle - were-going-in-circles
// https://www.codingame.com/training/medium/were-going-in-circles

const [gridW, gridH] = readline().split(" ").map(Number)
const arrowGrid: string[] = []
for (let i = 0; i < gridH; i++) arrowGrid.push(readline())

const STEP: { [arrow: string]: [number, number] } = { "^": [-1, 0], v: [1, 0], "<": [0, -1], ">": [0, 1] }

// Functional graph: each arrow points to the closest arrow in its direction (-1 if none)
const nextArrow: number[] = []
for (let r = 0; r < gridH; r++) {
  for (let c = 0; c < gridW; c++) {
    const step = STEP[arrowGrid[r][c]]
    let target = -1
    if (step) {
      let nr = r + step[0]
      let nc = c + step[1]
      while (nr >= 0 && nc >= 0 && nr < gridH && nc < gridW) {
        if (arrowGrid[nr][nc] !== ".") {
          target = nr * gridW + nc
          break
        }
        nr += step[0]
        nc += step[1]
      }
    }
    nextArrow.push(target)
  }
}

// 0 = unvisited, 1 = on current path, 2 = done
const visitState = new Array<number>(gridW * gridH).fill(0)
let loopCount = 0
for (let start = 0; start < gridW * gridH; start++) {
  const path: number[] = []
  let node = start
  while (node !== -1 && visitState[node] === 0) {
    visitState[node] = 1
    path.push(node)
    node = nextArrow[node]
  }
  if (node !== -1 && visitState[node] === 1) loopCount++
  for (const p of path) visitState[p] = 2
}
console.log(loopCount)
