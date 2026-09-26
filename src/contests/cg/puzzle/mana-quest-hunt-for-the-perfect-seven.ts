// 🎮 CodinGame Puzzle - mana-quest-hunt-for-the-perfect-seven
// https://www.codingame.com/training/medium/mana-quest-hunt-for-the-perfect-seven

const HAND = 7
const nCategories = parseInt(readline())
const categories: { code: string; count: number }[] = []
for (let i = 0; i < nCategories; i++) {
  const [code, count] = readline().trim().split(/\s+/)
  categories.push({ code, count: Number(count) })
}
const nPatterns = parseInt(readline())
const patterns: string[] = []
for (let i = 0; i < nPatterns; i++) patterns.push(readline().trim())

const matches = (pattern: string, code: string): boolean => {
  for (let k = 0; k < 3; k++) if (pattern[k] !== "x" && pattern[k] !== code[k]) return false
  return true
}

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1)
  return Math.round(r)
}

// Inclusion-exclusion: count hands avoiding every card matched by a subset of patterns
let favorable = 0
for (let mask = 0; mask < 1 << nPatterns; mask++) {
  let excluded = 0
  let bits = 0
  for (let p = 0; p < nPatterns; p++) if (mask & (1 << p)) bits++
  for (const cat of categories) {
    let hit = false
    for (let p = 0; p < nPatterns; p++) if (mask & (1 << p) && matches(patterns[p], cat.code)) hit = true
    if (hit) excluded += cat.count
  }
  favorable += (bits % 2 ? -1 : 1) * binom(60 - excluded, HAND)
}

const probability = favorable / binom(60, HAND)
console.log((Math.round(probability * 10000) / 10000).toFixed(4))
