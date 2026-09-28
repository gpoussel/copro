// 🎮 CodinGame Multiplayer - twixt-pp
// https://www.codingame.com/multiplayer/bot-programming/twixt-pp
//
// 12x12 holes minus corners. Pegs link automatically to own pegs a knight's
// move away unless the link would cross an enemy link (PP: own links may
// cross). The first player joins rows 1 and 12, the second columns A and L;
// nobody plays in the opponent's border rows. Each candidate peg is scored by
// the change in "empty holes still needed" for both sides (0-1 BFS over
// knight links that cross no enemy link), like a Hex distance evaluation.

const TURN_MS = 250
const DEFENCE = 2 // weight of the opponent's distance
const FIRST_TURN_MS = 800
const N = 12
const HOLES = N * N
const KNIGHT: [number, number][] = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
]
const isCorner = (c: number, r: number) => (c === 0 || c === N - 1) && (r === 0 || r === N - 1)

// Links are identified by a < b hole indexes: key a * HOLES + b.
const linkKey = (a: number, b: number) => (a < b ? a * HOLES + b : b * HOLES + a)
const links: number[] = [] // every possible knight link
const linksOf: number[][] = Array.from({ length: HOLES }, () => [])
for (let a = 0; a < HOLES; a++) {
  const c = a % N
  const r = Math.floor(a / N)
  if (isCorner(c, r)) continue
  for (const [dc, dr] of KNIGHT) {
    const cc = c + dc
    const rr = r + dr
    if (cc < 0 || cc >= N || rr < 0 || rr >= N || isCorner(cc, rr)) continue
    const b = rr * N + cc
    linksOf[a].push(b)
    if (a < b) links.push(linkKey(a, b))
  }
}
// Segments cross properly (sharing an end is not a cross).
function crosses(k1: number, k2: number): boolean {
  const a = Math.floor(k1 / HOLES)
  const b = k1 % HOLES
  const c = Math.floor(k2 / HOLES)
  const d = k2 % HOLES
  if (a === c || a === d || b === c || b === d) return false
  const P = (i: number): [number, number] => [i % N, Math.floor(i / N)]
  const [ax, ay] = P(a)
  const [bx, by] = P(b)
  const [cx, cy] = P(c)
  const [dx, dy] = P(d)
  const o = (px: number, py: number, qx: number, qy: number, sx: number, sy: number) =>
    Math.sign((qx - px) * (sy - py) - (qy - py) * (sx - px))
  return (
    o(ax, ay, bx, by, cx, cy) * o(ax, ay, bx, by, dx, dy) < 0 &&
    o(cx, cy, dx, dy, ax, ay) * o(cx, cy, dx, dy, bx, by) < 0
  )
}
const crossing = new Map<number, number[]>()
for (const k of links) crossing.set(k, [])
for (let i = 0; i < links.length; i++) {
  for (let j = i + 1; j < links.length; j++) {
    if (crosses(links[i], links[j])) {
      crossing.get(links[i])!.push(links[j])
      crossing.get(links[j])!.push(links[i])
    }
  }
}

// owner[h]: 1 us, 2 them, 0 empty. linkOwner: link key -> owner.
const owner = new Uint8Array(HOLES)
const linkOwner = new Map<number, number>()
let meFirst = true

const parse = (s: string) => (parseInt(s.slice(1)) - 1) * N + (s.charCodeAt(0) - 65)
const holeName = (h: number) => String.fromCharCode(65 + (h % N)) + String(Math.floor(h / N) + 1)

// Does side `p` (1 / 2) connect rows (first player) or columns?
const joinsRows = (p: number) => (p === 1) === meFirst
function onBorder(h: number, p: number, far: boolean): boolean {
  const c = h % N
  const r = Math.floor(h / N)
  if (joinsRows(p)) return far ? r === N - 1 : r === 0
  return far ? c === N - 1 : c === 0
}
// Opponent's border rows are forbidden to p.
function forbidden(h: number, p: number): boolean {
  const c = h % N
  const r = Math.floor(h / N)
  return joinsRows(p) ? c === 0 || c === N - 1 : r === 0 || r === N - 1
}

function blocked(k: number, p: number): boolean {
  for (const x of crossing.get(k)!) {
    const o = linkOwner.get(x)
    if (o !== undefined && o !== p) return true
  }
  return false
}

// Empty holes p still needs to join its borders (0-1 BFS). 99 = impossible.
const dist = new Uint8Array(HOLES)
const deque = new Int16Array(HOLES * 4)
function distance(p: number): number {
  dist.fill(255)
  let head = HOLES * 2
  let tail = HOLES * 2
  for (let h = 0; h < HOLES; h++) {
    if (!onBorder(h, p, false) || forbidden(h, p) || owner[h] === 3 - p) continue
    if (isCorner(h % N, Math.floor(h / N))) continue
    dist[h] = owner[h] === p ? 0 : 1
    if (dist[h] === 0) deque[--head] = h
    else deque[tail++] = h
  }
  while (head < tail) {
    const h = deque[head++]
    if (onBorder(h, p, true)) return dist[h]
    for (const g of linksOf[h]) {
      if (owner[g] === 3 - p || forbidden(g, p)) continue
      const k = linkKey(h, g)
      if (blocked(k, p)) continue
      const w = owner[g] === p ? 0 : 1
      const nd = dist[h] + w
      if (nd < dist[g]) {
        dist[g] = nd
        if (w === 0) deque[--head] = g
        else deque[tail++] = g
      }
    }
  }
  return 99
}

// Places a peg for p with its automatic links; returns the links added.
function place(h: number, p: number): number[] {
  owner[h] = p
  const added: number[] = []
  for (const g of linksOf[h]) {
    if (owner[g] !== p) continue
    const k = linkKey(h, g)
    if (linkOwner.has(k) || blocked(k, p)) continue
    linkOwner.set(k, p)
    added.push(k)
  }
  return added
}
function unplace(h: number, added: number[]) {
  owner[h] = 0
  for (const k of added) linkOwner.delete(k)
}

let firstTurn = true
while (true) {
  const last = readline().trim()
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  if (firstTurn) meFirst = last === "FIRST" || last === "SWAP"
  owner.fill(0)
  linkOwner.clear()
  const readPegs = (p: number) => {
    const n = parseInt(readline())
    for (let i = 0; i < n; i++) owner[parse(readline().trim())] = p
  }
  const readLinks = (p: number) => {
    const n = parseInt(readline())
    for (let i = 0; i < n; i++) {
      const [a, b] = readline().trim().split(" ")
      linkOwner.set(linkKey(parse(a), parse(b)), p)
    }
  }
  readPegs(1)
  readLinks(1)
  readPegs(2)
  readLinks(2)

  // Second player, first turn: swap a central first peg.
  if (firstTurn && !meFirst) {
    const h = last === "FIRST" ? -1 : parse(last)
    const c = h % N
    const r = Math.floor(h / N)
    firstTurn = false
    if (h >= 0 && c >= 3 && c <= 8 && r >= 3 && r <= 8) {
      console.log("SWAP")
      continue
    }
  }
  firstTurn = false

  // First peg of the game: off-centre, so a swap gains little.
  if (meFirst && !owner.some(o => o !== 0)) {
    console.log("C4")
    continue
  }
  let best = -1
  let bestScore = -Infinity
  // Candidates: empty legal holes, nearest to existing pegs first.
  const candidates: number[] = []
  for (let h = 0; h < HOLES; h++) {
    if (owner[h] || isCorner(h % N, Math.floor(h / N)) || forbidden(h, 1)) continue
    candidates.push(h)
  }
  const centre = (h: number) => -Math.abs((h % N) - 5.5) - Math.abs(Math.floor(h / N) - 5.5)
  candidates.sort((a, b) => centre(b) - centre(a))
  for (const h of candidates) {
    if (Date.now() > deadline) break
    const added = place(h, 1)
    const mine = distance(1)
    const theirs = distance(2)
    unplace(h, added)
    const s = (mine === 0 ? 1000 : 0) + theirs * DEFENCE - mine + centre(h) * 0.01
    if (s > bestScore) {
      bestScore = s
      best = h
    }
  }
  console.error(`score=${bestScore.toFixed(2)} candidates=${candidates.length}`)
  console.log(holeName(best))
}
