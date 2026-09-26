// 🎮 CodinGame Puzzle - mirror-rotation
// https://www.codingame.com/training/medium/mirror-rotation

const [l, w] = readline().split(" ").map(Number)
const grid: string[][] = []
for (let i = 0; i < w; i++) grid.push(readline().split(""))
const startDir = "NESW".indexOf(readline().trim())

// Directions: 0 = N, 1 = E, 2 = S, 3 = W
const DX = [0, 1, 0, -1]
const DY = [-1, 0, 1, 0]
const SLASH = [1, 0, 3, 2] // N<->E, S<->W
const BACKSLASH = [3, 2, 1, 0] // N<->W, S<->E

let sx = 0
let sy = 0
const mirrors: [number, number][] = [] // (x, y) in reading order
for (let y = 0; y < w; y++) {
  for (let x = 0; x < l; x++) {
    const c = grid[y][x]
    if (c === "L") {
      sx = x
      sy = y
    } else if (c === "/" || c === "\\") mirrors.push([x, y])
  }
}

function reachesTarget(): boolean {
  const visited = new Set<number>()
  let x = sx
  let y = sy
  let d = startDir
  while (true) {
    x += DX[d]
    y += DY[d]
    if (x < 0 || y < 0 || x >= l || y >= w) return false
    const c = grid[y][x]
    if (c === "#") return false
    if (c === "T") return true
    if (c === "/") d = SLASH[d]
    else if (c === "\\") d = BACKSLASH[d]
    const key = (y * l + x) * 4 + d
    if (visited.has(key)) return false
    visited.add(key)
  }
}

const flip = (mask: number): void => {
  mirrors.forEach(([x, y], i) => {
    if (mask & (1 << i)) grid[y][x] = grid[y][x] === "/" ? "\\" : "/"
  })
}

const popcount = (n: number): number => {
  let c = 0
  for (; n; n &= n - 1) c++
  return c
}

const masks: number[] = []
for (let m = 1; m < 1 << mirrors.length; m++) masks.push(m)
masks.sort((a, b) => popcount(a) - popcount(b) || a - b)

for (const mask of masks) {
  flip(mask)
  const ok = reachesTarget()
  flip(mask)
  if (ok) {
    mirrors.forEach(([x, y], i) => {
      if (mask & (1 << i)) console.log(`${x} ${y}`)
    })
    break
  }
}
