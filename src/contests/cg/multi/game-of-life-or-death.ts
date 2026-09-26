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
const HORIZON = 6

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
  let bestMask = 0
  let bestScore = -Infinity
  for (let mask = 0; mask < 1 << R; mask++) {
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
    // Keep a little mana for later and prefer live cells overall.
    score += g.reduce((s, v) => s + v, 0) * 0.05 - popcount(mask) * 0.01
    if (score > bestScore) {
      bestScore = score
      bestMask = mask
    }
  }
  const out: string[] = []
  for (let r = 0; r < R; r++) out.push((bestMask >> r) & 1 ? "1" : "0")
  console.log(out.join(" "))
}
