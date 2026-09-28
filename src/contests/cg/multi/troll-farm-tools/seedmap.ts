// Exact referee map from a CodinGame seed: the SDK's MultiplayerGameManager seeds a SecureRandom
// SHA1PRNG (ported below) with the long seed; Board.createMap draws x before y and uses
// nextInt(origin, bound) for the tree ages. Replays show the seed rounded to a double, so
// findSeed() searches the neighbourhood for the value that rebuilds the recorded map. Offline tool.
import { createHash } from "crypto"
import { Game, GRASS, WATER, ROCK, IRONCELL, SHACK, MAX_SIZE, MAX_FRUITS, newTree, tickTree, neighbors, nearType, bfs } from "./engine.js"

const MASK = (1n << 48n) - 1n
export class JavaRandom {
  s: bigint
  constructor(seed: bigint) {
    this.s = (seed ^ 0x5deece66dn) & MASK
  }
  next(bits: number): number {
    this.s = (this.s * 0x5deece66dn + 0xbn) & MASK
    return Number(BigInt.asIntN(32, this.s >> BigInt(48 - bits)))
  }
  nextInt(bound?: number): number {
    if (bound === undefined) return this.next(32)
    if ((bound & -bound) === bound) return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n)
    let bits: number, val: number
    do {
      bits = this.next(31)
      val = bits % bound
    } while (bits - val + (bound - 1) > 0x7fffffff)
    return val
  }
  /** RandomSupport.boundedNextInt (Java 17 default RandomGenerator.nextInt(origin, bound)). */
  nextIntRange(origin: number, bound: number): number {
    let r = this.nextInt()
    const n = bound - origin
    const m = n - 1
    if ((n & m) === 0) return (r & m) + origin
    for (let u = r >>> 1; u + m - (r = u % n) > 0x7fffffff; u = this.nextInt() >>> 1);
    return r + origin
  }
}

/** java.security.SecureRandom("SHA1PRNG") seeded with setSeed(long), with Random's int helpers. */
export class Sha1Prng extends JavaRandom {
  state: Buffer
  rem: Buffer = Buffer.alloc(20)
  remCount = 0
  constructor(seed: bigint) {
    super(0n)
    const b = Buffer.alloc(8)
    b.writeBigInt64LE(BigInt.asIntN(64, seed))
    this.state = createHash("sha1").update(b).digest()
  }
  nextBytes(n: number): number[] {
    const out: number[] = []
    let r = this.remCount
    if (r > 0) {
      const todo = Math.min(n, 20 - r)
      for (let i = 0; i < todo; i++) out.push(this.rem[r++])
      this.remCount += todo
    }
    while (out.length < n) {
      const o = createHash("sha1").update(this.state).digest()
      let last = 1
      let zf = false
      for (let i = 0; i < 20; i++) {
        const v = ((this.state[i] << 24) >> 24) + ((o[i] << 24) >> 24) + last
        const t = v & 0xff
        zf = zf || this.state[i] !== t
        this.state[i] = t
        last = v >> 8
      }
      if (!zf) this.state[0] = (this.state[0] + 1) & 0xff
      const todo = Math.min(n - out.length, 20)
      for (let i = 0; i < todo; i++) out.push(o[i])
      this.rem = o
      this.remCount += todo
    }
    this.remCount %= 20
    return out
  }
  next(bits: number): number {
    const nb = (bits + 7) >> 3
    let v = 0
    for (const x of this.nextBytes(nb)) v = ((v << 8) + x) | 0
    return (v >>> (nb * 8 - bits)) | 0
  }
}

/** The seed near `approx` (a double-rounded replay seed) whose map is `wantInit` (the init input lines). */
export function findSeed(approx: string, wantInit: string, span = 4096): bigint | null {
  const s = BigInt(approx.trim().replace(/^seed=/, ""))
  for (let d = 0n; d <= BigInt(span); d++)
    for (const c of d === 0n ? [s] : [s - d, s + d]) {
      const g = javaGame(c)
      let t = `${g.W} ${g.H}`
      if (!wantInit.startsWith(t)) continue
      for (let y = 0; y < g.H; y++) {
        let row = ""
        for (let x = 0; x < g.W; x++) {
          const k = g.grid[y * g.W + x]
          row += k === GRASS ? "." : k === WATER ? "~" : k === IRONCELL ? "+" : k === ROCK ? "#" : y * g.W + x === g.shack[0] ? "0" : "1"
        }
        t += "\n" + row
      }
      if (t === wantInit) return c
    }
  return null
}

export function javaGame(seed: bigint, league = 4): Game {
  const rng = new Sha1Prng(seed)
  for (;;) {
    const H = rng.nextInt(4) + 8
    const W = 2 * H
    const g: Game = {
      W,
      H,
      grid: new Uint8Array(W * H),
      shack: [0, 0],
      inv: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ],
      trees: [],
      trolls: [],
      nextId: 0,
      turn: 0,
      turnsUntilEnd: 0,
      over: false,
      dead: [false, false],
    }
    const mirror = (c: number) => W * H - 1 - c
    const treeAt = new Uint8Array(W * H)
    const randomCell = () => {
      for (;;) {
        const x = rng.nextInt(W)
        const c = rng.nextInt(H) * W + x
        if (g.grid[c] === GRASS && !treeAt[c]) return c
      }
    }
    const set = (c: number, t: number) => {
      g.grid[c] = t
      g.grid[mirror(c)] = t
    }
    const nearEdge = (c: number) => neighbors(g, c).length < 4
    if (league > 2) {
      let maxTotalRiver = W * H - Math.trunc((2 * (10 + 4 * 4 + 2 + 1) * 4) / 5)
      const rivers = rng.nextInt(2) + 2
      for (let i = 0; i < rivers; i++) {
        let river: number | null = randomCell()
        for (let j = 0; j < 10 && nearEdge(river); j++) river = randomCell()
        while (river !== null && maxTotalRiver > 0) {
          set(river, WATER)
          const dir = rng.nextInt(4)
          const x: number = river % W
          const y: number = (river - x) / W
          const nx = x + [0, 1, 0, -1][dir]
          const ny = y + [1, 0, -1, 0][dir]
          river = nx < 0 || ny < 0 || nx >= W || ny >= H ? null : ny * W + nx
          maxTotalRiver -= 2
        }
      }
    }
    const inv = [0, 1, 2, 3, 4].map(() => 2 + rng.nextInt(9))
    const pickShack = () => {
      const x = rng.nextInt(W / 2)
      return rng.nextInt(H) * W + x
    }
    let shack = pickShack()
    while (g.grid[shack] === WATER) shack = pickShack()
    set(shack, SHACK)
    g.shack = [shack, mirror(shack)]
    for (let p = 0; p < 2; p++) {
      g.inv[p] = [...inv, 0]
      g.trolls.push({ id: g.nextId++, owner: p, cell: g.shack[p], speed: 1, carry: 1, harvest: 1, chop: 1, inv: [0, 0, 0, 0, 0, 0] })
    }
    const place = (type: number, min: number, max: number) => {
      const count = rng.nextInt(max - min + 1) + min
      for (let i = 0; i < count; i++) set(randomCell(), type)
    }
    place(IRONCELL, 1, 2)
    place(ROCK, 1, 10)
    for (let type = 0; type < 4; type++) {
      const count = rng.nextInt(3) + 1
      for (let i = 0; i < count; i++) {
        let c = randomCell()
        const t = newTree(g, type, c)
        const ticks = rng.nextIntRange(1, t.growth * (MAX_SIZE + MAX_FRUITS))
        for (let k = 0; k < ticks; k++) tickTree(t)
        g.trees.push(t)
        treeAt[c] = 1
        const m = mirror(c)
        if (m === c) break
        c = m
        const t2 = newTree(g, type, c)
        for (let k = 0; k < ticks; k++) tickTree(t2)
        g.trees.push(t2)
        treeAt[c] = 1
      }
    }
    if (valid(g)) return g
  }
}

function valid(g: Game): boolean {
  const s0 = g.shack[0]
  if (nearType(g, s0, IRONCELL)) return false
  if (!neighbors(g, s0).some(n => g.grid[n] === GRASS)) return false
  let ironReach = false
  // Java scans x-major: walkables.get(0) is the first grass cell by column
  let firstWalk = -1
  for (let x = 0; x < g.W && firstWalk < 0; x++)
    for (let y = 0; y < g.H; y++)
      if (g.grid[y * g.W + x] === GRASS) {
        firstWalk = y * g.W + x
        break
      }
  for (let c = 0; c < g.W * g.H; c++) if (g.grid[c] === IRONCELL && neighbors(g, c).some(n => g.grid[n] === GRASS)) ironReach = true
  if (!ironReach) return false
  const d = bfs(g, [firstWalk])
  for (let c = 0; c < g.W * g.H; c++) if (g.grid[c] === GRASS && d[c] < 0) return false
  const sd = bfs(g, [s0])
  let opp = 1e9
  for (const n of neighbors(g, g.shack[1])) if (g.grid[n] === GRASS) opp = Math.min(opp, sd[n] + 1)
  return opp <= 16
}
