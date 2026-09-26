// 🎮 CodinGame Puzzle - gravity-centrifuge
// https://www.codingame.com/training/medium/gravity-centrifuge

const [, height] = readline().split(" ").map(Number)
const bitstream = readline().trim()
let grid: string[][] = []
for (let i = 0; i < height; i++) grid.push(readline().split(""))

// Only whether the tumble count is zero, odd or even matters: once tumbled,
// the landscape alternates between two stable shapes.
let momentumA = 1
let momentumB = 1
let parity = 0
let tumbled = false
let bit = 0
for (let i = bitstream.length - 1; i >= 0; i--) {
  const digit = parseInt(bitstream[i], 8)
  for (let k = 0; k < 3; k++, bit++) {
    const set = (digit >> k) & 1
    if (bit % 2 === 0) {
      if (set) parity ^= momentumA
      momentumB = (momentumB + momentumA) % 2
    } else {
      if (set) parity ^= momentumB
      momentumA = (momentumA + momentumB) % 2
    }
    if (set) tumbled = true
  }
}

function tumble(g: string[][]): string[][] {
  const h = g.length
  const w = g[0].length
  // Rotate counterclockwise: new row r is old column w-1-r
  const rotated: string[][] = []
  for (let r = 0; r < w; r++) {
    const row: string[] = []
    for (let c = 0; c < h; c++) row.push(g[c][w - 1 - r])
    rotated.push(row)
  }
  // Let the heavy bits fall to the bottom of each column
  for (let c = 0; c < h; c++) {
    let heavy = 0
    for (let r = 0; r < w; r++) if (rotated[r][c] === "#") heavy++
    for (let r = 0; r < w; r++) rotated[r][c] = r >= w - heavy ? "#" : "."
  }
  return rotated
}

if (tumbled) {
  grid = tumble(grid)
  if (parity === 0) grid = tumble(grid)
}
console.log(grid.map(row => row.join("")).join("\n"))
