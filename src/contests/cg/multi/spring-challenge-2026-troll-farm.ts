// 🎮 CodinGame Multiplayer - spring-challenge-2026-troll-farm
// https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2026-troll-farm
// Referee: https://github.com/eulerscheZahl/Troll-Farm
//
// Trolls harvest fruits (1 point each at the shack), chop trees (WOOD = tree
// size, 4 points each), mine iron (for training). Score = shack contents.
// Bot, per troll:
// - carrying and full (or nothing better to do): walk next to the shack, DROP;
// - late game (or a big tree right here), CHOP size ≥ 3 trees: wood is worth
//   4 per unit;
// - otherwise HARVEST the tree with the best fruits / (distance + 1),
//   distinct targets per troll.
// Training: one extra troll when the shack can pay (1 move, 2 carry, 1
// harvest, 1 chop) during the first 100 turns.

const [W, H] = readline().split(" ").map(Number)
const grid: string[] = []
for (let y = 0; y < H; y++) grid.push(readline())
let shack = [0, 0]
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (grid[y][x] === "0") shack = [x, y]
const walkable = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && grid[y][x] === "."
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const dropCells = DIRS.map(([dx, dy]) => [shack[0] + dx, shack[1] + dy]).filter(([x, y]) => walkable(x, y))
const FRUITS = ["PLUM", "LEMON", "APPLE", "BANANA"]
let turn = 0

function bfs(sx: number, sy: number): Int32Array {
  const d = new Int32Array(W * H).fill(-1)
  d[sy * W + sx] = 0
  const q = [sy * W + sx]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    for (const [dx, dy] of DIRS) {
      const x = (c % W) + dx
      const y = Math.floor(c / W) + dy
      if (!walkable(x, y) || d[y * W + x] >= 0) continue
      d[y * W + x] = d[c] + 1
      q.push(y * W + x)
    }
  }
  return d
}

while (true) {
  turn++
  const inv = readline().split(" ").map(Number) // plums lemons apples bananas iron wood
  readline() // opponent inventory
  const tc = parseInt(readline())
  const trees: { type: string; x: number; y: number; size: number; health: number; fruits: number }[] = []
  for (let i = 0; i < tc; i++) {
    const p = readline().trim().split(" ")
    trees.push({ type: p[0], x: +p[1], y: +p[2], size: +p[3], health: +p[4], fruits: +p[5] })
  }
  const nt = parseInt(readline())
  const mine: { id: number; x: number; y: number; speed: number; carry: number; load: number }[] = []
  for (let i = 0; i < nt; i++) {
    const v = readline().split(" ").map(Number)
    if (v[1] !== 0) continue
    mine.push({ id: v[0], x: v[2], y: v[3], speed: v[4], carry: v[5], load: v.slice(8, 14).reduce((a, b) => a + b, 0) })
  }
  const out: string[] = []
  const claimed = new Set<number>()
  const late = turn > 200
  for (const t of mine) {
    const d = bfs(t.x, t.y)
    const here = trees.findIndex(tr => tr.x === t.x && tr.y === t.y)
    const nearShack = Math.abs(t.x - shack[0]) + Math.abs(t.y - shack[1]) === 1
    if (t.load > 0 && nearShack) {
      out.push(`DROP ${t.id}`)
      continue
    }
    const full = t.load >= t.carry
    if (!full && here >= 0) {
      const tr = trees[here]
      if ((late && tr.size >= 2) || (tr.size >= 4 && tr.fruits === 0 && turn > 120)) {
        out.push(`CHOP ${t.id}`)
        claimed.add(here)
        continue
      }
      if (tr.fruits > 0) {
        out.push(`HARVEST ${t.id}`)
        claimed.add(here)
        continue
      }
    }
    if (full || (t.load > 0 && !trees.some(tr => tr.fruits > 0))) {
      const [x, y] = dropCells.sort((a, b) => d[a[1] * W + a[0]] - d[b[1] * W + b[0]])[0] ?? shack
      out.push(`MOVE ${t.id} ${x} ${y}`)
      continue
    }
    let best = -1
    let bestScore = 0
    trees.forEach((tr, i) => {
      if (claimed.has(i)) return
      const dd = d[tr.y * W + tr.x]
      if (dd < 0) return
      const value = late ? tr.size * 4 : tr.fruits
      const score = value / (dd / Math.max(1, t.speed) + 1)
      if (score > bestScore) {
        bestScore = score
        best = i
      }
    })
    if (best >= 0) {
      claimed.add(best)
      out.push(`MOVE ${t.id} ${trees[best].x} ${trees[best].y}`)
    } else if (t.load > 0) {
      const [x, y] = dropCells[0] ?? shack
      out.push(`MOVE ${t.id} ${x} ${y}`)
    } else out.push(`WAIT`)
  }
  // Training: cost per attribute = trolls + value², paid in PLUM / LEMON /
  // APPLE / IRON.
  const k = mine.length
  const want = [1, 2, 1, 0]
  const cost = want.map(v => k + v * v)
  if (turn < 100 && k < 4 && cost.every((c, i) => inv[i === 3 ? 4 : i] >= c)) out.push(`TRAIN ${want.join(" ")}`)
  void FRUITS
  console.log(out.length ? out.join(";") : "WAIT")
}
