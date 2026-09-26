// 🎮 CodinGame Puzzle - horse-hyperracing-hyperduals
// https://www.codingame.com/training/medium/horse-hyperracing-hyperduals
//
// Closest pair under the Manhattan distance. Rotating the plane with
// u = v + e, w = v - e turns it into the Chebyshev distance max(|du|, |dw|),
// then a classic divide & conquer closest-pair (merge-sorted on w) runs in O(n log n).

const [classicCount, lcgCount, lcgSeed] = readline().split(" ").map(Number)
const horseCount = classicCount + lcgCount
const coordU = new Float64Array(horseCount)
const coordW = new Float64Array(horseCount)

for (let i = 0; i < classicCount; i++) {
  const [v, e] = readline().split(" ").map(Number)
  coordU[i] = v + e
  coordW[i] = v - e
}

// X(n+1) = 1103515245 * X(n) + 12345 mod 2^31: the low 31 bits of the 32-bit product are exact
let lcgState = lcgSeed
function nextLcg(): number {
  const current = lcgState
  lcgState = (Math.imul(1103515245, lcgState) + 12345) & 0x7fffffff
  return current
}
for (let i = classicCount; i < horseCount; i++) {
  const v = nextLcg()
  const e = nextLcg()
  coordU[i] = v + e
  coordW[i] = v - e
}

const order: number[] = []
for (let i = 0; i < horseCount; i++) order.push(i)
order.sort((a, b) => coordU[a] - coordU[b])
const scratch: number[] = new Array(horseCount)
const strip: number[] = new Array(horseCount)

function chebyshev(a: number, b: number): number {
  return Math.max(Math.abs(coordU[a] - coordU[b]), Math.abs(coordW[a] - coordW[b]))
}

// Returns the closest distance within order[lo, hi) and leaves that range sorted by w.
function closest(lo: number, hi: number): number {
  if (hi - lo <= 3) {
    let best = Infinity
    for (let i = lo; i < hi; i++) for (let j = i + 1; j < hi; j++) best = Math.min(best, chebyshev(order[i], order[j]))
    const part = order.slice(lo, hi).sort((a, b) => coordW[a] - coordW[b])
    for (let i = lo; i < hi; i++) order[i] = part[i - lo]
    return best
  }
  const mid = (lo + hi) >> 1
  const midU = coordU[order[mid]]
  let best = Math.min(closest(lo, mid), closest(mid, hi))

  // Merge both halves by w
  let i = lo
  let j = mid
  let k = lo
  while (i < mid || j < hi) {
    if (j >= hi || (i < mid && coordW[order[i]] <= coordW[order[j]])) scratch[k++] = order[i++]
    else scratch[k++] = order[j++]
  }
  for (let t = lo; t < hi; t++) order[t] = scratch[t]

  let stripSize = 0
  for (let t = lo; t < hi; t++) {
    const p = order[t]
    if (Math.abs(coordU[p] - midU) < best) {
      for (let s = stripSize - 1; s >= 0 && coordW[p] - coordW[strip[s]] < best; s--) {
        best = Math.min(best, chebyshev(p, strip[s]))
      }
      strip[stripSize++] = p
    }
  }
  return best
}

console.log(closest(0, horseCount))
