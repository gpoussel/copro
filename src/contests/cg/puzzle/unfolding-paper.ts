// 🎮 CodinGame Puzzle - unfolding-paper
// https://www.codingame.com/training/expert/unfolding-paper

// One unfold gives a 2W x 2H block U; every further unfold just tiles U by
// translation, so after N unfolds the sheet is a K x K grid of copies of U with
// K = 2^(N-1). The number of pieces is a quadratic polynomial in K: we count
// the pieces by flood fill for K = 1..4, fit A.K^2 + B.K + C on K = 2, 3, 4
// and evaluate it with BigInt for the real K.

const foldCount = parseInt(readline())
const [w0, h0] = readline().split(" ").map(Number)
const base: string[] = []
for (let i = 0; i < h0; i++) base.push(readline().padEnd(w0, ".").slice(0, w0))

// U: mirrored copy on the left/top, original on the right/bottom
const uw = 2 * w0
const uh = 2 * h0
const unit: boolean[][] = []
for (let y = 0; y < uh; y++) {
  const sy = y < h0 ? h0 - 1 - y : y - h0
  const row: boolean[] = []
  for (let x = 0; x < uw; x++) {
    const sx = x < w0 ? w0 - 1 - x : x - w0
    row.push(base[sy][sx] === "#")
  }
  unit.push(row)
}

const countPieces = (k: number): number => {
  const w = uw * k
  const h = uh * k
  const seen = new Uint8Array(w * h)
  const stack = new Int32Array(w * h)
  let pieces = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const id = y * w + x
      if (seen[id] || !unit[y % uh][x % uw]) continue
      pieces++
      seen[id] = 1
      let sp = 0
      stack[sp++] = id
      while (sp > 0) {
        const c = stack[--sp]
        const cx = c % w
        const cy = (c - cx) / w
        const tryCell = (nx: number, ny: number): void => {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) return
          const nid = ny * w + nx
          if (seen[nid] || !unit[ny % uh][nx % uw]) return
          seen[nid] = 1
          stack[sp++] = nid
        }
        tryCell(cx + 1, cy)
        tryCell(cx - 1, cy)
        tryCell(cx, cy + 1)
        tryCell(cx, cy - 1)
      }
    }
  }
  return pieces
}

if (foldCount <= 3) {
  console.log(countPieces(1 << (foldCount - 1)))
} else {
  const f2 = BigInt(countPieces(2))
  const f3 = BigInt(countPieces(3))
  const f4 = BigInt(countPieces(4))
  // second difference = 2A, then B and C from f(2), f(3)
  const a2 = f4 - 2n * f3 + f2
  const aCoef = a2 / 2n
  const bCoef = f3 - f2 - 5n * aCoef
  const cCoef = f2 - 4n * aCoef - 2n * bCoef
  const k = 1n << BigInt(foldCount - 1)
  console.log((aCoef * k * k + bCoef * k + cCoef).toString())
}
