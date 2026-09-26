// 🎮 CodinGame Puzzle - the-two-piles-difference
// https://www.codingame.com/training/expert/the-two-piles-difference

// At most 12 distinct values: enumerate how many copies of each value go to
// B (total N/2). The product only grows as B fills up, so a branch is cut as
// soon as it exceeds best + max square. A first pass in doubles finds the best
// value; a second pass re-evaluates near-optimal leaves exactly with BigInt
// (products reach 20^20).

const pileSize = Number(readline())
const pileValues: number[] = []
while (pileValues.length < pileSize) {
  const row = readline()
  if (row == null) break
  for (const tok of row.trim().split(/\s+/)) if (tok) pileValues.push(Number(tok))
}
const countOf = new Map<number, number>()
for (const v of pileValues) countOf.set(v, (countOf.get(v) ?? 0) + 1)
const distinct = [...countOf.keys()].sort((a, b) => b - a)
const avail = distinct.map(v => countOf.get(v)!)
const totalSum = pileValues.reduce((a, b) => a + b, 0)
const half = pileSize / 2
const maxSq = totalSum * totalSum
// suffix availability, to prune impossible branches
const suffixAvail: number[] = new Array(distinct.length + 1).fill(0)
for (let i = distinct.length - 1; i >= 0; i--) suffixAvail[i] = suffixAvail[i + 1] + avail[i]

let bestApprox = Infinity
const picks: number[] = new Array(distinct.length).fill(0)
let exactBest: bigint | null = null
let secondPass = false

const evaluateExact = (): void => {
  let prod = 1n
  let sumB = 0
  for (let i = 0; i < distinct.length; i++) {
    for (let k = 0; k < picks[i]; k++) prod *= BigInt(distinct[i])
    sumB += picks[i] * distinct[i]
  }
  const sA = BigInt(totalSum - sumB)
  let d = sA * sA - prod
  if (d < 0n) d = -d
  if (exactBest === null || d < exactBest) exactBest = d
}

const explore = (idx: number, left: number, prod: number, sumB: number): void => {
  if (prod > bestApprox * (1 + 1e-9) + maxSq + 1) return
  if (left === 0) {
    const sA = totalSum - sumB
    const d = Math.abs(sA * sA - prod)
    if (!secondPass) {
      if (d < bestApprox) bestApprox = d
    } else if (d <= bestApprox * (1 + 1e-9) + 1) evaluateExact()
    return
  }
  if (idx === distinct.length || suffixAvail[idx] < left) return
  const v = distinct[idx]
  let p = prod
  for (let k = 0; k <= Math.min(avail[idx], left); k++) {
    picks[idx] = k
    explore(idx + 1, left - k, p, sumB + k * v)
    p *= v
  }
  picks[idx] = 0
}

explore(0, half, 1, 0)
secondPass = true
explore(0, half, 1, 0)
console.log(String(exactBest ?? 0n))
