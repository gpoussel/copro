// 🎮 CodinGame Puzzle - asteroids
// https://www.codingame.com/training/easy/asteroids

const [W, H, t1, t2, t3] = readline().split(" ").map(Number)

const pic1: string[][] = []
const pic2: string[][] = []

for (let i = 0; i < H; i++) {
  const line = readline().split(" ")
  pic1.push(line[0].split(""))
  pic2.push(line[1].split(""))
}

// Find position of each asteroid in both pictures
interface AsteroidPos {
  x1: number
  y1: number
  x2: number
  y2: number
}

const asteroids = new Map<string, AsteroidPos>()

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const c1 = pic1[y][x]
    if (c1 !== ".") {
      if (!asteroids.has(c1)) asteroids.set(c1, { x1: 0, y1: 0, x2: 0, y2: 0 })
      asteroids.get(c1)!.x1 = x
      asteroids.get(c1)!.y1 = y
    }
    const c2 = pic2[y][x]
    if (c2 !== ".") {
      if (!asteroids.has(c2)) asteroids.set(c2, { x1: 0, y1: 0, x2: 0, y2: 0 })
      asteroids.get(c2)!.x2 = x
      asteroids.get(c2)!.y2 = y
    }
  }
}

// Build output grid (filled with dots)
const output: string[][] = Array.from({ length: H }, () => Array(W).fill("."))

// Process asteroids from Z to A (farthest to closest), so closest overwrites
const sortedKeys = [...asteroids.keys()].sort((a, b) => b.charCodeAt(0) - a.charCodeAt(0))

for (const letter of sortedKeys) {
  const { x1, y1, x2, y2 } = asteroids.get(letter)!

  // Velocity: (x2 - x1) / (t2 - t1) per unit time
  const dt = t2 - t1
  const dtFinal = t3 - t1

  // Position at t3 = pos1 + velocity * (t3 - t1)
  // x3 = x1 + (x2 - x1) / dt * dtFinal
  const x3 = Math.floor(x1 + ((x2 - x1) / dt) * dtFinal)
  const y3 = Math.floor(y1 + ((y2 - y1) / dt) * dtFinal)

  // Only place if within bounds
  if (x3 >= 0 && x3 < W && y3 >= 0 && y3 < H) {
    output[y3][x3] = letter
  }
}

// Print output
for (const row of output) {
  console.log(row.join(""))
}
