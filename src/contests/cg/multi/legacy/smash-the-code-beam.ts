// 🎮 CodinGame Multiplayer - smash-the-code
// https://www.codingame.com/multiplayer/bot-programming/smash-the-code
//
// Pairs of blocks dropped into a 6x12 grid; 4+ connected blocks of a colour
// vanish (chains when the fall makes new groups); skulls (0) only vanish next
// to an explosion. From Bronze pairs have two colours and rotate ("x r": r =
// 0 B right of A, 1 B above, 2 B left, 3 B below). Search: beam (width
// 120, 80 ms) over the 8 known pairs and all 22 placements; value = the
// real combo scores (discounted 0.85 per ply) + 10 × (same-colour contacts
// − height²).

const W = 6
const H = 12
let firstTurn = true

// grid[x][y], y = 0 bottom; 0 skull, -1 empty, 1..5 colours.
type Grid = Int8Array[]

function dropOne(g: Grid, x: number, c: number): boolean {
  const col = g[x]
  let h = 0
  while (h < H && col[h] !== -1) h++
  if (h >= H) return false
  col[h] = c
  return true
}
// Placement p = x * 4 + rotation.
const PLACEMENTS: number[] = []
for (let x = 0; x < W; x++)
  for (let r = 0; r < 4; r++) if (!(r === 0 && x === W - 1) && !(r === 2 && x === 0)) PLACEMENTS.push(x * 4 + r)
function drop(g: Grid, p: number, a: number, b: number): boolean {
  const x = p >> 2
  const r = p & 3
  if (r === 0) return dropOne(g, x, a) && dropOne(g, x + 1, b)
  if (r === 2) return dropOne(g, x, a) && dropOne(g, x - 1, b)
  if (r === 1) return dropOne(g, x, a) && dropOne(g, x, b)
  return dropOne(g, x, b) && dropOne(g, x, a)
}

// Resolves groups and chains; returns the game score of the combo:
// Σ over chain steps of 10·B·clamp(CP + CB + GB, 1, 999) (CP chain power
// 0, 8, 16, 32…; CB colour bonus 0, 2, 4, 8, 16; GB group bonus 0..8).
const COLOR_BONUS = [0, 0, 2, 4, 8, 16]
function resolve(g: Grid): number {
  let total = 0
  let step = 0
  for (;;) {
    const seen = new Uint8Array(W * H)
    const clear: number[] = []
    const colours = new Set<number>()
    let groupBonus = 0
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        const c = g[x][y]
        if (c <= 0 || seen[x * H + y]) continue
        const group = [x * H + y]
        seen[x * H + y] = 1
        for (let i = 0; i < group.length; i++) {
          const gx = Math.floor(group[i] / H)
          const gy = group[i] % H
          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ]) {
            const nx = gx + dx
            const ny = gy + dy
            if (nx < 0 || nx >= W || ny < 0 || ny >= H || seen[nx * H + ny] || g[nx][ny] !== c) continue
            seen[nx * H + ny] = 1
            group.push(nx * H + ny)
          }
        }
        if (group.length >= 4) {
          clear.push(...group)
          colours.add(c)
          groupBonus += group.length >= 11 ? 8 : group.length - 4
        }
      }
    }
    if (!clear.length) break
    const cp = step === 0 ? 0 : 8 << (step - 1)
    step++
    total += 10 * clear.length * Math.min(999, Math.max(1, cp + COLOR_BONUS[colours.size] + groupBonus))
    const kill = new Set(clear)
    for (const k of clear) {
      const x = Math.floor(k / H)
      const y = k % H
      // Skulls next to an explosion go too.
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && g[nx][ny] === 0) kill.add(nx * H + ny)
      }
    }
    for (const k of kill) g[Math.floor(k / H)][k % H] = -1
    // Gravity.
    for (let x = 0; x < W; x++) {
      const col = g[x].filter(v => v !== -1)
      for (let y = 0; y < H; y++) g[x][y] = y < col.length ? col[y] : -1
    }
  }
  return total
}

function evaluate(g: Grid): number {
  let s = 0
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      const c = g[x][y]
      if (c === -1) continue
      s -= y * y * 0.4 // height (quadratic: danger near the top)
      if (c > 0) {
        if (x + 1 < W && g[x + 1][y] === c) s += 3
        if (y + 1 < H && g[x][y + 1] === c) s += 3
      }
    }
  }
  return s
}

const clone = (g: Grid): Grid => g.map(c => new Int8Array(c))

// Beam search over the known pairs: node value = discounted combo scores
// + the potential of the final grid; returns the best first placement.
function beam(start: Grid, pairs: [number, number][], ms: number): number {
  const deadline = Date.now() + ms
  type Node = { g: Grid; score: number; first: number; value: number }
  let layer: Node[] = [{ g: start, score: 0, first: -1, value: 0 }]
  let bestFirst = -1
  for (let depth = 0; depth < pairs.length && Date.now() < deadline; depth++) {
    const next: Node[] = []
    for (const node of layer) {
      for (const p of PLACEMENTS) {
        const h = clone(node.g)
        if (!drop(h, p, pairs[depth][0], pairs[depth][1])) continue
        const combo = resolve(h)
        const score = node.score + combo * Math.pow(0.85, depth)
        next.push({ g: h, score, first: node.first < 0 ? p : node.first, value: score + evaluate(h) * 2 })
      }
      if (Date.now() > deadline) break
    }
    if (!next.length) break
    next.sort((a, b) => b.value - a.value)
    layer = next.slice(0, 120)
    bestFirst = layer[0].first
  }
  return bestFirst >= 0 ? bestFirst : PLACEMENTS[0]
}

while (true) {
  const pairs: [number, number][] = []
  for (let i = 0; i < 8; i++) pairs.push(readline().split(" ").map(Number) as [number, number])
  readline() // my score
  const rows: string[] = []
  for (let i = 0; i < H; i++) rows.push(readline())
  readline() // opponent score
  for (let i = 0; i < H; i++) readline()
  const grid: Grid = []
  for (let x = 0; x < W; x++) {
    const col = new Int8Array(H)
    for (let y = 0; y < H; y++) {
      const ch = rows[H - 1 - y][x]
      col[y] = ch === "." ? -1 : parseInt(ch)
    }
    grid.push(col)
  }
  const bestP = beam(grid, pairs, firstTurn ? 400 : 80)
  firstTurn = false
  console.log(`${bestP >> 2} ${bestP & 3}`)
}
