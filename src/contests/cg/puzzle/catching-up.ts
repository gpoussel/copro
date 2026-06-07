// 🎮 CodinGame Puzzle - catching-up
// https://www.codingame.com/training/easy/catching-up

const K = parseInt(readline())
const grid: string[][] = []
let playerY = -1,
  playerX = -1

for (let i = 0; i < 10; i++) {
  const row = readline()
  grid.push(row.split(""))
  for (let j = 0; j < 10; j++) {
    const c = row[j]
    if (c === "L" || c === "P") {
      playerY = i
      playerX = j
      grid[i][j] = "-"
    }
    if (c === "l" || c === "E" || c === "d") {
      grid[i][j] = "-"
    }
  }
}

const dirs = [
  [-1, 0, "U"],
  [1, 0, "D"],
  [0, -1, "L"],
  [0, 1, "R"],
] as const

function isFloor(y: number, x: number): boolean {
  if (y < 0 || y >= 10 || x < 0 || x >= 10) return false
  return grid[y][x] !== "*"
}

// BFS shortest distance between two points
function bfsDist(sy: number, sx: number, ty: number, tx: number): number {
  if (sy === ty && sx === tx) return 0
  const visited = new Uint8Array(100)
  const q: number[] = [sy * 10 + sx]
  visited[sy * 10 + sx] = 1
  let head = 0,
    dist = 0
  while (head < q.length) {
    const size = q.length
    dist++
    while (head < size) {
      const pos = q[head++]
      const cy = (pos / 10) | 0,
        cx = pos % 10
      for (const [dy, dx] of dirs) {
        const ny = cy + dy,
          nx = cx + dx
        if (ny === ty && nx === tx) return dist
        const npos = ny * 10 + nx
        if (isFloor(ny, nx) && !visited[npos]) {
          visited[npos] = 1
          q.push(npos)
        }
      }
    }
  }
  return Infinity
}

// Simulate enemy best move: maximize BFS distance from player
function enemyBestMove(ey: number, ex: number, py: number, px: number): [number, number] {
  let bestDist = -1,
    bestY = ey,
    bestX = ex
  // Try stay + 4 dirs
  const options: [number, number][] = [[ey, ex], ...dirs.map(([dy, dx]) => [ey + dy, ex + dx] as [number, number])]
  for (const [ny, nx] of options) {
    if (ny < 0 || ny >= 10 || nx < 0 || nx >= 10) continue
    if (grid[ny][nx] === "*") continue
    const d = bfsDist(ny, nx, py, px)
    if (d > bestDist) {
      bestDist = d
      bestY = ny
      bestX = nx
    }
  }
  return [bestY, bestX]
}

// Pick player move: minimize BFS distance to enemy after enemy optimally responds
function bestPlayerMove(py: number, px: number, ey: number, ex: number, enemyWillMove: boolean): string {
  // Check if already adjacent (win condition)
  for (const [dy, dx, dir] of dirs) {
    if (py + dy === ey && px + dx === ex) return dir
  }

  let bestDir = ""
  let bestScore = Infinity

  for (const [dy, dx, dir] of dirs) {
    const ny = py + dy,
      nx = px + dx
    if (!isFloor(ny, nx)) continue

    // After player moves to (ny, nx), enemy responds if it's their turn
    let finalEy = ey,
      finalEx = ex
    if (enemyWillMove) {
      ;[finalEy, finalEx] = enemyBestMove(ey, ex, ny, nx)
    }

    // Score: BFS distance from new player pos to final enemy pos
    const d = bfsDist(ny, nx, finalEy, finalEx)
    if (d < bestScore) {
      bestScore = d
      bestDir = dir
    }
  }

  if (bestDir) return bestDir

  // Fallback: any valid move
  for (const [dy, dx, dir] of dirs) {
    if (isFloor(py + dy, px + dx)) return dir
  }
  return "D"
}

let turnsSinceEnemyMove = K // enemy moves on turn 1

// Game loop
while (true) {
  const line = readline().split(" ")
  const eneY = parseInt(line[0])
  const eneX = parseInt(line[1])

  const enemyWillMove = turnsSinceEnemyMove >= K
  const move = bestPlayerMove(playerY, playerX, eneY, eneX, enemyWillMove)
  console.log(move)

  // Update player position
  for (const [dy, dx, dir] of dirs) {
    if (dir === move) {
      playerY += dy
      playerX += dx
      break
    }
  }

  // Track turns since enemy moved
  if (enemyWillMove) {
    turnsSinceEnemyMove = 1
  } else {
    turnsSinceEnemyMove++
  }
}
