// 🎮 CodinGame Puzzle - catalytic-microparticles
// https://www.codingame.com/training/medium/catalytic-microparticles

const [L, W, H] = readline().split(" ").map(Number)
// Grid padded with one empty layer on every side so the exterior is connected
const X = L + 2
const Y = H + 2
const Z = W + 2
const idx = (x: number, y: number, z: number): number => (x * Y + y) * Z + z
const solid: boolean[] = new Array(X * Y * Z).fill(false)
for (let l = 0; l < L; l++) {
  const slices = readline().split(" ")
  for (let h = 0; h < H; h++) {
    for (let w = 0; w < W; w++) {
      if (slices[h][w] === "#") solid[idx(l + 1, h + 1, w + 1)] = true
    }
  }
}

const neighbors: [number, number, number][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

// Flood the exterior, counting every face between outside air and solid
const outside: boolean[] = new Array(X * Y * Z).fill(false)
outside[idx(0, 0, 0)] = true
const stack: [number, number, number][] = [[0, 0, 0]]
let surface = 0
let outsideCount = 0
while (stack.length > 0) {
  const [x, y, z] = stack.pop()!
  outsideCount++
  for (const [dx, dy, dz] of neighbors) {
    const nx = x + dx
    const ny = y + dy
    const nz = z + dz
    if (nx < 0 || ny < 0 || nz < 0 || nx >= X || ny >= Y || nz >= Z) continue
    const n = idx(nx, ny, nz)
    if (solid[n]) surface++
    else if (!outside[n]) {
      outside[n] = true
      stack.push([nx, ny, nz])
    }
  }
}

const solidVolume = solid.filter(s => s).length
const bulkVolume = X * Y * Z - outsideCount
console.log(`${(surface / solidVolume).toFixed(4)} ${(solidVolume / bulkVolume).toFixed(4)}`)
