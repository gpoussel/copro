// 🎮 CodinGame Puzzle - mountain-range
// https://www.codingame.com/training/hard/mountain-range

// 1. Link visible characters into sections: each character is linked to the
//    neighbour (in the next column) allowed by the ridge transition rules;
//    when several are possible the lowest one (the front ridge) wins, and
//    links must be mutual.
// 2. Sections with hidden ends are paired (backtracking) through hidden,
//    monotone paths lying below the visible outline, or to the grid edges.
//    The assignment joining the most sections wins, provided each ridge has
//    one character per column and the depth order (lower visible character
//    is in front) is acyclic.
// 3. Each completed ridge becomes a sequence of slopes (with a virtual "/"
//    before and "\" after the grid); a summit is a "/" followed by "\".
const [H, W] = readline().split(" ").map(Number)
const g: string[] = []
for (let i = 0; i < H; i++) g.push((readline() ?? "").padEnd(W, " ").slice(0, W))
const BS = "\\"
const at = (r: number, c: number): string => (r >= 0 && r < H && c >= 0 && c < W ? g[r][c] : " ")
const CH = ["/", BS, "-"]

// row of the next character b (next column) after a at row r
function nextRow(a: string, r: number, b: string): number {
  if (a === "/") return b === BS ? r : r - 1
  if (a === BS) return b === "/" ? r : r + 1
  return b === "-" ? r : b === "/" ? r - 1 : r + 1
}
// row of the previous character a (previous column) before b at row r
function prevRow(a: string, b: string, r: number): number {
  if (a === "/") return b === BS ? r : r + 1
  if (a === BS) return b === "/" ? r : r - 1
  return b === "-" ? r : b === "/" ? r + 1 : r - 1
}

const top: number[] = []
for (let c = 0; c < W; c++) {
  let t = H
  for (let r = H - 1; r >= 0; r--) if (g[r][c] !== " ") t = r
  top.push(t)
}

const key = (r: number, c: number) => r * W + c
// candidate neighbours, lowest (front-most) first
const rightCands = new Map<number, number[]>()
const leftCands = new Map<number, number[]>()
for (let r = 0; r < H; r++)
  for (let c = 0; c < W; c++) {
    const a = g[r][c]
    if (a === " ") continue
    const rc: number[] = []
    for (const b of CH) {
      const rb = nextRow(a, r, b)
      if (at(rb, c + 1) === b) rc.push(rb)
    }
    rightCands.set(
      key(r, c),
      rc.sort((x, y) => y - x).map(rb => key(rb, c + 1))
    )
    const lc: number[] = []
    for (const p of CH) {
      const rp = prevRow(p, a, r)
      if (at(rp, c - 1) === p) lc.push(rp)
    }
    leftCands.set(
      key(r, c),
      lc.sort((x, y) => y - x).map(rp => key(rp, c - 1))
    )
  }
// link characters whose best still-available choices agree, until stable
const rightLink = new Map<number, number>()
const hasLeft = new Set<number>()
for (let changed = true; changed; ) {
  changed = false
  for (const [k, rc] of rightCands) {
    if (rightLink.has(k)) continue
    const b = rc.find(x => !hasLeft.has(x))
    if (b === undefined) continue
    const a = leftCands.get(b)!.find(x => !rightLink.has(x))
    if (a === k) {
      rightLink.set(k, b)
      hasLeft.add(b)
      changed = true
    }
  }
}

interface Section {
  chars: [number, number, string][]
}
const sections: Section[] = []
for (let r = 0; r < H; r++)
  for (let c = 0; c < W; c++) {
    if (g[r][c] === " " || hasLeft.has(key(r, c))) continue
    const chars: [number, number, string][] = []
    let k: number | undefined = key(r, c)
    while (k !== undefined) {
      const rr = Math.floor(k / W)
      const cc = k % W
      chars.push([rr, cc, g[rr][cc]])
      k = rightLink.get(k)
    }
    sections.push({ chars })
  }

const LIM = H + W + 5
// hidden path between end char A and start char B using the allowed set
function pathOk(ra: number, ta: string, ca: number, rb: number, tb: string, cb: number, set: string[]): boolean {
  let states = new Set<string>([ra + "," + ta])
  for (let c = ca + 1; c < cb; c++) {
    const ns = new Set<string>()
    for (const s of states) {
      const [rs, a] = s.split(",")
      for (const b of set) {
        const nr = nextRow(a, Number(rs), b)
        if (nr >= top[c] && nr <= LIM) ns.add(nr + "," + b)
      }
    }
    states = ns
    if (states.size === 0) return false
  }
  for (const s of states) {
    const [rs, a] = s.split(",")
    if (nextRow(a, Number(rs), tb) === rb) return true
  }
  return false
}
// contribution of the hidden path: "" flat, "/" rising, "\" falling, null impossible
function pairTok(A: Section, B: Section): string | null {
  const [ra, ca, ta] = A.chars[A.chars.length - 1]
  const [rb, cb, tb] = B.chars[0]
  if (cb - ca < 2) return null
  if (pathOk(ra, ta, ca, rb, tb, cb, ["-"])) return ""
  if (pathOk(ra, ta, ca, rb, tb, cb, ["-", "/"])) return "/"
  if (pathOk(ra, ta, ca, rb, tb, cb, ["-", BS])) return BS
  return null
}
function leftEdgeOk(B: Section): boolean {
  let [r, c, t] = B.chars[0]
  while (c > 0) {
    r = prevRow("/", t, r)
    c--
    t = "/"
    if (r < top[c] || r > LIM) return false
  }
  return true
}
function rightEdgeOk(A: Section): boolean {
  let [r, c, t] = A.chars[A.chars.length - 1]
  while (c < W - 1) {
    r = nextRow(t, r, BS)
    c++
    t = BS
    if (r < top[c] || r > LIM) return false
  }
  return true
}

const n = sections.length
const Rs = sections
  .map((_, i) => i)
  .filter(i => sections[i].chars[sections[i].chars.length - 1][1] < W - 1)
  .sort(
    (x, y) => sections[x].chars[sections[x].chars.length - 1][1] - sections[y].chars[sections[y].chars.length - 1][1]
  )
const isL = sections.map(s => s.chars[0][1] > 0)
const lOk = sections.map((s, i) => isL[i] && leftEdgeOk(s))
const rOk = sections.map(s => rightEdgeOk(s))
const toks: (string | null)[][] = []
for (let i = 0; i < n; i++) {
  toks.push([])
  for (let j = 0; j < n; j++) toks[i].push(isL[j] && i !== j ? pairTok(sections[i], sections[j]) : null)
}
const next = new Array<number>(n).fill(-1) // -1: right edge
const used = new Array<boolean>(n).fill(false)
// columns: visible characters (row, section)
const cols: [number, number][][] = Array.from({ length: W }, () => [])
sections.forEach((s, i) => s.chars.forEach(([r, c]) => cols[c].push([r, i])))
// a completed assignment is valid if no ridge has two characters in a column
// and the "in front of" relation (lower visible char is in front) is acyclic
function consistent(): boolean {
  const ridge = new Array<number>(n).fill(-1)
  let m = 0
  for (let s = 0; s < n; s++) {
    if (used[s]) continue
    for (let cur = s; cur >= 0; cur = next[cur]) ridge[cur] = m
    m++
  }
  const front: Set<number>[] = Array.from({ length: m }, () => new Set<number>())
  for (const col of cols)
    for (let a = 0; a < col.length; a++)
      for (let b = 0; b < col.length; b++) {
        if (a === b) continue
        const [ra, sa] = col[a]
        const [rb, sb] = col[b]
        if (ridge[sa] === ridge[sb]) return false
        if (ra > rb) front[ridge[sa]].add(ridge[sb]) // a is in front of b
      }
  // cycle detection
  const state = new Array<number>(m).fill(0)
  const dfs = (u: number): boolean => {
    state[u] = 1
    for (const v of front[u]) {
      if (state[v] === 1) return false
      if (state[v] === 0 && !dfs(v)) return false
    }
    state[u] = 2
    return true
  }
  for (let u = 0; u < m; u++) if (state[u] === 0 && !dfs(u)) return false
  return true
}
// maximise the number of joined sections (visible parts must be grouped
// into the same ridge whenever they can be connected)
let bestPairs = -1
let bestNext: number[] = []
let bestUsed: boolean[] = []
function search(idx: number, pairs: number): void {
  if (pairs + Rs.length - idx <= bestPairs) return
  if (idx === Rs.length) {
    for (let j = 0; j < n; j++) if (isL[j] && !used[j] && !lOk[j]) return
    if (!consistent()) return
    bestPairs = pairs
    bestNext = next.slice()
    bestUsed = used.slice()
    return
  }
  const i = Rs[idx]
  const cands: number[] = []
  for (let j = 0; j < n; j++) if (!used[j] && toks[i][j] !== null) cands.push(j)
  cands.sort((x, y) => sections[x].chars[0][1] - sections[y].chars[0][1])
  for (const j of cands) {
    used[j] = true
    next[i] = j
    search(idx + 1, pairs + 1)
    used[j] = false
  }
  next[i] = -1
  if (rOk[i]) search(idx + 1, pairs)
}
search(0, 0)
next.splice(0, n, ...bestNext)
used.splice(0, n, ...bestUsed)

let summits = 0
for (let s = 0; s < n; s++) {
  if (used[s]) continue
  // ridge starting at section s
  const seq: string[] = ["/"]
  let cur = s
  while (true) {
    for (const [, , t] of sections[cur].chars) if (t !== "-") seq.push(t)
    const nx = next[cur]
    if (nx < 0) break
    const t = toks[cur][nx]
    if (t) seq.push(t)
    cur = nx
  }
  seq.push(BS)
  for (let i = 0; i + 1 < seq.length; i++) if (seq[i] === "/" && seq[i + 1] === BS) summits++
}
console.log(summits)
