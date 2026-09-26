// 🎮 CodinGame Multiplayer - volcanoes
// https://www.codingame.com/multiplayer/bot-programming/volcanoes
//
// 80 tiles (neighbours given). Win by chaining volcanoes from a north tile
// N_k to its opposite S_k. A volcano reaching level 4 erupts: it goes
// dormant, adjacent empty tiles become our level-1 volcanoes, our adjacent
// volcanoes grow (cascading), enemy ones are destroyed. One-ply search over
// the valid moves, eruptions simulated, eval = Hex-like connection distance
// (0-1 BFS: own volcano 0, empty 1, enemy blocked) for both sides.

const TILES = parseInt(readline())
const names: string[] = []
const adj: number[][] = []
for (let i = 0; i < TILES; i++) {
  const [name, a, b, c] = readline().trim().split(" ")
  names.push(name)
  adj.push([parseInt(a), parseInt(b), parseInt(c)])
}
const indexOf = new Map(names.map((n, i) => [n, i]))
// Opposite pairs: N_k <-> S_k.
const pairs: [number, number][] = []
for (let i = 0; i < TILES; i++) {
  if (names[i][0] !== "N") continue
  const s = indexOf.get("S" + names[i].slice(1))
  if (s !== undefined) pairs.push([i, s])
}

// Levels: > 0 ours, < 0 theirs. Applies +1 to tile i for `side` with cascades.
function grow(b: Int8Array, i: number, side: number) {
  const queue = [i]
  let guard = 0
  b[i] = b[i] === 0 ? side : b[i] + side
  while (queue.length && guard++ < 500) {
    const t = queue.shift()!
    if (Math.abs(b[t]) !== 4) continue
    const owner = Math.sign(b[t])
    for (const n of adj[t]) {
      if (b[n] === 0) b[n] = owner
      else if (Math.sign(b[n]) === owner) {
        if (Math.abs(b[n]) < 4) {
          b[n] += owner
          if (Math.abs(b[n]) === 4) queue.push(n)
        }
      } else b[n] = 0
    }
  }
}

// Empty tiles still needed by `side` to connect an opposite pair.
function distance(b: Int8Array, side: number): number {
  let best = 99
  const dist = new Int8Array(TILES)
  for (const [nTile, sTile] of pairs) {
    if (Math.sign(b[nTile]) === -side || Math.sign(b[sTile]) === -side) continue
    dist.fill(99)
    const deque: number[] = [nTile]
    dist[nTile] = Math.sign(b[nTile]) === side ? 0 : 1
    while (deque.length) {
      const t = deque.shift()!
      if (dist[t] >= best) continue
      for (const n of adj[t]) {
        if (Math.sign(b[n]) === -side) continue
        const w = Math.sign(b[n]) === side ? 0 : 1
        if (dist[t] + w < dist[n]) {
          dist[n] = dist[t] + w
          if (w === 0) deque.unshift(n)
          else deque.push(n)
        }
      }
    }
    if (dist[sTile] < best) best = dist[sTile]
  }
  return best
}

while (true) {
  const levels = readline().trim().split(/\s+/).map(Number)
  const moves = readline()
    .trim()
    .split(/\s+/)
    .filter(m => m !== "")
  const board = Int8Array.from(levels)
  let best = moves[0] ?? "RANDOM"
  let bestScore = -Infinity
  for (const m of moves) {
    const i = indexOf.get(m)
    if (i === undefined) continue
    const b = new Int8Array(board)
    grow(b, i, 1)
    const mine = distance(b, 1)
    const theirs = distance(b, -1)
    const s = (mine === 0 ? 1000 : 0) - mine * 10 + theirs * 9 + b.reduce((acc, v) => acc + Math.sign(v), 0) * 0.1
    if (s > bestScore) {
      bestScore = s
      best = m
    }
  }
  console.log(best)
}
