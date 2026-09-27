// 🎮 CodinGame Multiplayer - cultist-wars
// https://www.codingame.com/multiplayer/bot-programming/cultist-wars
// Source: https://bitbucket.org/Nixerrr/cultist-wars/src
//
// 13x7, one action per turn. The leader converts adjacent (4-dir) neutrals
// or enemy cultists; cultists shoot for 7 − distance (range 6), the bullet
// hits the first obstacle/unit on the Bresenham line drawn from the lower y.
// Plan: convert when adjacent, else the best clear shot, else walk the leader
// to the nearest convertible unit.

const myId = parseInt(readline())
const [W, H] = readline().split(" ").map(Number)
const grid: string[] = []
for (let y = 0; y < H; y++) grid.push(readline())

interface Unit {
  id: number
  type: number // 0 cultist, 1 leader
  hp: number
  x: number
  y: number
  owner: number
}

// Cells between (x0, y0) and (x1, y1), Bresenham from the lower y.
function line(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  if (y0 > y1 || (y0 === y1 && x0 > x1)) [x0, y0, x1, y1] = [x1, y1, x0, y0]
  const cells: [number, number][] = []
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  let x = x0
  let y = y0
  while (true) {
    cells.push([x, y])
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
  return cells.slice(1, -1)
}

const STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const manhattan = (a: Unit, b: Unit) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

while (true) {
  const n = parseInt(readline())
  const units: Unit[] = []
  for (let i = 0; i < n; i++) {
    const [id, type, hp, x, y, owner] = readline().split(" ").map(Number)
    units.push({ id, type, hp, x, y, owner })
  }
  const occupied = new Set(units.map(u => u.y * W + u.x))
  const mine = units.filter(u => u.owner === myId)
  const enemies = units.filter(u => u.owner === 1 - myId)
  const neutrals = units.filter(u => u.owner === 2)
  const leader = mine.find(u => u.type === 1)

  // Damage enemy cultists could shoot at (x, y) next turn.
  const clearShot = (sx: number, sy: number, tx: number, ty: number) =>
    !line(sx, sy, tx, ty).some(([x, y]) => grid[y][x] === "x" || occupied.has(y * W + x))
  const dangerAt = (x: number, y: number) =>
    enemies
      .filter(e => e.type === 0)
      .reduce((s, e) => {
        const d = Math.abs(e.x - x) + Math.abs(e.y - y)
        return d <= 6 && clearShot(e.x, e.y, x, y) ? s + 7 - d : s
      }, 0)

  let action = "WAIT"
  let bestValue = 0
  const consider = (value: number, command: string) => {
    if (value > bestValue) {
      bestValue = value
      action = command
    }
  }
  // Conversions (enemy cultists are worth more: they also leave the enemy).
  if (leader) {
    for (const u of [...enemies.filter(e => e.type === 0), ...neutrals]) {
      if (manhattan(u, leader) === 1) consider(u.owner === 2 ? 8 : 12, `${leader.id} CONVERT ${u.id}`)
    }
  }
  // Shots.
  for (const s of mine.filter(u => u.type === 0)) {
    for (const tgt of enemies) {
      const d = manhattan(s, tgt)
      if (d > 6 || !clearShot(s.x, s.y, tgt.x, tgt.y)) continue
      const damage = 7 - d
      const kill = damage >= tgt.hp
      consider(damage + (kill ? (tgt.type === 1 ? 100 : 10) : 0) + (tgt.type === 1 ? 3 : 0), `${s.id} SHOOT ${tgt.id}`)
    }
  }
  // Leader walks (BFS through free cells) towards the nearest cell next to
  // a convertible unit, avoiding enemy fire.
  if (leader) {
    const targets = [...neutrals, ...enemies.filter(e => e.type === 0)]
    const free = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < W && y < H && grid[y][x] !== "x" && !occupied.has(y * W + x)
    const dist = new Int32Array(W * H).fill(-1)
    const queue: number[] = []
    for (const t of targets)
      for (const [dx, dy] of STEPS) {
        const x = t.x + dx
        const y = t.y + dy
        if ((free(x, y) || (x === leader.x && y === leader.y)) && dist[y * W + x] < 0) {
          dist[y * W + x] = 0
          queue.push(y * W + x)
        }
      }
    for (let h = 0; h < queue.length; h++) {
      const c = queue[h]
      for (const [dx, dy] of STEPS) {
        const x = (c % W) + dx
        const y = Math.floor(c / W) + dy
        if (free(x, y) && dist[y * W + x] < 0) {
          dist[y * W + x] = dist[c] + 1
          queue.push(y * W + x)
        }
      }
    }
    let bestStep: [number, number] | null = null
    let bestStepValue = -Infinity
    for (const [dx, dy] of STEPS) {
      const nx = leader.x + dx
      const ny = leader.y + dy
      if (!free(nx, ny) || dist[ny * W + nx] < 0) continue
      const v = -dist[ny * W + nx] - dangerAt(nx, ny) * 0.5
      if (v > bestStepValue) {
        bestStepValue = v
        bestStep = [nx, ny]
      }
    }
    if (bestStep)
      // While neutrals remain, racing for them beats chip-damage shots
      // (units at the end are the score).
      consider(
        (neutrals.length ? 4.5 : 1) + Math.min(0, bestStepValue + 20) * 0.01,
        `${leader.id} MOVE ${bestStep[0]} ${bestStep[1]}`
      )
  }
  // Cultists close in on the enemy leader when nothing better is available.
  const enemyLeader = enemies.find(e => e.type === 1)
  if (enemyLeader) {
    const closest = mine
      .filter(u => u.type === 0)
      .sort((a, b) => manhattan(a, enemyLeader) - manhattan(b, enemyLeader))[0]
    if (closest && manhattan(closest, enemyLeader) > 6)
      consider(0.5, `${closest.id} MOVE ${enemyLeader.x} ${enemyLeader.y}`)
  }
  console.log(action)
}
