// 🎮 CodinGame Puzzle - beautiful-base-is-a-beautiful-sum
// https://www.codingame.com/training/hard/beautiful-base-is-a-beautiful-sum

// Every pair (b, k) with b >= 2, k >= 2 and b^k <= n contributes b to the sum,
// so the sum is Σ_k (2 + ... + floor(n^(1/k))). The count of distinct perfect
// powers is (#squares) + (#non-square powers with exponent >= 3, enumerated).
// All values stay below 2^53, so plain numbers are exact.

const limit = Number(readline().trim())

// floor(limit^(1/k)) computed exactly
const intRoot = (k: number): number => {
  let r = Math.floor(Math.pow(limit, 1 / k))
  while (r > 0 && Math.pow(r, k) > limit) r--
  while (Math.pow(r + 1, k) <= limit) r++
  return r
}

let total = 0
for (let k = 2; 2 ** k <= limit; k++) {
  const r = intRoot(k)
  total += (r * (r + 1)) / 2 - 1
}

const isSquare = (x: number): boolean => {
  const s = Math.round(Math.sqrt(x))
  return s * s === x
}
const others = new Set<number>()
const cubeRoot = intRoot(3)
for (let b = 2; b <= cubeRoot; b++) {
  for (let p = b * b * b; p <= limit; p *= b) if (!isSquare(p)) others.add(p)
}

console.log(`${intRoot(2) - 1 + others.size} ${total}`)
