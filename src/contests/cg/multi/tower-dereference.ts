// 🎮 CodinGame Multiplayer - tower-dereference
// https://www.codingame.com/multiplayer/bot-programming/tower-dereference
// Referee: https://github.com/eulerscheZahl/TowerDefense (constants from it)
//
// Attackers walk the canyon towards the opponent's base; towers are built on
// plateaus. Player 0 defends the left side. Upgrades are far better value
// than new towers (gun damage 5 -> 30, reload 5 -> 2), so: 3 gun towers and
// a glue tower on the cells covering the most canyon near our base, then
// every upgrade of the best-placed gun tower (damage, reload, range levels),
// then the next one; new gun towers only once all are maxed.

const GUN_COST = 100
const UPGRADE_COST = [50, 100, 150]
const GUN_RANGE = 3
const GLUE_COST = 70
const BASE_TOWERS = 3 // gun towers before upgrading

const myId = parseInt(readline())
const [W, H] = readline().split(" ").map(Number)
const map: string[] = []
for (let y = 0; y < H; y++) map.push(readline())
const canyon: [number, number][] = []
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (map[y][x] === ".") canyon.push([x, y])
// Canyon cells near our base matter more.
const weight = (x: number) => (myId === 0 ? W - x : x + 1) ** 2
const coverage = (x: number, y: number, range: number) =>
  canyon.reduce((s, [cx, cy]) => ((cx - x) ** 2 + (cy - y) ** 2 <= range * range ? s + weight(cx) : s), 0)

interface Tower {
  type: string
  id: number
  owner: number
  x: number
  y: number
}
const upgrades = new Map<number, number>() // tower id -> upgrades bought

while (true) {
  const [money] = readline().split(" ").map(Number)
  readline() // opponent
  const tc = parseInt(readline())
  const towers: Tower[] = []
  for (let i = 0; i < tc; i++) {
    const [type, id, owner, x, y] = readline().trim().split(" ")
    towers.push({ type, id: parseInt(id), owner: parseInt(owner), x: parseInt(x), y: parseInt(y) })
  }
  const ac = parseInt(readline())
  for (let i = 0; i < ac; i++) readline()

  const taken = new Set(towers.map(t => t.y * W + t.x))
  const mine = towers.filter(t => t.owner === myId)
  let action = "PASS"
  const guns = mine.filter(tw => tw.type === "GUNTOWER")
  const glue = mine.some(tw => tw.type === "GLUETOWER")
  const bestCell = (): [number, number] | null => {
    let best: [number, number] | null = null
    let bestScore = 0
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (map[y][x] !== "#" || taken.has(y * W + x)) continue
        const s = coverage(x, y, GUN_RANGE)
        if (s > bestScore) {
          bestScore = s
          best = [x, y]
        }
      }
    }
    return best
  }
  // Next upgrade: the best-placed gun tower that is not maxed yet.
  const ranked = guns.slice().sort((a, b) => coverage(b.x, b.y, GUN_RANGE) - coverage(a.x, a.y, GUN_RANGE))
  const target = ranked.find(tw => (upgrades.get(tw.id) ?? 0) < 9)
  if (guns.length < BASE_TOWERS) {
    const cell = bestCell()
    if (cell && money >= GUN_COST) action = `BUILD ${cell[0]} ${cell[1]} GUNTOWER`
  } else if (!glue) {
    const cell = bestCell()
    if (cell && money >= GLUE_COST) action = `BUILD ${cell[0]} ${cell[1]} GLUETOWER`
  } else if (target) {
    const done = upgrades.get(target.id) ?? 0
    // Damage first (all levels), then reload, then range.
    const kind = ["DAMAGE", "DAMAGE", "DAMAGE", "RELOAD", "RELOAD", "RELOAD", "RANGE", "RANGE", "RANGE"][done]
    const level = done % 3
    if (money >= UPGRADE_COST[level]) {
      action = `UPGRADE ${target.id} ${kind}`
      upgrades.set(target.id, done + 1)
    }
  } else {
    const cell = bestCell()
    if (cell && money >= GUN_COST) action = `BUILD ${cell[0]} ${cell[1]} GUNTOWER`
  }
  console.log(action)
}
