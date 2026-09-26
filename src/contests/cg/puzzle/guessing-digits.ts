// 🎮 CodinGame Puzzle - guessing-digits
// https://www.codingame.com/training/hard/guessing-digits

// Common-knowledge elimination: keep the set of pairs still consistent with
// every "I don't know". A player knows when only one remaining pair shares
// their value; otherwise every pair that would have let them know is removed.
// If a full round removes nothing, nobody will ever know.
const s = Number(readline())
const p = Number(readline())

let pairs: [number, number][] = []
for (let a = 1; a <= 9; a++) for (let b = a; b <= 9; b++) pairs.push([a, b])

const players: [string, (x: [number, number]) => number, number][] = [
  ["BURT", ([a, b]) => a + b, s],
  ["SARAH", ([a, b]) => a * b, p],
]

let answer = "IMPOSSIBLE"
search: for (let round = 1; ; round++) {
  let removed = false
  for (const [name, key, value] of players) {
    const counts = new Map<number, number>()
    for (const pair of pairs) counts.set(key(pair), (counts.get(key(pair)) ?? 0) + 1)
    const mine = pairs.filter(pair => key(pair) === value)
    if (mine.length === 1) {
      answer = `(${mine[0][0]},${mine[0][1]}) ${name} ${round}`
      break search
    }
    if (mine.length === 0) break search
    const kept = pairs.filter(pair => counts.get(key(pair))! > 1)
    if (kept.length < pairs.length) removed = true
    pairs = kept
  }
  if (!removed) break
}
console.log(answer)
