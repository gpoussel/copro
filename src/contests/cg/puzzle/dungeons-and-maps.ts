// 🎮 CodinGame Puzzle - dungeons-and-maps
// https://www.codingame.com/training/easy/dungeons-and-maps

const [W, H] = readline().split(" ").map(Number)
const [startRow, startCol] = readline().split(" ").map(Number)
const N = parseInt(readline())

const maps: string[][] = []
for (let i = 0; i < N; i++) {
  const map: string[] = []
  for (let r = 0; r < H; r++) {
    map.push(readline())
  }
  maps.push(map)
}

function getPathLength(map: string[], sr: number, sc: number): number | null {
  const visited = new Set<string>()
  let r = sr
  let c = sc
  let steps = 0

  while (true) {
    const key = `${r},${c}`
    if (visited.has(key)) {
      // Loop detected — no valid path
      return null
    }
    visited.add(key)

    if (r < 0 || r >= H || c < 0 || c >= W) {
      // Out of bounds
      return null
    }

    const cell = map[r][c]

    if (cell === "T") {
      return steps + 1
    }

    if (cell === "^") {
      r -= 1
    } else if (cell === "v") {
      r += 1
    } else if (cell === "<") {
      c -= 1
    } else if (cell === ">") {
      c += 1
    } else {
      // Empty, wall, or any non-navigable cell
      return null
    }

    steps++
  }
}

let bestIndex = -1
let bestLength = Infinity

for (let i = 0; i < N; i++) {
  const length = getPathLength(maps[i], startRow, startCol)
  if (length !== null && length < bestLength) {
    bestLength = length
    bestIndex = i
  }
}

if (bestIndex === -1) {
  console.log("TRAP")
} else {
  console.log(bestIndex)
}
