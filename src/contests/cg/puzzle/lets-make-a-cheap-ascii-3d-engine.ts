// 🎮 CodinGame Puzzle - lets-make-a-cheap-ascii-3d-engine
// https://www.codingame.com/training/hard/lets-make-a-cheap-ascii-3d-engine

// Classic grid ray casting (DDA): for each of the 61 rays, walk from tile
// boundary to tile boundary until a filled tile is entered. Crossing a
// vertical grid line means a v-wall (","), a horizontal one an h-wall (".").
// The distance to the screen plane is D' = D * cos(ray angle - camera angle),
// and the column is a centered block of 2 * round(1500 / D') + 1 chars.

const [camX, camY, camA] = readline().trim().split(/\s+/).map(Number)
const mapN = parseInt(readline())
const roomMap: string[] = []
for (let i = 0; i < mapN; i++) roomMap.push(readline())

const ROWS = 15
const frame: string[][] = Array.from({ length: ROWS }, () => new Array<string>(61).fill(" "))

for (let col = 0; col < 61; col++) {
  const rel = ((col - 30) * Math.PI) / 180
  const ang = (camA * Math.PI) / 180 + rel
  const dx = Math.cos(ang)
  const dy = Math.sin(ang)
  let tx = Math.floor(camX / 100)
  let ty = Math.floor(camY / 100)
  const stepX = dx > 0 ? 1 : -1
  const stepY = dy > 0 ? 1 : -1
  // Ray parameter at the next vertical / horizontal grid line, and increments
  const deltaX = Math.abs(dx) < 1e-12 ? Infinity : 100 / Math.abs(dx)
  const deltaY = Math.abs(dy) < 1e-12 ? Infinity : 100 / Math.abs(dy)
  let nextX = Math.abs(dx) < 1e-12 ? Infinity : (dx > 0 ? (tx + 1) * 100 - camX : camX - tx * 100) / Math.abs(dx)
  let nextY = Math.abs(dy) < 1e-12 ? Infinity : (dy > 0 ? (ty + 1) * 100 - camY : camY - ty * 100) / Math.abs(dy)
  let dist = 0
  let vWall = false
  for (;;) {
    if (nextX < nextY) {
      dist = nextX
      nextX += deltaX
      tx += stepX
      vWall = true
    } else {
      dist = nextY
      nextY += deltaY
      ty += stepY
      vWall = false
    }
    if (roomMap[ty][tx] === "#") break
  }
  const h = Math.min(7, Math.round(1500 / (dist * Math.cos(rel))))
  for (let r = 7 - h; r <= 7 + h; r++) frame[r][col] = vWall ? "," : "."
}

for (const row of frame) console.log(row.join(""))
