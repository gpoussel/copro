// 🎮 CodinGame Multiplayer - great-escape
// https://www.codingame.com/multiplayer/bot-programming/great-escape
//
// Quoridor on 9x9 for 2-3 players: move one cell or place a 2-cell wall (not
// overlapping/crossing, never cutting anybody off). Player 0 goes right,
// player 1 left, player 2 down. Plan: when an opponent would arrive first,
// place the wall that lengthens its shortest path the most relative to ours;
// otherwise walk our shortest path.

// The stub reads w h playerCount myId on one line (the statement shows 4).
const init = readline().trim().split(/\s+/).map(Number)
while (init.length < 4) init.push(...readline().trim().split(/\s+/).map(Number))
const [W, H, playerCount, myId] = init
const DIRS: [string, number, number][] = [
  ["RIGHT", 1, 0],
  ["LEFT", -1, 0],
  ["DOWN", 0, 1],
  ["UP", 0, -1],
]
const goal = (p: number, x: number, y: number) => (p === 0 ? x === W - 1 : p === 1 ? x === 0 : y === H - 1)

// Blocked moves between two cells: key a * 128 + b (both directions stored).
let blocked = new Set<number>()
const cell = (x: number, y: number) => y * W + x
function wallEdges(x: number, y: number, o: string): [number, number][] {
  return o === "H"
    ? [
        [cell(x, y - 1), cell(x, y)],
        [cell(x + 1, y - 1), cell(x + 1, y)],
      ]
    : [
        [cell(x - 1, y), cell(x, y)],
        [cell(x - 1, y + 1), cell(x, y + 1)],
      ]
}
function addWall(set: Set<number>, x: number, y: number, o: string) {
  for (const [a, b] of wallEdges(x, y, o)) {
    set.add(a * 128 + b)
    set.add(b * 128 + a)
  }
}

// Shortest path length (and first move) for player p from (x, y).
function path(p: number, x: number, y: number, walls: Set<number>): [number, string] {
  const dist = new Int16Array(W * H).fill(-1)
  const first: string[] = new Array(W * H).fill("")
  const q = [cell(x, y)]
  dist[q[0]] = 0
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    const cx = c % W
    const cy = Math.floor(c / W)
    if (goal(p, cx, cy)) return [dist[c], first[c]]
    for (const [name, dx, dy] of DIRS) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const n = cell(nx, ny)
      if (dist[n] >= 0 || walls.has(c * 128 + n)) continue
      dist[n] = dist[c] + 1
      first[n] = h === 0 ? name : first[c]
      q.push(n)
    }
  }
  return [Infinity, ""]
}

while (true) {
  const players: [number, number, number][] = []
  for (let p = 0; p < playerCount; p++) players.push(readline().split(" ").map(Number) as [number, number, number])
  const wc = parseInt(readline())
  const walls: [number, number, string][] = []
  blocked = new Set()
  for (let i = 0; i < wc; i++) {
    const [x, y, o] = readline().trim().split(" ")
    walls.push([parseInt(x), parseInt(y), o])
    addWall(blocked, parseInt(x), parseInt(y), o)
  }
  const alive = (p: number) => players[p][0] >= 0
  const [mx, my, wallsLeft] = players[myId]
  const [myDist, myMove] = path(myId, mx, my, blocked)
  // Opponents' distances, and who would arrive first.
  let threat = -1
  let threatDist = Infinity
  for (let p = 0; p < playerCount; p++) {
    if (p === myId || !alive(p)) continue
    const [d] = path(p, players[p][0], players[p][1], blocked)
    // Everybody else moves after us this round: we win distance ties.
    if (d < myDist && d < threatDist) {
      threat = p
      threatDist = d
    }
  }
  const overlaps = (x: number, y: number, o: string) =>
    walls.some(([wx, wy, wo]) =>
      wo === o
        ? o === "H"
          ? wy === y && Math.abs(wx - x) <= 1
          : wx === x && Math.abs(wy - y) <= 1
        : o === "H"
          ? wx === x + 1 && wy === y - 1
          : wx === x - 1 && wy === y + 1
    )
  // Every wall that fits (legality of paths checked by the callers).
  const candidates: [number, number, string][] = []
  for (const o of ["H", "V"])
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (o === "H" && (x > W - 2 || y < 1)) continue
        if (o === "V" && (x < 1 || y > H - 2)) continue
        if (!overlaps(x, y, o)) candidates.push([x, y, o])
      }
  let action = myMove || "RIGHT"
  // Among shortest-path steps, the one a single enemy wall hurts least.
  const enemyWalls = players.some((pl, p) => p !== myId && alive(p) && pl[2] > 0)
  if (enemyWalls && myDist < Infinity) {
    let bestWorst = Infinity
    for (const [name, dx, dy] of DIRS) {
      const nx = mx + dx
      const ny = my + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || blocked.has(cell(mx, my) * 128 + cell(nx, ny))) continue
      const [d] = path(myId, nx, ny, blocked)
      if (d !== myDist - 1) continue
      let worst = d
      for (const [x, y, o] of candidates) {
        const next = new Set(blocked)
        addWall(next, x, y, o)
        const d2 = path(myId, nx, ny, next)[0]
        if (d2 !== Infinity && d2 > worst) worst = d2
      }
      if (worst < bestWorst) {
        bestWorst = worst
        action = name
      }
    }
  }
  if (threat >= 0 && wallsLeft > 0) {
    let bestGain = 0
    for (const [x, y, o] of candidates) {
      const next = new Set(blocked)
      addWall(next, x, y, o)
      let ok = true
      for (let p = 0; p < playerCount && ok; p++)
        if (alive(p) && path(p, players[p][0], players[p][1], next)[0] === Infinity) ok = false
      if (!ok) continue
      const gain =
        path(threat, players[threat][0], players[threat][1], next)[0] -
        threatDist -
        (path(myId, mx, my, next)[0] - myDist)
      // Walls are scarce: spend them close to the threat's goal (it cannot
      // route around any more) unless the gain is big.
      if (gain > bestGain && (threatDist <= 3 || gain >= 3)) {
        bestGain = gain
        action = `${x} ${y} ${o}`
      }
    }
  }
  console.log(action)
}
