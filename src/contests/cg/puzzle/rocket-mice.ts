// 🎮 CodinGame Puzzle - rocket-mice
// https://www.codingame.com/training/hard/rocket-mice

// Direct simulation of the turn phases described in the statement.

interface Animal {
  x: number
  y: number
  px: number
  py: number
  dir: number
  cat: boolean
}

const DIRS = "NESW"
const DX = [0, 1, 0, -1]
const DY = [-1, 0, 1, 0]
const ccw = (d: number): number => (d + 3) % 4

const [boardW, boardH] = readline().split(" ").map(Number)
const playerCount = Number(readline())
const doorCount = Number(readline())
const turnCount = Number(readline())
const rockets: number[] = []
for (let i = 0; i < playerCount; i++) {
  const [x, y] = readline().split(" ").map(Number)
  rockets.push(y * boardW + x)
}
// Door: spawn position just off the grid and direction of travel
const doors: [number, number, number][] = []
for (let i = 0; i < doorCount; i++) {
  const [c, wall] = readline().split(" ")
  const v = Number(c)
  if (wall === "N") doors.push([v, -1, 2])
  else if (wall === "S") doors.push([v, boardH, 0])
  else if (wall === "W") doors.push([-1, v, 1])
  else doors.push([boardW, v, 3])
}
const placements: [number, number][] = []
for (let i = 0; i < turnCount; i++) {
  const [x, y, d] = readline().split(" ")
  placements.push([Number(y) * boardW + Number(x), DIRS.indexOf(d)])
}

const isPit = (x: number, y: number): boolean => (x === 0 || x === boardW - 1) && (y === 0 || y === boardH - 1)
const inside = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < boardW && y < boardH

const arrows = new Map<number, number>()
const owned: number[][] = Array.from({ length: playerCount }, () => [])
const scores = new Array<number>(playerCount).fill(0)
let animals: Animal[] = []
let spawned = 0

function runSteps(full: boolean): void {
  // 1. Spawn
  spawned++
  for (const [x, y, dir] of doors) animals.push({ x, y, px: x, py: y, dir, cat: spawned % 10 === 0 })
  // 2. Move
  for (const a of animals) {
    a.px = a.x
    a.py = a.y
    a.x += DX[a.dir]
    a.y += DY[a.dir]
  }
  animals = animals.filter(a => !isPit(a.x, a.y))
  // 3-4. Rockets: mice first, then cats
  for (const cats of [false, true]) {
    animals = animals.filter(a => {
      if (a.cat !== cats) return true
      const p = rockets.indexOf(a.y * boardW + a.x)
      if (p < 0) return true
      scores[p] = Math.max(0, scores[p] + (cats ? -10 : 1))
      return false
    })
  }
  if (!full) return
  // 5. Mice are eaten (same square or swapped positions)
  const catAt = new Set<number>()
  const catMoves = new Set<string>()
  for (const a of animals) {
    if (!a.cat) continue
    catAt.add(a.y * boardW + a.x)
    catMoves.add(`${a.px},${a.py},${a.x},${a.y}`)
  }
  animals = animals.filter(
    a => a.cat || !(catAt.has(a.y * boardW + a.x) || catMoves.has(`${a.x},${a.y},${a.px},${a.py}`))
  )
  // 6. Redirect by arrows, then walls
  for (const a of animals) {
    const arrow = arrows.get(a.y * boardW + a.x)
    if (arrow !== undefined) a.dir = arrow
    while (!inside(a.x + DX[a.dir], a.y + DY[a.dir])) a.dir = ccw(a.dir)
  }
}

for (let t = 0; t < turnCount; t++) {
  runSteps(true)
  // 7. Place an arrow (a player keeps at most 3)
  const p = t % playerCount
  const [cell, dir] = placements[t]
  owned[p].push(cell)
  arrows.set(cell, dir)
  if (owned[p].length > 3) arrows.delete(owned[p].shift() as number)
}
runSteps(false)
console.log(scores.join("\n"))
