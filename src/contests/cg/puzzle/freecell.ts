// 🎮 CodinGame Puzzle - freecell
// https://www.codingame.com/training/hard/freecell

// Best-first search over FreeCell states (supermoves included, autoplay
// simulated after each move). The whole plan is emitted in one line. When the
// search needs more time than a turn allows, a neutral pair of moves is played
// and the same search resumes on the next turn.

const RANKS = "A23456789TJQK"
const SUITS = "CDHS"
const CELLS = "abcd"

type State = { cas: number[][]; cells: number[]; fnd: number[] }

const suitOf = (c: number) => (c / 13) | 0
const rankOf = (c: number) => c % 13
const isRed = (c: number) => {
  const s = suitOf(c)
  return s === 1 || s === 2
}
const parseCard = (w: string) => SUITS.indexOf(w[1]) * 13 + RANKS.indexOf(w[0])
// true when card a can be stacked on card b in a cascade
const fits = (a: number, b: number) => rankOf(a) + 1 === rankOf(b) && isRed(a) !== isRed(b)

const clone = (s: State): State => ({
  cas: s.cas.map(c => c.slice()),
  cells: s.cells.slice(),
  fnd: s.fnd.slice(),
})

const keyOf = (s: State) => {
  const cells = s.cells
    .filter(c => c >= 0)
    .sort((a, b) => a - b)
    .map(c => String.fromCharCode(48 + c))
    .join("")
  const cas = s.cas.map(c => String.fromCharCode(...c.map(x => 48 + x))).sort()
  return s.fnd.join(",") + "|" + cells + "|" + cas.join("/")
}

// a card is autoplayed when it is safe: aces and twos always, otherwise when
// both opposite-colour foundations already hold the rank just below
const safeHome = (s: State, x: number) => {
  const r = rankOf(x)
  if (s.fnd[suitOf(x)] !== r) return false
  if (r <= 1) return true
  const opp = isRed(x) ? [0, 3] : [1, 2]
  return s.fnd[opp[0]] >= r && s.fnd[opp[1]] >= r
}

// automatic foundation moves
const autoplay = (s: State) => {
  let moved = true
  while (moved) {
    moved = false
    for (const c of s.cas) {
      while (c.length > 0) {
        const x = c[c.length - 1]
        if (!safeHome(s, x)) break
        s.fnd[suitOf(x)]++
        c.pop()
        moved = true
      }
    }
    for (let i = 0; i < 4; i++) {
      const x = s.cells[i]
      if (x >= 0 && safeHome(s, x)) {
        s.fnd[suitOf(x)]++
        s.cells[i] = -1
        moved = true
      }
    }
  }
}

// length of the alternating descending run at the bottom of a cascade
const runLength = (c: number[]) => {
  if (c.length === 0) return 0
  let n = 1
  while (n < c.length && fits(c[c.length - n], c[c.length - n - 1])) n++
  return n
}

// all successor states with their move label
const successors = (s: State): [string, State][] => {
  const out: [string, State][] = []
  const free = s.cells.filter(c => c < 0).length
  const freeCell = s.cells.indexOf(-1)
  const empty = s.cas.filter(c => c.length === 0).length
  const firstEmpty = s.cas.findIndex(c => c.length === 0)
  const push = (m: string, n: State) => {
    autoplay(n)
    out.push([m, n])
  }
  for (let i = 0; i < 8; i++) {
    const src = s.cas[i]
    if (src.length === 0) continue
    const x = src[src.length - 1]
    if (s.fnd[suitOf(x)] === rankOf(x)) {
      const n = clone(s)
      n.cas[i].pop()
      n.fnd[suitOf(x)]++
      push(`${i + 1}h`, n)
    }
    const run = runLength(src)
    for (let j = 0; j < 8; j++) {
      if (j === i) continue
      const dst = s.cas[j]
      let cnt = 0
      if (dst.length === 0) {
        if (j !== firstEmpty) continue
        cnt = Math.min(run, (free + 1) * (1 << (empty - 1)))
        if (cnt === src.length) continue
      } else {
        const t = dst[dst.length - 1]
        const need = rankOf(t) - 1 - rankOf(x)
        if (need < 0 || need >= run) continue
        const top = src[src.length - 1 - need]
        if (!fits(top, t)) continue
        cnt = need + 1
        if (cnt > (free + 1) * (1 << empty)) continue
      }
      const n = clone(s)
      const moved = n.cas[i].splice(n.cas[i].length - cnt, cnt)
      n.cas[j].push(...moved)
      push(`${i + 1}${j + 1}`, n)
    }
    if (freeCell >= 0) {
      const n = clone(s)
      n.cells[freeCell] = n.cas[i].pop()!
      push(`${i + 1}${CELLS[freeCell]}`, n)
    }
  }
  for (let k = 0; k < 4; k++) {
    const x = s.cells[k]
    if (x < 0) continue
    if (s.fnd[suitOf(x)] === rankOf(x)) {
      const n = clone(s)
      n.cells[k] = -1
      n.fnd[suitOf(x)]++
      push(`${CELLS[k]}h`, n)
    }
    for (let j = 0; j < 8; j++) {
      const dst = s.cas[j]
      if (dst.length === 0 ? j !== firstEmpty : !fits(x, dst[dst.length - 1])) continue
      const n = clone(s)
      n.cells[k] = -1
      n.cas[j].push(x)
      push(`${CELLS[k]}${j + 1}`, n)
    }
  }
  return out
}

const heuristic = (s: State) => {
  let home = 0
  for (const f of s.fnd) home += f
  let h = (52 - home) * 4
  // depth of the next card needed on each foundation
  for (let su = 0; su < 4; su++) {
    if (s.fnd[su] === 13) continue
    const want = su * 13 + s.fnd[su]
    for (const c of s.cas) {
      const p = c.indexOf(want)
      if (p >= 0) h += (c.length - 1 - p) * 2
    }
  }
  // disorder: cards not sitting on their natural successor
  for (const c of s.cas) {
    for (let i = 1; i < c.length; i++) if (!fits(c[i], c[i - 1])) h += 2
  }
  for (const x of s.cells) if (x >= 0) h += 2
  return h
}

// binary heap keyed by numbers
class Heap {
  keys: number[] = []
  vals: number[] = []
  get size() {
    return this.keys.length
  }
  push(k: number, v: number) {
    const ks = this.keys
    const vs = this.vals
    let i = ks.length
    ks.push(k)
    vs.push(v)
    while (i > 0) {
      const p = (i - 1) >> 1
      if (ks[p] <= k) break
      ks[i] = ks[p]
      vs[i] = vs[p]
      i = p
    }
    ks[i] = k
    vs[i] = v
  }
  pop(): number {
    const ks = this.keys
    const vs = this.vals
    const top = vs[0]
    const k = ks.pop()!
    const v = vs.pop()!
    const n = ks.length
    if (n > 0) {
      let i = 0
      while (true) {
        let c = 2 * i + 1
        if (c >= n) break
        if (c + 1 < n && ks[c + 1] < ks[c]) c++
        if (ks[c] >= k) break
        ks[i] = ks[c]
        vs[i] = vs[c]
        i = c
      }
      ks[i] = k
      vs[i] = v
    }
    return top
  }
}

// weighted best-first search, resumable across turns
class Search {
  states: State[]
  parent: number[] = [-1]
  moveOf: string[] = [""]
  depth: number[] = [0]
  seen: Set<string>
  heap = new Heap()
  best = 0
  bestH = Infinity
  goal = -1
  root: State
  constructor(root: State) {
    this.root = root
    this.states = [root]
    this.seen = new Set([keyOf(root)])
    this.heap.push(heuristic(root), 0)
  }
  // expands nodes until a solution is found, the deadline or the node cap
  run(deadline: number) {
    let iter = 0
    while (this.goal < 0 && this.heap.size > 0 && this.states.length < MAX_NODES) {
      if ((++iter & 127) === 0 && Date.now() > deadline) return
      const id = this.heap.pop()
      const s = this.states[id]
      if (s.fnd.every(f => f === 13)) {
        this.goal = id
        return
      }
      for (const [m, n] of successors(s)) {
        const k = keyOf(n)
        if (this.seen.has(k)) continue
        this.seen.add(k)
        const nid = this.states.length
        this.states.push(n)
        this.parent.push(id)
        this.moveOf.push(m)
        this.depth.push(this.depth[id] + 1)
        const h = heuristic(n)
        if (h < this.bestH) {
          this.bestH = h
          this.best = nid
        }
        this.heap.push(h + this.depth[id] * DEPTH_WEIGHT, nid)
      }
    }
  }
  get exhausted() {
    return this.goal < 0 && (this.heap.size === 0 || this.states.length >= MAX_NODES)
  }
  // moves leading to the solution (or to the most promising state so far)
  path(): string[] {
    let cur = this.goal >= 0 ? this.goal : this.best
    const out: string[] = []
    while (cur > 0) {
      out.push(this.moveOf[cur])
      cur = this.parent[cur]
    }
    return out.reverse()
  }
}

const MAX_NODES = 400000
const DEPTH_WEIGHT = 1

const readState = (): State => {
  readline()
  readline()
  const fnd = [0, 0, 0, 0]
  for (const w of readline().split(" ").slice(1)) {
    if (w.length === 3) fnd[SUITS.indexOf(w[0])] = RANKS.indexOf(w[2]) + 1
  }
  const cells = readline()
    .split(" ")
    .slice(1)
    .map(w => (w === "-" ? -1 : parseCard(w)))
  const cas: number[][] = []
  for (let i = 0; i < 8; i++) {
    cas.push(
      readline()
        .split(" ")
        .slice(1)
        .filter(w => w.length === 2)
        .map(parseCard)
    )
  }
  readline()
  readline()
  return { cas, cells, fnd }
}

// exact layout (cell and cascade positions matter, unlike keyOf)
const layoutOf = (s: State) => s.fnd.join(",") + "|" + s.cells.join(",") + "|" + s.cas.map(c => c.join(",")).join("/")

// successors plus cell-to-cell shuffles, which the search itself never needs
const waitMoves = (s: State): [string, State][] => {
  const out = successors(s)
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      if (s.cells[a] < 0 || s.cells[b] >= 0) continue
      const n = clone(s)
      n.cells[b] = n.cells[a]
      n.cells[a] = -1
      autoplay(n)
      out.push([CELLS[a] + CELLS[b], n])
    }
  }
  return out
}

// a pair of moves reaching exactly the target layout, used to wait for more
// thinking time without disturbing the game
const findNoop = (s: State, target: string): string[] | null => {
  for (const [m1, n1] of waitMoves(s)) {
    for (const [m2, n2] of waitMoves(n1)) {
      if (layoutOf(n2) === target) return [m1, m2]
    }
  }
  return null
}

let search: Search | null = null
let first = true
while (true) {
  const s = readState()
  const start = Date.now()
  const budget = first ? 850 : 40
  first = false
  // resume the previous search when the waiting moves brought us back to it
  const layout = layoutOf(s)
  if (search === null || layoutOf(search.root) !== layout) search = new Search(s)
  search.run(start + budget)
  let plan: string[] = []
  if (search.goal >= 0 || search.exhausted) {
    plan = search.path()
    search = null
  } else {
    plan = findNoop(s, layout) ?? []
    if (plan.length === 0) {
      // no way to wait: commit to the first move of the most promising line
      plan = search.path().slice(0, 1)
      search = null
    }
  }
  if (plan.length === 0) {
    const succ = successors(s)
    plan = succ.length > 0 ? [succ[0][0]] : ["1h"]
  }
  console.log(plan.join(" "))
}
