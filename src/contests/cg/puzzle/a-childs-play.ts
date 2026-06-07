// 🎮 CodinGame Puzzle - a-childs-play
// https://www.codingame.com/training/easy/a-childs-play

const [w, h] = readline().split(" ").map(Number)
const n = BigInt(readline().trim())
const grid: string[] = []
let startX = 0,
  startY = 0

for (let y = 0; y < h; y++) {
  const line = readline()
  grid.push(line)
  const ox = line.indexOf("O")
  if (ox !== -1) {
    startX = ox
    startY = y
  }
}

// Directions: 0=up, 1=right, 2=down, 3=left
const dx = [0, 1, 0, -1]
const dy = [-1, 0, 1, 0]

function cell(x: number, y: number): string {
  return grid[y][x]
}

function isObstacle(x: number, y: number): boolean {
  if (x < 0 || x >= w || y < 0 || y >= h) return true
  return grid[y][x] === "#"
}

// Simulate one step: returns new [x, y, dir]
function step(x: number, y: number, dir: number): [number, number, number] {
  // Turn right until no obstacle ahead
  let turns = 0
  while (isObstacle(x + dx[dir], y + dy[dir])) {
    dir = (dir + 1) % 4
    turns++
    if (turns > 4) break // Shouldn't happen per constraints
  }
  // Move forward
  return [x + dx[dir], y + dy[dir], dir]
}

// Cycle detection using state = (x, y, dir)
// We store the step index at which we first saw each state
const seen = new Map<string, bigint>()
let x = startX
let y = startY
let dir = 0 // facing up

let stepsDone = 0n

while (stepsDone < n) {
  const key = `${x},${y},${dir}`
  if (seen.has(key)) {
    // Found a cycle
    const cycleStart = seen.get(key)!
    const cycleLen = stepsDone - cycleStart
    const remaining = (n - stepsDone) % cycleLen
    // Simulate remaining steps
    for (let i = 0n; i < remaining; i++) {
      ;[x, y, dir] = step(x, y, dir)
    }
    break
  }
  seen.set(key, stepsDone)
  ;[x, y, dir] = step(x, y, dir)
  stepsDone++
}

console.log(`${x} ${y}`)
