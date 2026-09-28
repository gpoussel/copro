// 🎮 CodinGame Multiplayer - coders-of-the-realm
// https://www.codingame.com/multiplayer/bot-programming/coders-of-the-realm
//
// Kingdomino for 2-4 (the 1v1 bot adapted: init line with the player and
// tile counts, 9x9 grids and a 5x5 territory). Each turn: PUT the current tile (x y of its first square,
// rotation 0 right / 1 down / 2 left / 3 up for the second one), then PICK a
// tile for the next turn. A placement must touch the castle or a matching
// terrain, not overlap, and keep the territory within 5x5. Score = Σ zone
// size × crowns. PUT: the placement with the best resulting score; PICK: the
// free tile whose best placement would score the most for us.

const nbPlayers = parseInt(readline())
const nbTiles = parseInt(readline())
const S = 9
const MAX_SPAN = 5
const DX = [1, 0, -1, 0]
const DY = [0, 1, 0, -1]
const EMPTY = "_"
const CASTLE = "*"

type Grid = string[] // S*S squares, each "t" + crowns digit

function score(g: Grid): number {
  const seen = new Uint8Array(S * S)
  let total = 0
  for (let i = 0; i < S * S; i++) {
    const t = g[i][0]
    if (seen[i] || t === EMPTY || t === CASTLE) continue
    let size = 0
    let crowns = 0
    const q = [i]
    seen[i] = 1
    for (let h = 0; h < q.length; h++) {
      const c = q[h]
      size++
      crowns += parseInt(g[c][1])
      for (let d = 0; d < 4; d++) {
        const x = (c % S) + DX[d]
        const y = Math.floor(c / S) + DY[d]
        if (x < 0 || y < 0 || x >= S || y >= S) continue
        const n = y * S + x
        if (!seen[n] && g[n][0] === t) {
          seen[n] = 1
          q.push(n)
        }
      }
    }
    total += size * crowns
  }
  return total
}

function bounds(g: Grid): [number, number, number, number] {
  let x0 = S
  let y0 = S
  let x1 = -1
  let y1 = -1
  for (let i = 0; i < S * S; i++) {
    if (g[i][0] === EMPTY) continue
    const x = i % S
    const y = Math.floor(i / S)
    x0 = Math.min(x0, x)
    y0 = Math.min(y0, y)
    x1 = Math.max(x1, x)
    y1 = Math.max(y1, y)
  }
  return [x0, y0, x1, y1]
}

// All valid placements of tile (a, b) on g: [x, y, rot, resulting score].
function placements(g: Grid, a: string, b: string): [number, number, number, number][] {
  const out: [number, number, number, number][] = []
  const [bx0, by0, bx1, by1] = bounds(g)
  const matches = (x: number, y: number, t: string) => {
    for (let d = 0; d < 4; d++) {
      const nx = x + DX[d]
      const ny = y + DY[d]
      if (nx < 0 || ny < 0 || nx >= S || ny >= S) continue
      const u = g[ny * S + nx][0]
      if (u === CASTLE || u === t) return true
    }
    return false
  }
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (g[y * S + x][0] !== EMPTY) continue
      for (let rot = 0; rot < 4; rot++) {
        const x2 = x + DX[rot]
        const y2 = y + DY[rot]
        if (x2 < 0 || y2 < 0 || x2 >= S || y2 >= S || g[y2 * S + x2][0] !== EMPTY) continue
        if (Math.max(bx1, x, x2) - Math.min(bx0, x, x2) >= MAX_SPAN) continue
        if (Math.max(by1, y, y2) - Math.min(by0, y, y2) >= MAX_SPAN) continue
        if (!matches(x, y, a[0]) && !matches(x2, y2, b[0])) continue
        const h = g.slice()
        h[y * S + x] = a
        h[y2 * S + x2] = b
        out.push([x, y, rot, score(h)])
      }
    }
  }
  return out
}

function readGrid(): Grid {
  const g: Grid = []
  for (let r = 0; r < S; r++) {
    const line = readline().trim()
    for (let c = 0; c < S; c++) g.push(line.slice(2 * c, 2 * c + 2))
  }
  return g
}

while (true) {
  const mine = readGrid()
  for (let p = 1; p < nbPlayers; p++) readGrid() // opponents' grids
  let current: [string, string] | null = null
  for (let i = 0; i < nbTiles; i++) {
    const [, a, b, player, cur] = readline().trim().split(" ")
    if (player === "0" && cur === "1") current = [a, b]
  }
  const next: { id: number; a: string; b: string; player: number }[] = []
  for (let i = 0; i < nbTiles; i++) {
    const [id, a, b, player] = readline().trim().split(" ")
    next.push({ id: parseInt(id), a, b, player: parseInt(player) })
  }
  let put = "PUT 0 0 0"
  let board = mine
  if (current && current[0][0] !== EMPTY) {
    const options = placements(mine, current[0], current[1])
    if (options.length) {
      const best = options.reduce((p, q) => (q[3] > p[3] ? q : p))
      put = `PUT ${best[0]} ${best[1]} ${best[2]}`
      board = mine.slice()
      board[best[1] * S + best[0]] = current[0]
      board[(best[1] + DY[best[2]]) * S + best[0] + DX[best[2]]] = current[1]
    }
  }
  // Pick the free tile with the best follow-up on our board.
  const base = score(board)
  let pick = next.find(t => t.player === -1)?.id ?? next[0].id
  let bestGain = -Infinity
  for (const t of next) {
    if (t.player !== -1) continue
    const options = placements(board, t.a, t.b)
    const gain = options.length ? Math.max(...options.map(o => o[3])) - base : -1
    if (gain + t.id * 0.001 > bestGain) {
      bestGain = gain + t.id * 0.001
      pick = t.id
    }
  }
  console.log(put)
  console.log(`PICK ${pick}`)
}
