// 🎮 CodinGame Puzzle - brackets-extended-edition
// https://www.codingame.com/training/medium/brackets-extended-edition

const TYPES: { [ch: string]: number } = { "(": 0, ")": 0, "[": 1, "]": 1, "{": 2, "}": 2, "<": 3, ">": 3 }

// Every bracket can be flipped, so only its type matters.
// reach[i] is a bitset of all j such that elements i..j can form a valid sequence.
function canBeValid(types: number[]): boolean {
  const n = types.length
  if (n % 2 === 1) return false
  if (n === 0) return true
  const words = Math.ceil(n / 32)
  const reach: Int32Array[] = []
  for (let i = 0; i <= n; i++) reach.push(new Int32Array(words))
  const has = (row: Int32Array, j: number) => (row[j >> 5] & (1 << (j & 31))) !== 0
  for (let i = n - 1; i >= 0; i--) {
    const row = reach[i]
    // i pairs with k: the inside i+1..k-1 must be valid (or empty), then anything valid after k
    for (let k = i + 1; k < n; k += 2) {
      if (types[k] !== types[i]) continue
      if (k > i + 1 && !has(reach[i + 1], k - 1)) continue
      row[k >> 5] |= 1 << (k & 31)
      const after = reach[k + 1]
      for (let w = 0; w < words; w++) row[w] |= after[w]
    }
  }
  return has(reach[0], n - 1)
}

const n = Number(readline())
const out: string[] = []
for (let i = 0; i < n; i++) {
  const types: number[] = []
  for (const ch of readline()) if (ch in TYPES) types.push(TYPES[ch])
  out.push(String(canBeValid(types)))
}
console.log(out.join("\n"))
