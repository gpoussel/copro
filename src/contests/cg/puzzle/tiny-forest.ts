// 🎮 CodinGame Puzzle - tiny-forest
// https://www.codingame.com/training/medium/tiny-forest

const landWidth = parseInt(readline(), 10)
const landHeight = parseInt(readline(), 10)
const land: string[] = []
for (let i = 0; i < landHeight; i++) land.push(readline())

const YEARS = 33
const GROW_TIME = 10
const EMPTY = -1
const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]

// Per cell: year the seed was planted (EMPTY if none) and year it became a tree (Infinity if not)
function simulate(seedRow: number, seedCol: number): number {
  const cells = landWidth * landHeight
  const plantedAt = new Array<number>(cells).fill(EMPTY)
  const treeSince = new Array<number>(cells).fill(Infinity)
  for (let r = 0; r < landHeight; r++) {
    for (let c = 0; c < landWidth; c++) if (land[r][c] === "Y") treeSince[r * landWidth + c] = 0
  }
  plantedAt[seedRow * landWidth + seedCol] = 0

  for (let year = 1; year <= YEARS; year++) {
    for (let i = 0; i < cells; i++) {
      if (treeSince[i] === Infinity && plantedAt[i] !== EMPTY && plantedAt[i] + GROW_TIME === year) treeSince[i] = year
    }
    for (let r = 0; r < landHeight; r++) {
      for (let c = 0; c < landWidth; c++) {
        if (treeSince[r * landWidth + c] >= year) continue
        for (const [dr, dc] of DIRS) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nc < 0 || nr >= landHeight || nc >= landWidth) continue
          const j = nr * landWidth + nc
          if (treeSince[j] === Infinity && plantedAt[j] === EMPTY) plantedAt[j] = year
        }
      }
    }
  }

  let trees = 0
  for (let i = 0; i < cells; i++) if (treeSince[i] !== Infinity) trees++
  return trees
}

let bestForest = 0
for (let r = 0; r < landHeight; r++) {
  for (let c = 0; c < landWidth; c++) {
    if (land[r][c] === "Y") continue
    bestForest = Math.max(bestForest, simulate(r, c))
  }
}
if (bestForest === 0) {
  // No free spot to plant: only the existing trees spread
  let existing = 0
  for (const row of land) for (const ch of row) if (ch === "Y") existing++
  bestForest = existing
}
console.log(bestForest)
