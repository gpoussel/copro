// 🎮 CodinGame Multiplayer - tulips-and-daisies
// https://www.codingame.com/multiplayer/bot-programming/tulips-and-daisies
// Referee: https://github.com/WildSmilodon/Tulips-and-Daisies
//
// Plant one flower per turn; 4+ of a kind in a line are harvested for the sum
// of the first N Fibonacci numbers (N = flowers harvested, all directions
// together) and turn to grass. Planting costs by tile. Since the payoff is
// exponential, the game is about big simultaneous harvests (XXX_XXX pays 33):
// each move is scored by its own profit, plus our best next harvest spots
// (best + half the second: the opponent can block one), minus the opponent's
// best next harvest.

const TURN_MS = 40
const SOIL = 0
const GRASS = 1
const ROCK = 2
const MINE = 3
const THEIRS = 4

const [W, H] = readline().split(" ").map(Number)
const costs = readline().split(" ").map(Number) // soil, grass, rocks, flower
const [myFlowers] = readline().trim().split(" ")
const myLetter = myFlowers.startsWith("t") ? "T" : "D"
const N = W * H

const FIB_SUM: number[] = [0]
{
  let a = 1
  let b = 1
  for (let n = 1; n <= 300; n++) {
    FIB_SUM.push(FIB_SUM[n - 1] + a)
    ;[a, b] = [b, a + b]
  }
}

const grid = new Int8Array(N)
const DR = [0, 1, 1, 1]
const DC = [1, 0, 1, -1]

function cost(i: number, flower: number): number {
  const t = grid[i]
  if (t === SOIL) return costs[0]
  if (t === GRASS) return costs[1]
  if (t === ROCK) return costs[2]
  return t === flower ? Infinity : costs[3]
}

// Cells harvested if `flower` is planted at i (written into out), and count.
let markEpoch = 0
const epochOf = new Uint32Array(N)
function harvest(i: number, flower: number, out: Int16Array | null): number {
  markEpoch++
  let total = 0
  const r = Math.floor(i / W)
  const c = i % W
  for (let d = 0; d < 4; d++) {
    let len = 1
    let rr = r + DR[d]
    let cc = c + DC[d]
    while (rr >= 0 && rr < H && cc >= 0 && cc < W && grid[rr * W + cc] === flower) {
      len++
      rr += DR[d]
      cc += DC[d]
    }
    const end1 = len
    rr = r - DR[d]
    cc = c - DC[d]
    while (rr >= 0 && rr < H && cc >= 0 && cc < W && grid[rr * W + cc] === flower) {
      len++
      rr -= DR[d]
      cc -= DC[d]
    }
    if (len < 4) continue
    // Collect the run's cells (both sides), counting shared ones once.
    for (let k = -(len - end1); k < end1; k++) {
      const j = (r + k * DR[d]) * W + c + k * DC[d]
      if (epochOf[j] !== markEpoch) {
        epochOf[j] = markEpoch
        if (out) out[total] = j
        total++
      }
    }
  }
  return total
}

// Best and second-best profit `flower` can make next turn.
function spots(flower: number, gold: number): [number, number] {
  let best = 0
  let second = 0
  for (let i = 0; i < N; i++) {
    const t = grid[i]
    if (t === flower) continue
    const k = cost(i, flower)
    if (k > gold) continue
    const n = harvest(i, flower, null)
    if (n === 0) continue
    const p = FIB_SUM[n] - k
    if (p > best) {
      second = best
      best = p
    } else if (p > second) second = p
  }
  return [best, second]
}

const cells = new Int16Array(N)
let myGold = 100
let theirGold = 100

function score(i: number): number {
  const k = cost(i, MINE)
  const before = grid[i]
  grid[i] = MINE
  const n = harvest(i, MINE, cells)
  const profit = (n ? FIB_SUM[n] : 0) - k
  for (let j = 0; j < n; j++) grid[cells[j]] = GRASS
  const [myBest, mySecond] = spots(MINE, myGold + profit)
  const [theirBest] = spots(THEIRS, theirGold)
  // Line building: our flowers next to i in open lines (small tie-breaker).
  let build = 0
  if (n === 0) {
    const r = Math.floor(i / W)
    const c = i % W
    for (let d = 0; d < 4; d++) {
      for (const s of [1, -1]) {
        const rr = r + s * DR[d]
        const cc = c + s * DC[d]
        if (rr >= 0 && rr < H && cc >= 0 && cc < W && grid[rr * W + cc] === MINE) build++
      }
    }
  }
  for (let j = 0; j < n; j++) grid[cells[j]] = MINE
  grid[i] = before
  return profit + 0.7 * (myBest + 0.5 * mySecond) - theirBest + build * 0.5
}

while (true) {
  readline() // turns left
  ;[myGold, theirGold] = readline().split(" ").map(Number)
  const deadline = Date.now() + TURN_MS
  for (let r = 0; r < H; r++) {
    const line = readline().trim()
    for (let c = 0; c < W; c++) {
      const ch = line[c]
      grid[r * W + c] = ch === "S" ? SOIL : ch === "G" ? GRASS : ch === "R" ? ROCK : ch === myLetter ? MINE : THEIRS
    }
  }
  // Cheap pre-ranking: cells near flowers first, then everything else.
  const order: number[] = []
  for (let i = 0; i < N; i++) if (cost(i, MINE) <= myGold) order.push(i)
  const near = (i: number) => {
    const r = Math.floor(i / W)
    const c = i % W
    let n = 0
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr
        const cc = c + dc
        if ((dr || dc) && rr >= 0 && rr < H && cc >= 0 && cc < W && grid[rr * W + cc] >= MINE) n++
      }
    return n
  }
  order.sort((a, b) => near(b) - near(a) || cost(a, MINE) - cost(b, MINE))
  let best = order[0]
  let bestScore = -Infinity
  let evaluated = 0
  for (const i of order) {
    if (Date.now() > deadline) break
    evaluated++
    const s = score(i)
    if (s > bestScore) {
      bestScore = s
      best = i
    }
  }
  console.error(`evaluated=${evaluated}/${order.length} score=${bestScore.toFixed(1)}`)
  console.log(`${Math.floor(best / W)} ${best % W}`)
}
