// 🎮 CodinGame Optimization - number-shifting
// https://www.codingame.com/training/optim/number-shifting
//
// Rules: a grid of numbers; a move takes a number v and pushes it exactly v cells
// U/D/L/R onto another non-zero number, which becomes a+v or |a-v| (the source
// cell empties). Clear the whole board to pass the level. Level n is generated
// by the referee from a hidden seed (spawns = 3 + n/2 numbers, grid grows when
// full); the program first prints a level password ("first_level" for level 0).
// Score = (0-based index of the last level solved) + 1, all in ONE run: after a
// solve the referee immediately sends the next level, so the bot plays levels
// back to back. Budget: 800 ms for the first move of each level, 50 ms per later
// move, 600 turns max, and a 30 s total game duration (CG costs ~130 ms/turn, so
// ~225 turns): the run must start from a late level's password.
//
// Approach: solve each level live on its first move turn with a DFS over moves
// (equal-value subtractions first, then subtractions, then additions), a Zobrist
// transposition set, and a cheap dead-end prune (a number with no other number
// left in its row or column can never be cleared), restarted with growing node
// limits and a fresh random tie-break order (heavy-tailed search: restarts are
// what took it from level 20 to 27). Then replay the plan one move per turn.
// Levels 15-26 of the known seed ship with plans precomputed offline by the same
// solver (safety against CG's slower CPU); unknown maps are solved live.
//
// Submitted (2 submissions): 100%, criteriaScore 27 (levels 20-26 from the
// embedded plans, level 27 not solved live), global rank 184 / 959 (top ~19%).
// Notes, harness and failed experiments: number-shifting-tools/NOTES.md.

// ---- Tunables -------------------------------------------------------------
// Password of level 20 (0-based) for the seed in the visible test, which is
// also the validator's seed. Starting from "first_level" is not viable: the CG
// runner costs ~130 ms per turn and aborts games longer than 30 s (~225 turns).
const FIRST_LEVEL_CODE = envStr("NS_START", "yhabewqsvmfnypxylgtlmurciloxojaq")
const SOLVE_BUDGET_MS = envNum("NS_BUDGET", 650) // limit is 800 ms on the first move of a level

function envNum(key: string, def: number): number {
  const p = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
  const v = p && p.env && p.env[key]
  return v ? +v : def
}
function envStr(key: string, def: string): string {
  const p = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
  return (p && p.env && p.env[key]) || def
}
const MAX_TT = 3000000 // transposition-set cap
const NOISE = envNum("NS_NOISE", 0.9) // random tie-break inside move classes (0 = deterministic, no restarts)
const RESTART_NODES = envNum("NS_RN", 3000) // first restart node budget
const RESTART_GROWTH = envNum("NS_RG", 1.3) // node budget growth per restart

// ---- Solver ---------------------------------------------------------------
const NS_DX = [0, 1, 0, -1]
const NS_DY = [1, 0, -1, 0]
const NS_DIRS = ["D", "R", "U", "L"]

function nsMix(a: number): number {
  a = Math.imul(a ^ (a >>> 16), 0x7feb352d)
  a = Math.imul(a ^ (a >>> 15), 0x846ca68b)
  return (a ^ (a >>> 16)) >>> 0
}

class NsTimeout extends Error {}

let nsSeed = envNum("NS_SEED", 12345)
function rnd(): number {
  nsSeed ^= nsSeed << 13
  nsSeed ^= nsSeed >>> 17
  nsSeed ^= nsSeed << 5
  return (nsSeed >>> 0) / 4294967296
}

function solveLevel(w: number, h: number, init: number[], deadline: number): string[] | null {
  const g = init.slice()
  const rowCnt = new Int32Array(h)
  const colCnt = new Int32Array(w)
  let count = 0
  let h1 = 0
  let h2 = 0
  const z1 = (c: number, v: number) => nsMix(c * 65537 + v * 977 + 12345)
  const z2 = (c: number, v: number) => nsMix(c * 31337 + v * 7919 + 999331)
  const resetState = () => {
    count = h1 = h2 = 0
    rowCnt.fill(0)
    colCnt.fill(0)
    for (let c = 0; c < w * h; c++) {
      if (g[c]) {
        count++
        rowCnt[(c / w) | 0]++
        colCnt[c % w]++
        h1 ^= z1(c, g[c])
        h2 ^= z2(c, g[c])
      }
    }
  }
  resetState()
  const seen = new Set<number>()
  const path: string[] = []
  let nodes = 0
  let nodeLimit = 0

  const setCell = (c: number, v: number) => {
    const old = g[c]
    if (old) {
      h1 ^= z1(c, old)
      h2 ^= z2(c, old)
    }
    if (v) {
      h1 ^= z1(c, v)
      h2 ^= z2(c, v)
    }
    if (!old && v) {
      count++
      rowCnt[(c / w) | 0]++
      colCnt[c % w]++
    } else if (old && !v) {
      count--
      rowCnt[(c / w) | 0]--
      colCnt[c % w]--
    }
    g[c] = v
  }

  const isolated = (c: number) => g[c] !== 0 && rowCnt[(c / w) | 0] === 1 && colCnt[c % w] === 1

  const dfs = (): boolean => {
    if (count === 0) return true
    if (count === 1) return false
    if (++nodes > nodeLimit || ((nodes & 1023) === 0 && Date.now() > deadline)) throw new NsTimeout()
    const key = (h1 >>> 0) * 2097152 + (h2 & 0x1fffff)
    if (seen.has(key)) return false
    if (seen.size < MAX_TT) seen.add(key)

    // generate moves: [priority, src, dst, newVal, dir, op]
    const moves: number[] = []
    for (let c = 0; c < w * h; c++) {
      const v = g[c]
      if (!v) continue
      const x = c % w
      const y = (c / w) | 0
      for (let d = 0; d < 4; d++) {
        const nx = x + NS_DX[d] * v
        const ny = y + NS_DY[d] * v
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const t = ny * w + nx
        const tv = g[t]
        if (!tv) continue
        const diff = Math.abs(tv - v)
        moves.push((diff === 0 ? 0 : 1) + rnd() * NOISE, c, t, diff, d, 0)
        moves.push(2 + rnd() * NOISE, c, t, tv + v, d, 1)
      }
    }
    const n = moves.length / 6
    const order: number[] = []
    for (let i = 0; i < n; i++) order.push(i)
    order.sort((a, b) => moves[a * 6] - moves[b * 6])
    for (const i of order) {
      const c = moves[i * 6 + 1]
      const t = moves[i * 6 + 2]
      const nv = moves[i * 6 + 3]
      const v = g[c]
      const tv = g[t]
      setCell(c, 0)
      setCell(t, nv)
      // dead-end prune: a number with no other number left in its row or
      // column can never be cleared (only cells of c's and t's lines changed)
      let dead = false
      const cx = c % w,
        cy = (c / w) | 0,
        tx = t % w,
        ty = (t / w) | 0
      if (count > 0) {
        for (let xx = 0; xx < w && !dead; xx++) {
          if (isolated(cy * w + xx) || isolated(ty * w + xx)) dead = true
        }
        for (let yy = 0; yy < h && !dead; yy++) {
          if (isolated(yy * w + cx) || isolated(yy * w + tx)) dead = true
        }
      }
      if (!dead) {
        path.push(`${cx} ${cy} ${NS_DIRS[moves[i * 6 + 4]]} ${moves[i * 6 + 5] ? "+" : "-"}`)
        if (dfs()) return true
        path.pop()
      }
      setCell(t, tv)
      setCell(c, v)
    }
    return false
  }

  // restarts with growing node limits and a fresh random move order
  let limit = RESTART_NODES
  for (;;) {
    nodeLimit = nodes + limit
    seen.clear()
    path.length = 0
    try {
      if (dfs()) return path
      if (NOISE === 0) return null
    } catch (e) {
      if (!(e instanceof NsTimeout)) throw e
      if (Date.now() > deadline) return null
      g.splice(0, g.length, ...init)
      resetState()
    }
    limit = Math.floor(limit * RESTART_GROWTH)
  }
}

// ---- Precomputed plans ----------------------------------------------------
// Plans found offline by this same solver with a 15 s budget (number-shifting-
// tools/sim.mjs + embed.mjs), keyed by a hash of the level text. Used only when
// the received map hashes to a key AND the plan replays to an empty board;
// anything else is solved live, so a different hidden seed only costs speed.
// PLANS-BEGIN
const PLANS: Record<string, string> = {
  hjfqxc: "60D- 54L- 01D- 73L- 43U- 40L- 72L- 32L- 02U- 10L-", // level 15
  mvg6gu: "41R- 60D- 02R- 42R- 12R- 71D- 74U- 52R+ 72L+ 62L- 22D-", // level 16
  "1apxitg": "00D- 22R- 12U- 04R- 74L- 01R- 21R- 10R- 64U- 61L- 40D-", // level 17
  "1tevfei": "31R- 54U- 52L- 24R- 04R- 22L- 44R- 73D- 62L- 01D- 03U- 12L-", // level 18
  "5qdmni": "34U- 53U- 31R- 01R- 64L- 00R- 71L- 50L- 70L- 10D+ 11R- 51D-", // level 19
  ea86zk: "12R- 61D- 33R- 50D- 14R- 73L- 13U- 54R- 70D- 44L- 64L+ 04R- 24R-", // level 20
  d4fuyg: "33U- 04R- 72L- 20D- 64L- 24R- 44L- 00D- 02U- 71L- 01R- 31R- 50D-", // level 21
  "1o1a8ni": "10R- 62L- 41L- 11R- 32R- 64U- 02R- 20D- 53L- 42L- 01R- 61L- 22U- 23U-", // level 22
  "1n94f5c": "02R- 34U- 61L- 31R- 11R- 14U- 43L- 72U- 24U- 22U- 71L- 51L-", // level 23
  rix85c: "31R- 74L- 54R- 24U- 23R- 10D- 42U- 13U- 11L- 41R- 21R- 03D+ 04U+ 01R- 61R-", // level 24
  "1in1rpf": "52L- 14R- 02R- 10R- 64L- 00D- 63L- 43L- 03R- 04R- 72D- 31D- 34U- 23R- 30D- 33L-", // level 25
  "3asat0": "52U- 23R- 64U- 03D- 01D- 30L- 21D- 22U- 13U- 74U- 20L- 71D+ 72L- 02U- 10L-", // level 26
}
// PLANS-END

function nsHash(s: string): string {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0).toString(36)
}

function checkPlan(w: number, h: number, init: number[], plan: string[]): boolean {
  const g = init.slice()
  for (const mv of plan) {
    const [xs, ys, ds] = mv.split(" ")
    const x = +xs,
      y = +ys,
      d = "DRUL".indexOf(ds)
    if (d < 0 || x < 0 || y < 0 || x >= w || y >= h) return false
    const v = g[y * w + x]
    const nx = x + NS_DX[d] * v,
      ny = y + NS_DY[d] * v
    if (!v || nx < 0 || ny < 0 || nx >= w || ny >= h || !g[ny * w + nx]) return false
    const t = g[ny * w + nx]
    g[ny * w + nx] = mv.endsWith("+") ? t + v : Math.abs(t - v)
    g[y * w + x] = 0
  }
  return g.every(v => v === 0)
}

// ---- Main loop ------------------------------------------------------------
console.log(FIRST_LEVEL_CODE)
for (;;) {
  const line = readline()
  if (line === undefined || line === null || line === "") break
  const start = Date.now()
  const [w, h] = line.split(" ").map(Number)
  const cells: number[] = new Array(w * h).fill(0)
  const text = [line]
  for (let y = 0; y < h; y++) {
    const rowText = readline()
    text.push(rowText)
    const row = rowText.split(" ").map(Number)
    for (let x = 0; x < w; x++) cells[y * w + x] = row[x]
  }
  const stored = PLANS[nsHash(text.join("\n"))]
  const storedPlan = stored ? stored.split(" ").map(m => m.split("").join(" ")) : null
  const plan =
    storedPlan && checkPlan(w, h, cells, storedPlan) ? storedPlan : solveLevel(w, h, cells, start + SOLVE_BUDGET_MS)
  console.error(`level ${w}x${h} n=${cells.filter(v => v).length} solved=${!!plan} in ${Date.now() - start}ms`)
  if (!plan) {
    console.log("0 0 D +") // give up: the run ends, previous levels still count
    break
  }
  for (const mv of plan) console.log(mv)
}
