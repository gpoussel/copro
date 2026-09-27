// 🎮 CodinGame Multiplayer - a-code-of-ice-and-fire
// https://www.codingame.com/multiplayer/bot-programming/a-code-of-ice-and-fire
//
// 12×12, HQs at (0,0) / (11,11); owned cells connected to the HQ give +1
// income, each level-1 unit costs 10 and 1 upkeep. Wood 3: level 1 only (it
// kills level-1 units). Bot: every unit steps to the closest cell we do not
// own (distinct targets, enemy HQ first when adjacent, ties broken towards
// the enemy HQ); train on the free own/border cells closest to the enemy HQ
// while the gold covers the upkeep for ~5 turns.

const mineSpots = parseInt(readline())
for (let i = 0; i < mineSpots; i++) readline() // mine spots (used from Wood 1)
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

while (true) {
  let gold = parseInt(readline())
  let income = parseInt(readline())
  readline() // opponent gold
  readline() // opponent income
  const grid: string[] = []
  for (let y = 0; y < 12; y++) grid.push(readline())
  const bc = parseInt(readline())
  let enemyHQ = [11, 11]
  const buildings = new Set<number>()
  for (let i = 0; i < bc; i++) {
    const [owner, type, x, y] = readline().split(" ").map(Number)
    buildings.add(y * 12 + x)
    if (owner === 1 && type === 0) enemyHQ = [x, y]
  }
  const uc = parseInt(readline())
  const myUnits: { id: number; x: number; y: number }[] = []
  const occupied = new Set<number>()
  const enemyUnits = new Set<number>()
  for (let i = 0; i < uc; i++) {
    const [owner, id, , x, y] = readline().split(" ").map(Number)
    if (owner === 0) myUnits.push({ id, x, y })
    else enemyUnits.add(y * 12 + x)
    occupied.add(y * 12 + x)
  }
  const cell = (x: number, y: number) => (x < 0 || y < 0 || x >= 12 || y >= 12 ? "#" : grid[y][x])
  const hqDist = (x: number, y: number) => Math.abs(x - enemyHQ[0]) + Math.abs(y - enemyHQ[1])
  const actions: string[] = []
  const reserved = new Set<number>()
  // Units: nearest unowned cell by BFS.
  myUnits.sort((a, b) => hqDist(a.x, a.y) - hqDist(b.x, b.y))
  for (const u of myUnits) {
    const dist = new Map([[u.y * 12 + u.x, 0]])
    const firstStep = new Map<number, number>()
    const q = [u.y * 12 + u.x]
    let target = -1
    let bestKey = Infinity
    for (let h = 0; h < q.length; h++) {
      const c = q[h]
      const cx = c % 12
      const cy = Math.floor(c / 12)
      const ch = cell(cx, cy)
      if (c !== q[0] && ch !== "O" && !reserved.has(c)) {
        const key = dist.get(c)! * 100 + hqDist(cx, cy) - (cx === enemyHQ[0] && cy === enemyHQ[1] ? 1000 : 0)
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
        // Own units and buildings block (enemy HQ is a target).
        if (occupied.has(n) && !enemyUnits.has(n)) continue
        if (buildings.has(n) && !(nx === enemyHQ[0] && ny === enemyHQ[1])) continue
        dist.set(n, dist.get(c)! + 1)
        firstStep.set(n, firstStep.get(c) ?? n)
        q.push(n)
      }
    }
    if (target < 0) continue
    reserved.add(target)
    const step = firstStep.get(target)!
    if (reserved.has(step) && step !== target) continue
    reserved.add(step)
    actions.push(`MOVE ${u.id} ${step % 12} ${Math.floor(step / 12)}`)
  }
  // Training on free cells in or next to our active territory.
  const spots: number[] = []
  for (let y = 0; y < 12; y++)
    for (let x = 0; x < 12; x++) {
      const c = y * 12 + x
      if (cell(x, y) === "#" || occupied.has(c) || buildings.has(c) || reserved.has(c)) continue
      if (cell(x, y) === "O" || DIRS.some(([dx, dy]) => cell(x + dx, y + dy) === "O")) spots.push(c)
    }
  spots.sort((a, b) => hqDist(a % 12, Math.floor(a / 12)) - hqDist(b % 12, Math.floor(b / 12)))
  for (const c of spots) {
    // Upkeep may exceed income while the gold covers it for a while.
    if (gold < 10 || gold - 10 + 5 * (income - 1) < 0) break
    actions.push(`TRAIN 1 ${c % 12} ${Math.floor(c / 12)}`)
    gold -= 10
    income -= 1
  }
  console.log(actions.length ? actions.join(";") : "WAIT")
}
