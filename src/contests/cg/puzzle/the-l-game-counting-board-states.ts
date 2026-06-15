// 🎮 CodinGame Puzzle - the-l-game-counting-board-states
// https://www.codingame.com/

const [height, width, n]: number[] = readline()
  .split(" ")
  .map((v: string) => parseInt(v, 10))

const total: number = height * width

// The 8 orientations of an L tetromino, as lists of [row, col] cell offsets.
const baseShapes: number[][][] = [
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  [
    [0, 1],
    [1, 1],
    [2, 1],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [0, 0],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [0, 2],
  ],
]

// Every legal L placement as a bitmask (BigInt) over the board cells.
const placements: bigint[] = []
for (const shape of baseShapes) {
  let maxR: number = 0
  let maxC: number = 0
  for (const [r, c] of shape) {
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }
  for (let baseR = 0; baseR + maxR < height; baseR++) {
    for (let baseC = 0; baseC + maxC < width; baseC++) {
      let mask: bigint = 0n
      for (const [r, c] of shape) {
        const idx: number = (baseR + r) * width + (baseC + c)
        mask |= 1n << BigInt(idx)
      }
      placements.push(mask)
    }
  }
}

// Number of ways to place the N identical blockers in the cells left empty by
// the two Ls: C(total - 8, N).
const empty: number = total - 8
let combos: bigint = 0n
if (empty >= 0 && n <= empty) {
  let num: bigint = 1n
  let den: bigint = 1n
  for (let i = 0; i < n; i++) {
    num *= BigInt(empty - i)
    den *= BigInt(i + 1)
  }
  combos = num / den
}

// Count ordered (red, blue) pairs of non-overlapping L placements.
let pairs: bigint = 0n
const count: number = placements.length
for (let i = 0; i < count; i++) {
  const a: bigint = placements[i]
  for (let j = 0; j < count; j++) {
    if (i === j) continue
    if ((a & placements[j]) !== 0n) continue
    pairs += 1n
  }
}

console.log((pairs * combos).toString())
