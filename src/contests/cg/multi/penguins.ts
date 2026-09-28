// 🎮 CodinGame Multiplayer - penguins
// https://www.codingame.com/multiplayer/bot-programming/penguins
//
// "Hey, that's my fish!": hex board of rows of 7 and 8 blocks (row 1 has 7,
// even-r layout: rows 1, 3, ... are shifted half a cell right), a move slides
// a penguin in a straight line and eats the block it left. Moves are listed.
// Placement: rich, well-connected blocks. Moves: fish eaten now + Voronoi
// territory (slide-move BFS distances, fish-weighted) − isolated penguins.

const nbPlayers = parseInt(readline())
const myId = parseInt(readline())
readline() // penguins per player

// Axial coordinates from (row r, column c), even-r offset layout.
const toQ = (r: number, c: number) => c - ((r + (r & 1)) >> 1)
const DIRS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
]

let rows: string[] = []
let cellAt = new Map<string, number>() // "q,r" -> index
let cellQ: number[] = []
let cellR: number[] = []
let cellName: string[] = []

function buildGrid() {
  cellAt = new Map()
  cellQ = []
  cellR = []
  cellName = []
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      cellAt.set(`${toQ(r, c)},${r}`, cellQ.length)
      cellQ.push(toQ(r, c))
      cellR.push(r)
      cellName.push(String.fromCharCode(65 + c) + String(r + 1))
    }
  }
}

// Slides from cell i over live blocks not occupied by penguins.
function slides(i: number, fish: number[], occupied: Set<number>, visit: (j: number) => void) {
  for (const [dq, dr] of DIRS) {
    let q = cellQ[i] + dq
    let r = cellR[i] + dr
    while (true) {
      const j = cellAt.get(`${q},${r}`)
      if (j === undefined || fish[j] === 0 || occupied.has(j)) break
      visit(j)
      q += dq
      r += dr
    }
  }
}

function evaluate(fish: number[], penguins: { owner: number; cell: number }[]): number {
  const occupied = new Set(penguins.map(p => p.cell))
  const dist = fish.map(() => [Infinity, -1]) // [distance, owner or -2 for tie]
  let frontier: [number, number][] = penguins.map(p => [p.cell, p.owner])
  for (const [c, o] of frontier) dist[c] = [0, o]
  let d = 0
  let isolated = 0
  for (const p of penguins) {
    let n = 0
    slides(p.cell, fish, occupied, () => n++)
    if (n === 0) isolated += p.owner === myId ? 1 : -1 / (nbPlayers - 1)
  }
  while (frontier.length) {
    d++
    const next: [number, number][] = []
    for (const [c, o] of frontier) {
      slides(c, fish, occupied, j => {
        if (dist[j][0] > d) {
          dist[j] = [d, o]
          next.push([j, o])
        } else if (dist[j][0] === d && dist[j][1] !== o) dist[j][1] = -2
      })
    }
    frontier = next
  }
  let s = 0
  for (let i = 0; i < fish.length; i++) {
    const [, o] = dist[i]
    if (o === myId) s += fish[i]
    else if (o >= 0) s -= fish[i] / (nbPlayers - 1)
  }
  return s - isolated * 8
}

while (true) {
  const nbRows = parseInt(readline())
  rows = []
  for (let r = 0; r < nbRows; r++) rows.push(readline().trim())
  for (let p = 0; p < nbPlayers; p++) readline()
  const np = parseInt(readline())
  if (cellQ.length === 0) buildGrid()
  const fish: number[] = []
  for (const row of rows) for (const ch of row) fish.push(parseInt(ch))
  const penguins: { id: number; owner: number; cell: number }[] = []
  for (let i = 0; i < np; i++) {
    const [id, owner, pos] = readline().trim().split(" ")
    const c = pos.charCodeAt(0) - 65
    const r = parseInt(pos.slice(1)) - 1
    penguins.push({ id: parseInt(id), owner: parseInt(owner), cell: cellAt.get(`${toQ(r, c)},${r}`)! })
  }
  const na = parseInt(readline())
  const actions: string[] = []
  for (let i = 0; i < na; i++) actions.push(readline().trim())

  let best = actions[0]
  let bestScore = -Infinity
  for (const a of actions) {
    const [, idStr, pos] = a.split(" ")
    const c = pos.charCodeAt(0) - 65
    const r = parseInt(pos.slice(1)) - 1
    const dest = cellAt.get(`${toQ(r, c)},${r}`)
    if (dest === undefined) continue
    const id = parseInt(idStr)
    const moving = penguins.find(p => p.id === id && p.owner === myId)
    const f = fish.slice()
    let gained = 0
    let after: { owner: number; cell: number }[]
    if (moving) {
      gained = f[moving.cell]
      f[moving.cell] = 0
      after = penguins.map(p => (p === moving ? { owner: p.owner, cell: dest } : p))
    } else {
      after = [...penguins, { owner: myId, cell: dest }] // placement
      gained = f[dest] * 0.5
    }
    const s = gained * 3 + evaluate(f, after)
    if (s > bestScore) {
      bestScore = s
      best = a
    }
  }
  console.log(best)
}
