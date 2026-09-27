// 🎮 CodinGame Multiplayer - hypersonic
// https://www.codingame.com/multiplayer/bot-programming/hypersonic
//
// Bomberman on 13×11: bombs explode after 8 turns with our range, boxes hit
// score. Wood league: bombs do not hurt players. Bot: BFS over free cells;
// the best cell = boxes a bomb there would hit (not already doomed by a
// bomb on the map) / (distance + 2); walk there and BOMB when standing on
// it with a bomb available, moving on to the next best cell at once.
// Later leagues (walls X, items, damage): add a safety check.

const [W, H, myId] = readline().split(" ").map(Number)
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

while (true) {
  const grid: string[] = []
  for (let y = 0; y < H; y++) grid.push(readline())
  const n = parseInt(readline())
  let me = { x: 0, y: 0, bombs: 0, range: 3 }
  const bombs: { x: number; y: number; range: number }[] = []
  for (let i = 0; i < n; i++) {
    const [type, owner, x, y, p1, p2] = readline().split(" ").map(Number)
    if (type === 0 && owner === myId) me = { x, y, bombs: p1, range: p2 }
    else if (type === 1) bombs.push({ x, y, range: p2 })
  }
  const isBox = (x: number, y: number) => grid[y][x] >= "0" && grid[y][x] <= "9"
  const blocked = (x: number, y: number) =>
    x < 0 || y < 0 || x >= W || y >= H || grid[y][x] !== "." || bombs.some(b => b.x === x && b.y === y)
  // Boxes already doomed by bombs on the map.
  const doomed = new Set<number>()
  const blast = (bx: number, by: number, range: number, out: Set<number>) => {
    for (const [dx, dy] of DIRS)
      for (let k = 1; k < range; k++) {
        const x = bx + dx * k
        const y = by + dy * k
        if (x < 0 || y < 0 || x >= W || y >= H || grid[y][x] === "X") break
        if (grid[y][x] !== ".") {
          if (isBox(x, y)) out.add(y * W + x)
          break
        }
        if (bombs.some(b => b.x === x && b.y === y)) break
      }
  }
  for (const b of bombs) blast(b.x, b.y, b.range, doomed)
  // BFS from our cell.
  const dist = new Int32Array(W * H).fill(-1)
  dist[me.y * W + me.x] = 0
  const q = [me.y * W + me.x]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    for (const [dx, dy] of DIRS) {
      const x = (c % W) + dx
      const y = Math.floor(c / W) + dy
      if (blocked(x, y) || dist[y * W + x] >= 0) continue
      dist[y * W + x] = dist[c] + 1
      q.push(y * W + x)
    }
  }
  const value = (c: number, skip: number) => {
    const hit = new Set<number>()
    blast(c % W, Math.floor(c / W), me.range, hit)
    let v = 0
    for (const h of hit) if (!doomed.has(h) && h !== skip) v++
    return v
  }
  let best = -1
  let bestScore = 0
  for (const c of q) {
    const s = value(c, -1) / (dist[c] + 2)
    if (s > bestScore) {
      bestScore = s
      best = c
    }
  }
  const here = me.y * W + me.x
  if (best === here && me.bombs > 0) {
    // Bomb now, and head for the next best cell right away.
    const hit = new Set<number>()
    blast(me.x, me.y, me.range, hit)
    for (const h of hit) doomed.add(h)
    let next = here
    let nextScore = 0
    for (const c of q) {
      if (c === here) continue
      const s = value(c, -1) / (dist[c] + 2)
      if (s > nextScore) {
        nextScore = s
        next = c
      }
    }
    console.log(`BOMB ${next % W} ${Math.floor(next / W)}`)
  } else if (best >= 0) console.log(`MOVE ${best % W} ${Math.floor(best / W)}`)
  else console.log(`MOVE ${me.x} ${me.y}`)
}
