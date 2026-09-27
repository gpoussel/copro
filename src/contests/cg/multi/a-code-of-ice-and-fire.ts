// 🎮 CodinGame Multiplayer - a-code-of-ice-and-fire
// https://www.codingame.com/multiplayer/bot-programming/a-code-of-ice-and-fire
//
// 12×12, HQs at (0,0) / (11,11); owned cells connected to the HQ give +1
// income. Units: level 1/2/3 cost 10/20/30 and 1/4/20 upkeep; a unit can
// only take a cell held by a lower-level enemy unit (level 3 beats all), and
// cells next to an enemy tower need level 3. Mines (20 + 4·mines) give +4,
// towers cost 15.
// Bot:
// - units (closest to the enemy HQ first) step to the nearest cell they can
//   legally take (enemy HQ first), distinct targets;
// - a tower next to our HQ when enemy units come within 3 of it;
// - mines on free spots inside our territory while the income is small;
// - training on free own/border cells closest to the enemy HQ, at the
//   level needed to take the cell (enemy unit + 1, 3 near towers), while
//   gold covers cost and a few turns of upkeep.

const mineSpots: [number, number][] = []
const spotCount = parseInt(readline())
for (let i = 0; i < spotCount; i++) mineSpots.push(readline().split(" ").map(Number) as [number, number])
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const COST = [0, 10, 20, 30]
const UPKEEP = [0, 1, 4, 20]
let turn = 0

while (true) {
  turn++
  let gold = parseInt(readline())
  let income = parseInt(readline())
  readline() // opponent gold
  readline() // opponent income
  const grid: string[] = []
  for (let y = 0; y < 12; y++) grid.push(readline())
  const bc = parseInt(readline())
  let enemyHQ = [11, 11]
  let myHQ = [0, 0]
  const buildings = new Set<number>()
  const enemyTowers: number[] = []
  let myMines = 0
  for (let i = 0; i < bc; i++) {
    const [owner, type, x, y] = readline().split(" ").map(Number)
    buildings.add(y * 12 + x)
    if (owner === 1 && type === 0) enemyHQ = [x, y]
    if (owner === 0 && type === 0) myHQ = [x, y]
    if (owner === 1 && type === 2) enemyTowers.push(y * 12 + x)
    if (owner === 0 && type === 1) myMines++
  }
  const uc = parseInt(readline())
  const myUnits: { id: number; level: number; x: number; y: number }[] = []
  const occupied = new Set<number>()
  const enemyLevel = new Map<number, number>()
  for (let i = 0; i < uc; i++) {
    const [owner, id, level, x, y] = readline().split(" ").map(Number)
    if (owner === 0) myUnits.push({ id, level, x, y })
    else enemyLevel.set(y * 12 + x, level)
    occupied.add(y * 12 + x)
  }
  const cell = (x: number, y: number) => (x < 0 || y < 0 || x >= 12 || y >= 12 ? "#" : grid[y][x])
  const hqDist = (x: number, y: number) => Math.abs(x - enemyHQ[0]) + Math.abs(y - enemyHQ[1])
  // Cells an active enemy tower protects (itself and its neighbours).
  const guarded = new Set<number>()
  for (const t of enemyTowers) {
    const tx = t % 12
    const ty = Math.floor(t / 12)
    if (cell(tx, ty) !== "X") continue
    guarded.add(t)
    for (const [dx, dy] of DIRS) if (cell(tx + dx, ty + dy) === "X") guarded.add((ty + dy) * 12 + tx + dx)
  }
  // Level needed to enter a cell (0 = impossible for everybody but 3).
  const need = (c: number) => {
    const x = c % 12
    const y = Math.floor(c / 12)
    if (x === enemyHQ[0] && y === enemyHQ[1]) return guarded.has(c) ? 3 : 1
    if (buildings.has(c) && cell(x, y) !== "O") return guarded.has(c) ? 3 : 1 // enemy mine / tower
    let lvl = 1
    if (enemyLevel.has(c)) lvl = Math.min(3, enemyLevel.get(c)! + 1)
    if (guarded.has(c)) lvl = 3
    return lvl
  }
  const actions: string[] = []
  const reserved = new Set<number>()

  // Units: nearest cell they may take, by BFS through passable cells.
  myUnits.sort((a, b) => hqDist(a.x, a.y) - hqDist(b.x, b.y))
  for (const u of myUnits) {
    const start = u.y * 12 + u.x
    const dist = new Map([[start, 0]])
    const firstStep = new Map<number, number>()
    const q = [start]
    let target = -1
    let bestKey = Infinity
    for (let h = 0; h < q.length; h++) {
      const c = q[h]
      const cx = c % 12
      const cy = Math.floor(c / 12)
      if (c !== start && cell(cx, cy) !== "O" && !reserved.has(c)) {
        const key = dist.get(c)! * 100 + hqDist(cx, cy) - (cx === enemyHQ[0] && cy === enemyHQ[1] ? 10000 : 0)
        if (key < bestKey) {
          bestKey = key
          target = c
        }
      }
      if (dist.get(c)! > 12) continue
      for (const [dx, dy] of DIRS) {
        const nx = cx + dx
        const ny = cy + dy
        const n = ny * 12 + nx
        if (cell(nx, ny) === "#" || dist.has(n)) continue
        if (occupied.has(n) && !enemyLevel.has(n)) continue // our own units
        if (buildings.has(n) && cell(nx, ny) === "O") continue // our buildings
        if (need(n) > u.level) continue
        dist.set(n, dist.get(c)! + 1)
        firstStep.set(n, firstStep.get(c) ?? n)
        q.push(n)
      }
    }
    if (target < 0) continue
    const step = firstStep.get(target)!
    if (reserved.has(step)) continue
    reserved.add(target)
    reserved.add(step)
    actions.push(`MOVE ${u.id} ${step % 12} ${Math.floor(step / 12)}`)
  }

  // Tower next to our HQ when enemy units come close.
  const threat = [...enemyLevel.keys()].some(c => Math.abs((c % 12) - myHQ[0]) + Math.abs(Math.floor(c / 12) - myHQ[1]) <= 3)
  if (threat && gold >= 15) {
    for (const [dx, dy] of DIRS) {
      const x = myHQ[0] + dx
      const y = myHQ[1] + dy
      const c = y * 12 + x
      if (cell(x, y) !== "O" || buildings.has(c) || occupied.has(c) || reserved.has(c)) continue
      actions.push(`BUILD TOWER ${x} ${y}`)
      buildings.add(c)
      gold -= 15
      break
    }
  }
  // Mines inside our territory while the income is small.
  const mineCost = 20 + 4 * myMines
  if (turn > 3 && income < 25 && gold >= mineCost + 20) {
    const spot = mineSpots
      .filter(([x, y]) => cell(x, y) === "O" && !buildings.has(y * 12 + x) && !occupied.has(y * 12 + x))
      .sort((a, b) => hqDist(b[0], b[1]) - hqDist(a[0], a[1]))[0]
    if (spot) {
      actions.push(`BUILD MINE ${spot[0]} ${spot[1]}`)
      buildings.add(spot[1] * 12 + spot[0])
      gold -= mineCost
    }
  }
  // Training on free own/border cells, at the level each cell needs.
  const spots: number[] = []
  for (let y = 0; y < 12; y++)
    for (let x = 0; x < 12; x++) {
      const c = y * 12 + x
      if (cell(x, y) === "#" || reserved.has(c)) continue
      if (occupied.has(c) && !enemyLevel.has(c)) continue
      if (buildings.has(c) && cell(x, y) === "O") continue
      if (cell(x, y) === "O" || DIRS.some(([dx, dy]) => cell(x + dx, y + dy) === "O")) spots.push(c)
    }
  // Killing enemy units first, then towards the enemy HQ.
  spots.sort((a, b) => {
    const ka = (enemyLevel.has(a) ? -50 : 0) + hqDist(a % 12, Math.floor(a / 12))
    const kb = (enemyLevel.has(b) ? -50 : 0) + hqDist(b % 12, Math.floor(b / 12))
    return ka - kb
  })
  for (const c of spots) {
    const lvl = cell(c % 12, Math.floor(c / 12)) === "O" ? 1 : need(c)
    if (lvl === 3 && !enemyLevel.has(c) && !(c % 12 === enemyHQ[0] && Math.floor(c / 12) === enemyHQ[1])) continue
    // Cost now, and the upkeep must stay covered for a few turns.
    if (gold < COST[lvl] || gold - COST[lvl] + 4 * (income - UPKEEP[lvl]) < 0) continue
    actions.push(`TRAIN ${lvl} ${c % 12} ${Math.floor(c / 12)}`)
    gold -= COST[lvl]
    income -= UPKEEP[lvl]
    reserved.add(c)
  }
  console.log(actions.length ? actions.join(";") : "WAIT")
}
