// 🎮 CodinGame Multiplayer - vindinium
// https://www.codingame.com/multiplayer/bot-programming/vindinium
// Referee: https://github.com/eulerscheZahl/vindinium
//
// 4 heroes, 150 turns, most gold wins. Taking a mine costs 20 HP (a goblin
// fight), a tavern gives 50 HP for 2 gold, adjacent enemies hit for 20.
// Heuristic: drink when low, otherwise walk (BFS) to the nearest mine we do
// not own; never stand on another hero's spawn (a respawn kills).

const size = parseInt(readline())
const grid: string[] = []
for (let y = 0; y < size; y++) grid.push(readline())
const myId = parseInt(readline())
const spawns: [number, number, number][] = [] // [id, x, y]
for (let y = 0; y < size; y++)
  for (let x = 0; x < size; x++) if (/[0-3]/.test(grid[y][x])) spawns.push([parseInt(grid[y][x]), x, y])

const DIRS: [string, number, number][] = [
  ["NORTH", 0, -1],
  ["EAST", 1, 0],
  ["SOUTH", 0, 1],
  ["WEST", -1, 0],
]
const walkable = (x: number, y: number) =>
  x >= 0 && y >= 0 && x < size && y < size && grid[y][x] !== "#" && grid[y][x] !== "T" && grid[y][x] !== "M"
const danger = (x: number, y: number) => spawns.some(([id, sx, sy]) => id !== myId && sx === x && sy === y)

// First move towards the nearest cell satisfying `goal` (goals are entered,
// not walked through). Returns [direction, distance] or null.
function route(
  fromX: number,
  fromY: number,
  goal: (x: number, y: number) => boolean,
  blocked: Set<number>
): [string, number] | null {
  const first = new Map<number, string>()
  const q: [number, number, number][] = [[fromX, fromY, 0]]
  const seen = new Set([fromY * size + fromX])
  for (let h = 0; h < q.length; h++) {
    const [x, y, d] = q[h]
    for (const [name, dx, dy] of DIRS) {
      const nx = x + dx
      const ny = y + dy
      const k = ny * size + nx
      if (nx < 0 || ny < 0 || nx >= size || ny >= size || seen.has(k)) continue
      seen.add(k)
      const dir = h === 0 ? name : first.get(y * size + x)!
      if (goal(nx, ny)) return [dir, d + 1]
      if (!walkable(nx, ny) || blocked.has(k) || danger(nx, ny)) continue
      first.set(k, dir)
      q.push([nx, ny, d + 1])
    }
  }
  return null
}

while (true) {
  const n = parseInt(readline())
  const mines = new Map<number, number>() // cell -> owner
  let me = { x: 0, y: 0, life: 100, gold: 0 }
  const heroes: { id: number; x: number; y: number; life: number }[] = []
  for (let i = 0; i < n; i++) {
    const [type, id, x, y, life, gold] = readline().trim().split(" ")
    const e = { id: parseInt(id), x: parseInt(x), y: parseInt(y), life: parseInt(life), gold: parseInt(gold) }
    if (type === "HERO") {
      heroes.push(e)
      if (e.id === myId) me = e
    } else mines.set(e.y * size + e.x, e.id)
  }
  const blocked = new Set(heroes.filter(h => h.id !== myId).map(h => h.y * size + h.x))
  const isTavern = (x: number, y: number) => grid[y][x] === "T"
  const wantsMine = (x: number, y: number) => grid[y][x] === "M" && mines.get(y * size + x) !== myId

  let order = "WAIT"
  const tavern = route(me.x, me.y, isTavern, blocked)
  const mine = route(me.x, me.y, wantsMine, blocked)
  const nextToTavern = tavern !== null && tavern[1] === 1
  const thirsty = me.life < 40 || (mine !== null && me.life - mine[1] - 20 <= 15)
  if ((thirsty || (nextToTavern && me.life < 80)) && tavern && me.gold >= 2) order = tavern[0]
  else if (mine) order = mine[0]
  else if (tavern) order = tavern[0]
  console.log(order)
}
