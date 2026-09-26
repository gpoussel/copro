// 🎮 CodinGame Puzzle - bouncing-barry
// https://www.codingame.com/training/medium/bouncing-barry

const directions = readline().trim().split(/\s+/)
const bounces = readline().trim().split(/\s+/).map(Number)

const DELTA: { [d: string]: [number, number] } = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }
const OFFSET = 1 << 25
const key = (x: number, y: number) => (x + OFFSET) * 2 * OFFSET + (y + OFFSET)

// Only '#' tiles are stored; landing on one again turns it back to '.'
const lit = new Map<number, [number, number]>()
let x = 0
let y = 0
directions.forEach((d, i) => {
  const [dx, dy] = DELTA[d]
  for (let b = 0; b < bounces[i]; b++) {
    x += dx
    y += dy
    const k = key(x, y)
    if (lit.has(k)) lit.delete(k)
    else lit.set(k, [x, y])
  }
})

if (lit.size === 0) {
  console.log(".")
} else {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  lit.forEach(([px, py]) => {
    minX = Math.min(minX, px)
    maxX = Math.max(maxX, px)
    minY = Math.min(minY, py)
    maxY = Math.max(maxY, py)
  })
  for (let row = minY; row <= maxY; row++) {
    let line = ""
    for (let col = minX; col <= maxX; col++) line += lit.has(key(col, row)) ? "#" : "."
    console.log(line)
  }
}
