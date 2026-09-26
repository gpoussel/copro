// 🎮 CodinGame Puzzle - adversarial-mate-with-rook
// https://www.codingame.com/training/hard/adversarial-mate-with-rook

// KRK endgame tablebase by retrograde-style iteration: B[p] is the number of
// white moves still needed when black is to move (0 = checkmated), W[p] the
// same with white to move. Round n: a white position is mate-in-n if one move
// reaches a black position of value n-1; a black position gets value n once all
// its replies reach known white positions (max = n). Captures/stalemates stay -1
// (draw). Then play the move minimizing B.

const sq = (s: string): number => s.charCodeAt(0) - 97 + 8 * (s.charCodeAt(1) - 49)
const name = (s: number): string => String.fromCharCode(97 + (s & 7)) + String.fromCharCode(49 + (s >> 3))
const fx = (s: number): number => s & 7
const fy = (s: number): number => s >> 3
const adjacent = (a: number, b: number): boolean =>
  a !== b && Math.abs(fx(a) - fx(b)) <= 1 && Math.abs(fy(a) - fy(b)) <= 1

const kingMoves: number[][] = []
for (let s = 0; s < 64; s++) {
  const list: number[] = []
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue
      const x = fx(s) + dx
      const y = fy(s) + dy
      if (x >= 0 && x < 8 && y >= 0 && y < 8) list.push(x + 8 * y)
    }
  kingMoves.push(list)
}

// Does the rook on r attack square t (only the white king can block)?
const rookAttacks = (r: number, t: number, wk: number): boolean => {
  if (r === t) return false
  if (fx(r) === fx(t)) {
    const lo = Math.min(fy(r), fy(t))
    const hi = Math.max(fy(r), fy(t))
    return !(fx(wk) === fx(r) && fy(wk) > lo && fy(wk) < hi)
  }
  if (fy(r) === fy(t)) {
    const lo = Math.min(fx(r), fx(t))
    const hi = Math.max(fx(r), fx(t))
    return !(fy(wk) === fy(r) && fx(wk) > lo && fx(wk) < hi)
  }
  return false
}

const idx = (wk: number, wr: number, bk: number): number => (wk * 64 + wr) * 64 + bk

// White moves as list of [wk, wr] resulting squares
const whiteMoves = (wk: number, wr: number, bk: number): number[][] => {
  const res: number[][] = []
  for (const t of kingMoves[wk]) if (t !== wr && t !== bk && !adjacent(t, bk)) res.push([t, wr])
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    let x = fx(wr) + dx
    let y = fy(wr) + dy
    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
      const t = x + 8 * y
      if (t === wk || t === bk) break
      res.push([wk, t])
      x += dx
      y += dy
    }
  }
  return res
}

// Black replies: returns destination squares, or null if a safe rook capture exists
const blackMoves = (wk: number, wr: number, bk: number): number[] | null => {
  const res: number[] = []
  for (const t of kingMoves[bk]) {
    if (t === wk || adjacent(t, wk)) continue
    if (t === wr) return null
    if (rookAttacks(wr, t, wk)) continue
    res.push(t)
  }
  return res
}

const N = 64 * 64 * 64
const W = new Int8Array(N).fill(-1)
const B = new Int8Array(N).fill(-1)
const blackValid = new Uint8Array(N)
const blackDone = new Uint8Array(N)
for (let wk = 0; wk < 64; wk++)
  for (let wr = 0; wr < 64; wr++) {
    if (wr === wk) continue
    for (let bk = 0; bk < 64; bk++) {
      if (bk === wk || bk === wr || adjacent(wk, bk)) continue
      const p = idx(wk, wr, bk)
      blackValid[p] = 1
      const moves = blackMoves(wk, wr, bk)
      if (moves === null) blackDone[p] = 1
      else if (moves.length === 0) {
        blackDone[p] = 1
        if (rookAttacks(wr, bk, wk)) B[p] = 0
      }
    }
  }

for (let n = 1; n <= 40; n++) {
  let changed = false
  for (let wk = 0; wk < 64; wk++)
    for (let wr = 0; wr < 64; wr++) {
      if (wr === wk) continue
      for (let bk = 0; bk < 64; bk++) {
        const p = idx(wk, wr, bk)
        if (!blackValid[p] || W[p] >= 0 || rookAttacks(wr, bk, wk)) continue
        for (const [nk, nr] of whiteMoves(wk, wr, bk))
          if (B[idx(nk, nr, bk)] === n - 1) {
            W[p] = n
            changed = true
            break
          }
      }
    }
  for (let wk = 0; wk < 64; wk++)
    for (let wr = 0; wr < 64; wr++) {
      if (wr === wk) continue
      for (let bk = 0; bk < 64; bk++) {
        const p = idx(wk, wr, bk)
        if (!blackValid[p] || blackDone[p]) continue
        let ok = true
        for (const t of blackMoves(wk, wr, bk) as number[])
          if (W[idx(wk, wr, t)] < 0) {
            ok = false
            break
          }
        if (ok) {
          B[p] = n
          blackDone[p] = 1
          changed = true
        }
      }
    }
  if (!changed) break
}

let [wk, wr, bk] = readline().split(" ").map(sq)
while (true) {
  let best: number[] = []
  let bestVal = 1000
  for (const [nk, nr] of whiteMoves(wk, wr, bk)) {
    const v = B[idx(nk, nr, bk)]
    if (v >= 0 && v < bestVal) {
      bestVal = v
      best = [nk, nr]
    }
  }
  const from = best[0] !== wk ? wk : wr
  const to = best[0] !== wk ? best[0] : best[1]
  console.log(name(from) + name(to))
  wk = best[0]
  wr = best[1]
  if (bestVal === 0) break
  const line = readline()
  if (!line) break
  bk = sq(line.trim().slice(2, 4))
}
