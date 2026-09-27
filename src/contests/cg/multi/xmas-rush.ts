// 🎮 CodinGame Multiplayer - xmas-rush
// https://www.codingame.com/multiplayer/bot-programming/xmas-rush
// Referee: https://github.com/CodinGameCommunity/XmasRush
//
// 7x7 maze of tiles ("UDRL"-style 4-digit masks: up right down left). PUSH
// turns shift a row/column with our spare tile (players and items move with
// the tiles, a player pushed out lands on the inserted tile); MOVE turns walk
// up to 20 steps through connected paths. PUSH: the push after which a quest
// item is reachable, else the one bringing our reachable area closest to it.
// MOVE: BFS to the item, or to the reachable tile nearest to it.

const N = 7
const DIRS: [string, number, number, number, number][] = [
  // name, dx, dy, our side index, neighbour side index (up right down left)
  ["UP", 0, -1, 0, 2],
  ["RIGHT", 1, 0, 1, 3],
  ["DOWN", 0, 1, 2, 0],
  ["LEFT", -1, 0, 3, 1],
]

interface State {
  tiles: string[][] // [y][x]
  me: [number, number]
  myTile: string
  items: [number, number][] // our quest items' positions ([-1,-1] = on our tile)
}

function push(s: State, id: number, dir: string): State {
  const tiles = s.tiles.map(r => r.slice())
  let [mx, my] = s.me
  let tile = s.myTile
  const items = s.items.map(p => p.slice() as [number, number])
  const shift = (get: (k: number) => [number, number], forward: boolean) => {
    // Cells along the line, from the insertion side to the far side.
    const cells = [...Array(N).keys()].map(k => get(forward ? k : N - 1 - k))
    const out = tiles[cells[N - 1][1]][cells[N - 1][0]]
    for (let k = N - 1; k > 0; k--) tiles[cells[k][1]][cells[k][0]] = tiles[cells[k - 1][1]][cells[k - 1][0]]
    tiles[cells[0][1]][cells[0][0]] = tile
    tile = out
    const move = (p: [number, number]): [number, number] => {
      const k = cells.findIndex(([x, y]) => x === p[0] && y === p[1])
      if (k < 0) return p
      return k === N - 1 ? cells[0] : cells[k + 1]
    }
    ;[mx, my] = move([mx, my])
    for (let i = 0; i < items.length; i++) {
      if (items[i][0] === -1)
        items[i] = cells[0] // on our tile: inserted
      else {
        const k = cells.findIndex(([x, y]) => x === items[i][0] && y === items[i][1])
        items[i] = k === N - 1 ? [-1, -1] : k >= 0 ? cells[k + 1] : items[i]
      }
    }
  }
  if (dir === "RIGHT") shift(k => [k, id], true)
  else if (dir === "LEFT") shift(k => [k, id], false)
  else if (dir === "DOWN") shift(k => [id, k], true)
  else shift(k => [id, k], false)
  return { tiles, me: [mx, my], myTile: tile, items }
}

// BFS from our position: distance and first-step path to every tile.
function reach(s: State): { dist: Int32Array; path: string[][] } {
  const dist = new Int32Array(N * N).fill(-1)
  const path: string[][] = new Array(N * N).fill(null).map(() => [])
  const start = s.me[1] * N + s.me[0]
  dist[start] = 0
  const q = [start]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    const x = c % N
    const y = Math.floor(c / N)
    for (const [name, dx, dy, side, other] of DIRS) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue
      if (s.tiles[y][x][side] !== "1" || s.tiles[ny][nx][other] !== "1") continue
      const n = ny * N + nx
      if (dist[n] >= 0) continue
      dist[n] = dist[c] + 1
      path[n] = [...path[c], name]
      q.push(n)
    }
  }
  return { dist, path }
}

// How far our reachable area is from the nearest quest item (0 = reachable).
function gap(s: State): number {
  const { dist } = reach(s)
  let best = 99
  for (const [ix, iy] of s.items) {
    if (ix < 0) continue
    for (let c = 0; c < N * N; c++)
      if (dist[c] >= 0) best = Math.min(best, Math.abs((c % N) - ix) + Math.abs(Math.floor(c / N) - iy))
  }
  return best
}

while (true) {
  const turnType = parseInt(readline())
  const tiles: string[][] = []
  for (let y = 0; y < N; y++) tiles.push(readline().trim().split(" "))
  const [, px, py, ptile] = readline().trim().split(" ")
  readline() // opponent
  const itemCount = parseInt(readline())
  const items: { name: string; x: number; y: number; owner: number }[] = []
  for (let i = 0; i < itemCount; i++) {
    const [name, x, y, owner] = readline().trim().split(" ")
    items.push({ name, x: +x, y: +y, owner: +owner })
  }
  const questCount = parseInt(readline())
  const quests = new Set<string>()
  for (let i = 0; i < questCount; i++) {
    const [name, owner] = readline().trim().split(" ")
    if (owner === "0") quests.add(name)
  }
  const state: State = {
    tiles,
    me: [+px, +py],
    myTile: ptile,
    items: items.filter(it => it.owner === 0 && quests.has(it.name)).map(it => [it.x, it.y]),
  }
  if (turnType === 0) {
    let best = "PUSH 0 RIGHT"
    let bestGap = Infinity
    for (let id = 0; id < N; id++) {
      for (const dir of ["UP", "RIGHT", "DOWN", "LEFT"]) {
        const g = gap(push(state, id, dir))
        if (g < bestGap) {
          bestGap = g
          best = `PUSH ${id} ${dir}`
        }
      }
    }
    console.log(best)
  } else {
    const { dist, path } = reach(state)
    let target = -1
    let bestD = Infinity
    for (const [ix, iy] of state.items) {
      if (ix < 0) continue
      for (let c = 0; c < N * N; c++) {
        if (dist[c] < 0) continue
        const d = (Math.abs((c % N) - ix) + Math.abs(Math.floor(c / N) - iy)) * 100 + dist[c]
        if (d < bestD) {
          bestD = d
          target = c
        }
      }
    }
    const steps = target >= 0 ? path[target].slice(0, 20) : []
    console.log(steps.length ? `MOVE ${steps.join(" ")}` : "PASS")
  }
}
