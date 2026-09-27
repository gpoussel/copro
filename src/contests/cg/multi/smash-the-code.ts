// 🎮 CodinGame Multiplayer - smash-the-code
// https://www.codingame.com/multiplayer/bot-programming/smash-the-code
//
// League 1: vertical same-colour pairs dropped into a 6x12 grid; 4+
// connected blocks of a colour vanish (chains when the fall makes new groups);
// skulls (0) only vanish next to an explosion. Search: 3 plies over the known
// next pairs, every column, eval = cleared blocks (chains weighted) +
// same-colour contacts − height.

const W = 6
const H = 12
const DEPTH = 3

// grid[x][y], y = 0 bottom; 0 skull, -1 empty, 1..5 colours.
type Grid = Int8Array[]

function drop(g: Grid, x: number, a: number, b: number): boolean {
  const col = g[x]
  let h = 0
  while (h < H && col[h] !== -1) h++
  if (h + 2 > H) return false
  col[h] = a
  col[h + 1] = b
  return true
}

// Resolves groups and chains; returns the weighted number of cleared blocks.
function resolve(g: Grid): number {
  let total = 0
  let chain = 0
  while (true) {
    const seen = new Uint8Array(W * H)
    const clear: number[] = []
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
        if (group.length >= 4) clear.push(...group)
      }
    }
    if (!clear.length) break
    chain++
    total += clear.length * chain * chain
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
      s -= y * 0.3 // height
      if (c > 0) {
        if (x + 1 < W && g[x + 1][y] === c) s += 2
        if (y + 1 < H && g[x][y + 1] === c) s += 2
      }
    }
  }
  return s
}

const clone = (g: Grid): Grid => g.map(c => new Int8Array(c))

function search(g: Grid, pairs: [number, number][], depth: number): number {
  if (depth === DEPTH) return evaluate(g)
  let best = -1e9
  for (let x = 0; x < W; x++) {
    const h = clone(g)
    if (!drop(h, x, pairs[depth][0], pairs[depth][1])) continue
    const cleared = resolve(h)
    const v = cleared * 10 + search(h, pairs, depth + 1) * 0.9
    if (v > best) best = v
  }
  return best
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
  let bestX = 0
  let bestV = -Infinity
  for (let x = 0; x < W; x++) {
    const h = clone(grid)
    if (!drop(h, x, pairs[0][0], pairs[0][1])) continue
    const v = resolve(h) * 10 + search(h, pairs, 1) * 0.9
    if (v > bestV) {
      bestV = v
      bestX = x
    }
  }
  console.log(bestX)
}
