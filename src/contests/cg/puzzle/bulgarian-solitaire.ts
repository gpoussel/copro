// 🎮 CodinGame Puzzle - bulgarian-solitaire
// https://www.codingame.com/training/medium/bulgarian-solitaire

readline()
let piles = readline().trim().split(/\s+/).map(Number).filter(c => c > 0)

// Canonical key of a configuration: sorted non-empty pile sizes
const keyOf = (p: number[]) => p.slice().sort((a, b) => a - b).join(",")

const seen = new Map<string, number>()
let turn = 0
let key = keyOf(piles)
while (!seen.has(key)) {
  seen.set(key, turn)
  const taken = piles.length
  piles = piles.map(c => c - 1).filter(c => c > 0)
  piles.push(taken)
  turn++
  key = keyOf(piles)
}
console.log(turn - seen.get(key)!)
