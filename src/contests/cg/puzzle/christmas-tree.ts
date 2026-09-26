// 🎮 CodinGame Puzzle - christmas-tree
// https://www.codingame.com/training/medium/christmas-tree

const n = BigInt(readline().trim())
const inc = BigInt(readline().trim())
const ONE = BigInt(1)
const TWO = BigInt(2)

// Stars used by k layers of 1, 1 + i, 1 + 2i, ... stars
const layersStars = (k: bigint) => k + (inc * k * (k - ONE)) / TWO

// Largest k whose layers leave at least one star for the root
let lo = ONE
let hi = BigInt(1) << BigInt(33)
while (lo < hi) {
  const mid = (lo + hi + ONE) / TWO
  if (layersStars(mid) <= n - ONE) lo = mid
  else hi = mid - ONE
}

// The remaining stars form the root, one per row
console.log((lo + n - layersStars(lo)).toString())
