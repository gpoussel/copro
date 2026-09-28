// 🎮 CodinGame Multiplayer - game-of-life-or-death
// https://www.codingame.com/multiplayer/bot-programming/game-of-life-or-death
//
// Conway's life on 8x8 (rows wrap vertically), each player evolving on its
// own (the other's cells count as dead, clashes cancel). We always control
// the leftmost column (the input is mirrored for player 2) and set it each
// turn with at most `mana` live cells; live goal cells score (and give mana).
// Search: every column pattern within the mana, simulated a few generations
// (future columns empty), scored by goal-cell occupancy, sooner is better.

const R = parseInt(readline())
const C = parseInt(readline())
readline() // max mana
const goalCount = parseInt(readline())
const goals: number[] = []
for (let i = 0; i < goalCount; i++) {
  const [x, y] = readline().split(" ").map(Number)
  goals.push(y * C + x)
}
// Small boards (league 1, 8 rows): every pattern, 6 generations. Bigger ones
// (16x16 later): time-bounded random patterns over a longer horizon, with a
// bonus for our cells advancing towards the centre.
const HORIZON = R <= 8 ? 6 : 16
const TURN_MS = 38
let rng = 0x2545f491
const rand = () => {
  rng ^= rng << 13
  rng ^= rng >>> 17
  rng ^= rng << 5
  return (rng >>> 0) / 4294967296
}

// One generation for both players (grid: 1 us, -1 them, 0 empty).
function step(g: Int8Array): Int8Array {
  const out = new Int8Array(R * C)
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      let me = 0
      let them = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue
          const cc = c + dc
          if (cc < 0 || cc >= C) continue
          const v = g[((r + dr + R) % R) * C + cc]
          if (v === 1) me++
          else if (v === -1) them++
        }
      }
      const cur = g[r * C + c]
      const aliveMe = cur === 1 ? me === 2 || me === 3 : me === 3
      const aliveThem = cur === -1 ? them === 2 || them === 3 : them === 3
      out[r * C + c] = aliveMe && !aliveThem ? 1 : aliveThem && !aliveMe ? -1 : 0
    }
  }
  return out
}

const popcount = (m: number) => {
  let n = 0
  for (; m; m &= m - 1) n++
  return n
}

while (true) {
  const mana = parseInt(readline())
  readline() // opponent mana
  const grid = new Int8Array(R * C)
  for (let r = 0; r < R; r++) {
    const v = readline().trim().split(/\s+/).map(Number)
    for (let c = 0; c < C; c++) grid[r * C + c] = v[c]
  }
  const deadline = Date.now() + TURN_MS
  let bestMask = 0
  let bestScore = -Infinity
  const exhaustive = R <= 8
  const candidates = exhaustive ? 1 << R : Infinity
  for (let k = 0; k < candidates; k++) {
    let mask = k
    if (!exhaustive) {
      if (Date.now() > deadline) break
      // Random pattern with up to `mana` live cells, often a compact block.
      mask = 0
      const cells = Math.floor(rand() * (Math.min(mana, R) + 1))
      const start = Math.floor(rand() * R)
      const spread = rand() < 0.6 ? 4 : R
      for (let c = 0; c < cells; c++) mask |= 1 << ((start + Math.floor(rand() * spread)) % R)
    }
    if (popcount(mask) > mana) continue
    let g: Int8Array = new Int8Array(grid)
    for (let r = 0; r < R; r++) g[r * C] = (mask >> r) & 1 ? 1 : g[r * C] === -1 ? -1 : 0
    let score = 0
    for (let t = 1; t <= HORIZON; t++) {
      g = step(g)
      let mine = 0
      let theirs = 0
      for (const i of goals) {
        if (g[i] === 1) mine++
        else if (g[i] === -1) theirs++
      }
      score += (mine - theirs) * (1 + (HORIZON - t) * 0.2)
    }
    // Keep a little mana for later, prefer live cells, and (big boards) cells
    // that got closer to the centre columns.
    let advance = 0
    for (let i = 0; i < R * C; i++) if (g[i] === 1) advance += Math.min(i % C, C / 2)
    score += g.reduce((s, v) => s + v, 0) * 0.05 - popcount(mask) * 0.01 + (exhaustive ? 0 : advance * 0.02)
    if (score > bestScore) {
      bestScore = score
      bestMask = mask
    }
  }
  const out: string[] = []
  for (let r = 0; r < R; r++) out.push((bestMask >> r) & 1 ? "1" : "0")
  console.log(out.join(" "))
}
