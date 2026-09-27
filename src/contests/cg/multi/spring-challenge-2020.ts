// 🎮 CodinGame Multiplayer - spring-challenge-2020
// https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2020
//
// Pac-Man duel; the map wraps horizontally. From Wood 1: pac types (ROCK /
// PAPER / SCISSORS) with SWITCH and SPEED (shared 10-turn cooldown), and fog
// (pellets only seen in straight line of sight, super pellets always seen).
// Memory of pellets that may remain; each pac: avoid / switch against a
// nearby pac that beats it, attack one it beats, SPEED when safe, else go for
// the best value / distance pellet (distinct targets).

const [W, H] = readline().split(" ").map(Number)
const grid: string[] = []
for (let y = 0; y < H; y++) grid.push(readline())
const floor = (x: number, y: number) => y >= 0 && y < H && grid[y][((x % W) + W) % W] !== "#"
const wrap = (x: number) => ((x % W) + W) % W
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const BEATS: Record<string, string> = { ROCK: "SCISSORS", SCISSORS: "PAPER", PAPER: "ROCK" }
const COUNTER: Record<string, string> = { SCISSORS: "ROCK", PAPER: "SCISSORS", ROCK: "PAPER" }

// Cells that may still hold a pellet (value 1 unless seen otherwise).
const maybe = new Map<number, number>()
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (floor(x, y)) maybe.set(y * W + x, 1)

function bfs(sx: number, sy: number, blocked: Set<number>): Int32Array {
  const d = new Int32Array(W * H).fill(-1)
  d[sy * W + sx] = 0
  const q = [sy * W + sx]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    const x = c % W
    const y = Math.floor(c / W)
    for (const [dx, dy] of DIRS) {
      const nx = wrap(x + dx)
      const ny = y + dy
      if (!floor(nx, ny)) continue
      const n = ny * W + nx
      if (d[n] >= 0 || blocked.has(n)) continue
      d[n] = d[c] + 1
      q.push(n)
    }
  }
  return d
}

// Last seen enemies (fog): id -> pac + the turn it was seen.
const seen = new Map<number, { x: number; y: number; type: string; speed: number; cd: number; turn: number }>()
let turn = 0

while (true) {
  turn++
  readline() // scores
  const pc = parseInt(readline())
  type Pac = { id: number; x: number; y: number; type: string; speed: number; cd: number; turn?: number }
  const mine: Pac[] = []
  for (let i = 0; i < pc; i++) {
    const p = readline().trim().split(" ")
    const pac = { id: +p[0], x: +p[2], y: +p[3], type: p[4], speed: +p[5], cd: +p[6] }
    if (p[1] === "1") {
      if (pac.type !== "DEAD") mine.push(pac)
    } else if (pac.type === "DEAD") seen.delete(pac.id)
    else seen.set(pac.id, { ...pac, turn })
  }
  const enemies: Pac[] = []
  for (const [id, e] of seen) {
    if (turn - e.turn > 3) seen.delete(id)
    else enemies.push({ id, ...e })
  }
  const n = parseInt(readline())
  const visible = new Map<number, number>()
  for (let i = 0; i < n; i++) {
    const [x, y, v] = readline().split(" ").map(Number)
    visible.set(y * W + x, v)
  }
  // Update the memory: cells in line of sight without a pellet are empty.
  for (const p of mine) {
    maybe.delete(p.y * W + p.x)
    for (const [dx, dy] of DIRS) {
      let x = p.x
      let y = p.y
      for (let k = 0; k < W; k++) {
        x = wrap(x + dx)
        y += dy
        if (!floor(x, y)) break
        const c = y * W + x
        if (!visible.has(c)) maybe.delete(c)
      }
    }
  }
  for (const [c, v] of visible) maybe.set(c, v)
  // Super pellets are always visible: forget the ones that vanished.
  for (const [c, v] of maybe) if (v === 10 && !visible.has(c)) maybe.delete(c)

  const empty = new Set<number>()
  const enemyDist = enemies.map((e) => ({ e, d: bfs(e.x, e.y, empty), fresh: e.turn === turn }))
  const claimed = new Set<number>()
  const taken = new Set<number>() // cells our pacs move to this turn
  const out: string[] = []
  for (const p of mine) {
    const here = p.y * W + p.x
    const threats = enemyDist.filter((o) => BEATS[o.e.type] === p.type && o.d[here] >= 0 && o.d[here] <= 4)
    const prey = enemyDist.find(
      (o) => o.fresh && BEATS[p.type] === o.e.type && o.e.cd > 0 && o.d[here] > 0 && o.d[here] <= (p.speed ? 2 : 1),
    )
    const closeThreat = threats.find((o) => o.fresh && o.d[here] <= 2)
    if (closeThreat && p.cd === 0) {
      out.push(`SWITCH ${p.id} ${COUNTER[closeThreat.e.type]}`)
      taken.add(here)
      continue
    }
    if (prey && threats.length === 0) {
      out.push(`MOVE ${p.id} ${prey.e.x} ${prey.e.y}`)
      continue
    }
    if (threats.length === 0 && p.cd === 0) {
      out.push(`SPEED ${p.id}`)
      taken.add(here)
      continue
    }
    // Danger: cells a threatening pac can reach next turn (one extra step
    // of margin), and cells a friendly pac already goes to.
    const blocked = new Set<number>(taken)
    for (const o of threats) {
      const reach = (o.e.speed > 0 ? 2 : 1) + (o.fresh ? 0 : 1)
      for (let c = 0; c < W * H; c++) if (o.d[c] >= 0 && o.d[c] <= reach) blocked.add(c)
    }
    blocked.delete(here)
    // Other enemies block the way (same type = bump, weaker = fine but skip).
    for (const o of enemyDist) if (o.fresh) blocked.add(o.e.y * W + o.e.x)
    const d = bfs(p.x, p.y, blocked)
    let best = -1
    let bestValue = -1
    for (const [c, v] of maybe) {
      if (claimed.has(c) || d[c] <= 0) continue
      const value = (visible.has(c) ? v : v * 0.5) / d[c]
      if (value > bestValue) {
        bestValue = value
        best = c
      }
    }
    if (best < 0) {
      // Nothing to eat: go to the reachable cell farthest from threats.
      for (let c = 0; c < W * H; c++) {
        if (d[c] <= 0 || d[c] > 2) continue
        const v = threats.reduce((m, o) => Math.min(m, o.d[c] < 0 ? 99 : o.d[c]), 99)
        if (v > bestValue) {
          bestValue = v
          best = c
        }
      }
    }
    if (best < 0) {
      out.push(`MOVE ${p.id} ${p.x} ${p.y}`)
      taken.add(here)
      continue
    }
    claimed.add(best)
    // Walk back the path and aim at the cell reached this turn.
    const steps = p.speed > 0 ? 2 : 1
    let c = best
    while (d[c] > steps) {
      const x = c % W
      const y = Math.floor(c / W)
      for (const [dx, dy] of DIRS) {
        const nx = wrap(x + dx)
        const ny = y + dy
        if (!floor(nx, ny)) continue
        const m = ny * W + nx
        if (d[m] === d[c] - 1) {
          c = m
          break
        }
      }
    }
    taken.add(c)
    out.push(`MOVE ${p.id} ${c % W} ${Math.floor(c / W)}`)
  }
  console.log(out.join(" | "))
}
