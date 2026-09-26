// 🎮 CodinGame Multiplayer - elemental-wars
// https://www.codingame.com/multiplayer/bot-programming/elemental-wars
//
// 3 tribes in a cycle (Water > Fire > Plant > Water); sharing a cell with a
// predator gets you captured. Moves are simultaneous, one step (4 dirs).
// For each of our elementals: pick among staying and the 4 neighbours the
// cell no predator can reach next turn that brings us closest to a prey.

const PREY: Record<string, string> = { W: "F", F: "P", P: "W" }
const PREDATOR: Record<string, string> = { W: "P", F: "W", P: "F" }

const myTribe = readline().trim()
const size = parseInt(readline())
const grid: string[] = []
for (let y = 0; y < size; y++) grid.push(readline())
const free = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size && grid[y][x] !== "#"
const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

// All-pairs BFS distances (the map is small and static).
const N = size * size
const dist: Int16Array[] = []
for (let s = 0; s < N; s++) {
  const d = new Int16Array(N).fill(999)
  if (free(s % size, Math.floor(s / size))) {
    d[s] = 0
    const q = [s]
    for (let h = 0; h < q.length; h++) {
      const c = q[h]
      for (const [dx, dy] of DIRS) {
        const nx = (c % size) + dx
        const ny = Math.floor(c / size) + dy
        if (!free(nx, ny)) continue
        const n = ny * size + nx
        if (d[n] > d[c] + 1) {
          d[n] = d[c] + 1
          q.push(n)
        }
      }
    }
  }
  dist.push(d)
}

while (true) {
  readline() // scores
  const n = parseInt(readline())
  const units: { id: number; tribe: string; cell: number; prisoner: boolean }[] = []
  for (let i = 0; i < n; i++) {
    const [id, tribe, x, y, p] = readline().trim().split(" ")
    units.push({ id: parseInt(id), tribe, cell: parseInt(y) * size + parseInt(x), prisoner: p === "1" })
  }
  const active = units.filter(u => !u.prisoner)
  const preys = active.filter(u => u.tribe === PREY[myTribe])
  const hunters = active.filter(u => u.tribe === PREDATOR[myTribe])
  const commands: string[] = []
  for (const me of active.filter(u => u.tribe === myTribe)) {
    const x = me.cell % size
    const y = Math.floor(me.cell / size)
    const options = [[x, y], ...DIRS.map(([dx, dy]) => [x + dx, y + dy])].filter(([cx, cy]) => free(cx, cy))
    let best = options[0]
    let bestScore = -Infinity
    for (const [cx, cy] of options) {
      const c = cy * size + cx
      const danger = hunters.some(h => dist[h.cell][c] <= 1)
      const chase = preys.length ? Math.min(...preys.map(p => dist[c][p.cell])) : 0
      const flee = hunters.length ? Math.min(...hunters.map(h => dist[h.cell][c])) : 99
      const score = (danger ? -1000 : 0) - chase * 10 + Math.min(flee, 6)
      if (score > bestScore) {
        bestScore = score
        best = [cx, cy]
      }
    }
    commands.push(best[0] === x && best[1] === y ? `${me.id} WAIT` : `${me.id} MOVE ${best[0]} ${best[1]}`)
  }
  console.log(commands.length ? commands.join(";") : "MSG")
}
