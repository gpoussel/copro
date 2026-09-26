// Offline referee + bench for flames-extinguisher.
// Runs the TS solver in-process (Node >= 22 strips types) by overriding the
// global readline()/console.log, one fresh module import per game.
//   node bench.mjs [nGames=20] [seed0=1]      (env FE_* tunables are read by the solver)
//   node bench.mjs tests                      (the 10 visible fixed tests' region picks)
// Referee written from the statement + calibrated with DESYNC checks on the real runner.
import { pathToFileURL } from "node:url"
import path from "node:path"

const MAP = [
  "###################################", "###################################", "#############....##################",
  "############......#################", "###########........################", "##########..........###############",
  "#########............##############", "########..............#############", "#######................############",
  "######..................###########", "#####.................#..##########", "####......................#########",
  "###........................########", "##..........................#######", "##...........................######",
  "##...............S............#####", "###............................####", "####............................###",
  "#####............................##", "######...........................##", "#######..........................##",
  "########.........................##", "#########........................##", "##########......................###",
  "###########....................####", "############..................#####", "#############................######",
  "##############..............#######", "###############............########", "################..........#########",
  "#################........##########", "##################......###########", "###################################",
  "###################################",
]
const W = 35, H = 34
// 4 regions, 4 triples each, fixed rank order (observed identical on every test)
const REGIONS = [
  [[[4, 12], [14, 8], [20, 21]], [[3, 13], [12, 8], [20, 23]], [[5, 13], [14, 6], [22, 21]], [[5, 11], [16, 8], [20, 19]]],
  [[[17, 6], [21, 15], [27, 19]], [[19, 6], [21, 17], [27, 21]], [[17, 4], [21, 13], [29, 19]], [[15, 6], [23, 15], [27, 17]]],
  [[[8, 9], [15, 11], [14, 22]], [[10, 9], [13, 11], [14, 25]], [[8, 7], [15, 13], [12, 22]], [[6, 9], [15, 9], [14, 20]]],
  [[[7, 15], [18, 11], [17, 24]], [[7, 17], [20, 11], [17, 26]], [[7, 13], [18, 9], [19, 24]], [[5, 15], [16, 11], [17, 22]]],
]
// region picks of the visible tests (A=0,B=1,C=2,D=3)
const TESTS = [
  "AB AB BD AD AC BC", "AC CD CD BC CD BD", "BC CD BD CD BD AD", "AB CD AB BC CD BD", "AB AC AB AB CD CD",
  "AC AD AD AB AC AC", "BC AD BC AC AD AC", "AB CD BC CD AC AC", "AB BC AC AC AB AC", "AC BD AD BD CD BD",
]

function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0
    return s / 4294967296
  }
}

const wall = (x, y) => x < 0 || y < 0 || x >= W || y >= H || MAP[y][x] === "#"
const sgn = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0)

class Game {
  constructor(picks) {
    this.picks = picks // array of 6 [r1,r2]
    this.rank = [0, 0, 0, 0]
    this.x = 17; this.y = 15
    this.hp = 40; this.ap = 10; this.jumps = 2
    this.flames = [] // [x,y]
    this.glyphs = []
    this.cycle = 0
    this.over = false; this.score = 0; this.reason = ""
    this.spawnGlyphs()
  }
  spawnGlyphs() {
    this.glyphs = []
    if (this.cycle < 6) {
      for (const r of this.picks[this.cycle]) {
        for (const c of REGIONS[r][this.rank[r]]) this.glyphs.push(c)
        this.rank[r] = (this.rank[r] + 1) % 4
      }
    }
  }
  flameAt(x, y) { return this.flames.findIndex((f) => f[0] === x && f[1] === y) }
  die(r) { this.over = true; this.score = 0; this.reason = r }
  fail(r) { this.over = true; this.score = -1; this.reason = r }
  input() {
    const L = [`${this.x} ${this.y}`, `${this.hp} ${this.ap} ${this.jumps}`, `${this.flames.length}`]
    for (const f of this.flames) L.push(`${f[0]} ${f[1]}`)
    L.push(`${this.glyphs.length}`)
    for (const g of this.glyphs) L.push(`${g[0]} ${g[1]}`)
    L.push("1", "PASS") // valid actions not used by the solver
    return L
  }
  attract(tx, ty, immo) {
    const key = (f) => {
      const dx = f[0] - tx, dy = f[1] - ty
      const d = Math.abs(dx) + Math.abs(dy)
      let ang = Math.atan2(dx, -dy)
      if (ang < 0) ang += 2 * Math.PI
      return d * 100 + ang
    }
    const order = [...this.flames].sort((a, b) => key(a) - key(b))
    const occupied = (x, y) => this.flameAt(x, y) >= 0
    for (const f of order) {
      const dx = tx - f[0], dy = ty - f[1]
      if (!dx && !dy) continue
      let mx = 0, my = 0
      if (!dx) my = sgn(dy)
      else if (!dy) mx = sgn(dx)
      else if (Math.abs(dx) === Math.abs(dy)) { mx = sgn(dx); my = sgn(dy) }
      else if (Math.abs(dx) > Math.abs(dy)) mx = sgn(dx)
      else my = sgn(dy)
      const nx = f[0] + mx, ny = f[1] + my
      const isChar = (x, y) => x === this.x && y === this.y
      if (isChar(nx, ny)) {
        if (!immo) return this.die("flame attracted on character")
        continue
      }
      if (wall(nx, ny) || occupied(nx, ny)) continue
      if (mx && my) {
        const bad = (x, y) => wall(x, y) || occupied(x, y) || isChar(x, y)
        if (bad(f[0] + mx, f[1]) || bad(f[0], f[1] + my)) continue
      }
      f[0] = nx; f[1] = ny
    }
  }
  act(cmd) {
    const [op, dir] = cmd.trim().split(" ")
    if (op === "PASS") {
      if (this.glyphs.length) {
        for (const g of this.glyphs)
          if (!(g[0] === this.x && g[1] === this.y) && this.flameAt(g[0], g[1]) < 0) this.flames.push([g[0], g[1]])
      } else if (this.cycle >= 6) {
        this.hp--
        if (this.hp <= 0) return this.die("bleed")
      }
      this.glyphs = []
      this.ap = 10; this.jumps = 2; this.cycle++
      this.spawnGlyphs()
      return
    }
    const C = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0], NE: [1, -1], SE: [1, 1], SW: [-1, 1], NW: [-1, -1] }[dir]
    if (!C) return this.fail("bad dir " + cmd)
    if (op === "MOVE" || op === "JUMP") {
      if (C[0] && C[1]) return this.fail("diag move")
      const k = op === "JUMP" ? 2 : 1
      if (this.ap < k || (k === 2 && this.jumps < 1)) return this.fail("no ap/jump " + cmd)
      const nx = this.x + C[0] * k, ny = this.y + C[1] * k
      if (wall(nx, ny)) return this.fail("wall " + cmd)
      this.ap -= k
      if (k === 2) this.jumps--
      this.x = nx; this.y = ny
      this.hp--
      if (this.hp <= 0) return this.die("hp")
      const fi = this.flameAt(nx, ny)
      if (fi >= 0) {
        this.hp++
        this.flames.splice(fi, 1)
        const adj = this.flames.filter((f) => Math.abs(f[0] - nx) <= 1 && Math.abs(f[1] - ny) <= 1)
        const moves = []
        for (const f of adj) {
          const dx = f[0] - nx, dy = f[1] - ny
          const tx = f[0] + dx, ty = f[1] + dy
          const bad = (x, y) => wall(x, y) || this.flameAt(x, y) >= 0 || (x === nx && y === ny)
          if (bad(tx, ty)) return this.die("push blocked")
          if (dx && dy && (bad(f[0] + dx, f[1]) || bad(f[0], f[1] + dy))) return this.die("diag push blocked")
          moves.push([f, tx, ty])
        }
        for (const [f, tx, ty] of moves) { f[0] = tx; f[1] = ty }
      }
      this.attract(nx, ny, false)
    } else if (op === "IMMO") {
      if (!(C[0] && C[1])) return this.fail("immo dir")
      if (this.ap < 1) return this.fail("no ap immo")
      const tx = this.x + C[0], ty = this.y + C[1]
      if (wall(tx, ty)) return this.fail("immo wall")
      this.ap--
      this.hp -= 5
      if (this.hp <= 0) return this.die("hp immo")
      this.attract(tx, ty, true)
    } else return this.fail("bad op " + cmd)
    if (this.over) return
    if (!this.flames.length && !this.glyphs.length && this.cycle >= 6) {
      this.over = true; this.score = this.hp; this.reason = "win"
    }
  }
}

class GameEnd extends Error {}

const solverPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../flames-extinguisher.ts")
let importCounter = 0
async function play(picks) {
  const g = new Game(picks)
  let queue = [`${H} ${W}`, ...MAP, ...g.input()]
  let turns = 0
  let maxMs = 0
  let lastT = performance.now()
  const origLog = console.log
  const origErr = console.error
  globalThis.readline = () => {
    if (!queue.length) throw new GameEnd()
    return queue.shift()
  }
  console.log = (line) => {
    const t = performance.now()
    maxMs = Math.max(maxMs, t - lastT)
    turns++
    const cmds = String(line).split(";")
    for (const c of cmds) {
      if (g.over) break
      g.act(c)
      if (c.trim() === "PASS") break
    }
    if (turns > 400) g.fail("too many turns")
    queue = g.over ? [] : g.input()
    lastT = performance.now()
  }
  if (!process.env.FE_DEBUG) console.error = () => {}
  try {
    await import(pathToFileURL(solverPath).href + "?g=" + importCounter++)
  } catch (e) {
    if (!(e instanceof GameEnd)) { console.log = origLog; console.error = origErr; throw e }
  } finally {
    console.log = origLog
    console.error = origErr
  }
  return { score: g.score, reason: g.reason, turns, maxMs: Math.round(maxMs), hp: g.hp, cycle: g.cycle, flames: g.flames.length }
}

const arg = process.argv[2] || "20"
let games = []
if (arg === "tests") {
  games = TESTS.map((t) => t.split(" ").map((p) => [p.charCodeAt(0) - 65, p.charCodeAt(1) - 65]))
} else {
  const n = +arg
  const seed0 = +(process.argv[3] || 1)
  for (let i = 0; i < n; i++) {
    const r = rng(seed0 + i * 7919)
    const picks = []
    for (let c = 0; c < 6; c++) {
      const a = Math.floor(r() * 4)
      let b = Math.floor(r() * 3)
      if (b >= a) b++
      picks.push([a, b])
    }
    games.push(picks)
  }
}
let tot = 0
const res = []
for (let i = 0; i < games.length; i++) {
  const r = await play(games[i])
  tot += Math.max(0, r.score)
  res.push(r.score)
  if (process.env.FE_VERBOSE) console.log(i, JSON.stringify(r))
}
console.log("scores", res.join(" "))
console.log(`total ${tot} mean ${(tot / games.length).toFixed(2)} zeros ${res.filter((s) => s <= 0).length}/${games.length}`)
