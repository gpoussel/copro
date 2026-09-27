// 🎮 CodinGame Multiplayer - atari-go
// https://www.codingame.com/multiplayer/bot-programming/atari-go
//
// Go where only captures score, 80 turns (board 9, 13 then 19 by league);
// no suicide, simple ko. Ties go to the player with more stones played, so we
// never pass while a legal move exists. Tactical 1.5-ply: score each legal
// move by stones captured, our groups left in atari, enemy groups put in
// atari, liberties, minus the best capture the opponent then has.

const myColor = readline().trim()
const N = parseInt(readline())
const ME = 1
const OPP = 2
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const neighbours: number[][] = []
for (let i = 0; i < N * N; i++) {
  const x = i % N
  const y = Math.floor(i / N)
  neighbours.push(
    DIRS.filter(([dx, dy]) => x + dx >= 0 && x + dx < N && y + dy >= 0 && y + dy < N).map(
      ([dx, dy]) => (y + dy) * N + x + dx
    )
  )
}

// Group of stone i: [stones, liberties].
function group(b: Uint8Array, i: number): [number[], Set<number>] {
  const color = b[i]
  const stones = [i]
  const libs = new Set<number>()
  const seen = new Set([i])
  for (let h = 0; h < stones.length; h++) {
    for (const n of neighbours[stones[h]]) {
      if (b[n] === 0) libs.add(n)
      else if (b[n] === color && !seen.has(n)) {
        seen.add(n)
        stones.push(n)
      }
    }
  }
  return [stones, libs]
}

// Plays color c at i; returns captured count, or -1 if illegal (suicide).
function play(b: Uint8Array, i: number, c: number): number {
  if (b[i] !== 0) return -1
  b[i] = c
  let captured = 0
  for (const n of neighbours[i]) {
    if (b[n] === 3 - c) {
      const [stones, libs] = group(b, n)
      if (libs.size === 0) {
        for (const s of stones) b[s] = 0
        captured += stones.length
      }
    }
  }
  if (group(b, i)[1].size === 0) {
    b[i] = 0
    return -1
  }
  return captured
}

// Best capture available to color c (stones).
function bestCapture(b: Uint8Array, c: number): number {
  let best = 0
  const done = new Set<number>()
  for (let i = 0; i < N * N; i++) {
    if (b[i] !== 3 - c || done.has(i)) continue
    const [stones, libs] = group(b, i)
    for (const s of stones) done.add(s)
    if (libs.size === 1) best = Math.max(best, stones.length)
  }
  return best
}

function evaluate(b: Uint8Array): number {
  let s = 0
  const done = new Set<number>()
  for (let i = 0; i < N * N; i++) {
    if (b[i] === 0 || done.has(i)) continue
    const [stones, libs] = group(b, i)
    for (const st of stones) done.add(st)
    const sign = b[i] === ME ? 1 : -1
    const l = libs.size
    s += sign * (Math.min(l, 4) * 2 - (l === 1 ? 10 * stones.length : 0) - (l === 2 ? 2 * stones.length : 0))
  }
  return s
}

let previous = new Uint8Array(N * N) // board after our last move (for ko)
while (true) {
  readline() // opponent move
  readline() // scores
  const board = new Uint8Array(N * N)
  for (let y = 0; y < N; y++) {
    const line = readline()
    for (let x = 0; x < N; x++) {
      const ch = line[x]
      board[y * N + x] = ch === "." ? 0 : ch === myColor ? ME : OPP
    }
  }
  // Candidates for a side: legal moves ranked by the 1-ply heuristic.
  const centre = (N - 1) / 2
  const candidates = (bd: Uint8Array, side: number, prev: Uint8Array | null, k: number) => {
    const list: { i: number; b: Uint8Array; captured: number; s: number }[] = []
    for (let i = 0; i < N * N; i++) {
      if (bd[i] !== 0) continue
      const b = new Uint8Array(bd)
      const captured = play(b, i, side)
      if (captured < 0) continue
      if (prev && b.every((v, q) => v === prev[q])) continue
      const x = i % N
      const y = Math.floor(i / N)
      const threat = bestCapture(b, 3 - side)
      const e = side === ME ? evaluate(b) : -evaluate(b)
      list.push({ i, b, captured, s: captured * 30 - threat * 25 + e - (Math.abs(x - centre) + Math.abs(y - centre)) * 0.2 })
    }
    list.sort((p, q) => q.s - p.s)
    return list.slice(0, k)
  }
  // 2-ply: our move, then the opponent's best reply among its top moves.
  let best = -1
  let bestScore = -Infinity
  const deadline = Date.now() + 80
  for (const c of candidates(board, ME, previous, 10)) {
    let worst = Infinity
    for (const r of candidates(c.b, OPP, null, 7)) {
      // Our best follow-up (3rd ply), while time allows.
      let follow = bestCapture(r.b, ME) * 12 + evaluate(r.b)
      if (Date.now() < deadline - 20)
        for (const f of candidates(r.b, ME, null, 5))
          follow = Math.max(follow, f.captured * 30 - bestCapture(f.b, OPP) * 25 + evaluate(f.b))
      const v = (c.captured - r.captured) * 30 + follow
      if (v < worst) worst = v
      if (worst <= bestScore) break
    }
    if (worst === Infinity) worst = c.captured * 30 + evaluate(c.b)
    if (worst > bestScore) {
      bestScore = worst
      best = c.i
    }
    if (Date.now() > deadline) break
  }
  if (best < 0) {
    console.log("PASS")
    continue
  }
  const after = new Uint8Array(board)
  play(after, best, ME)
  previous = after
  console.log(`${best % N} ${Math.floor(best / N)}`)
}
