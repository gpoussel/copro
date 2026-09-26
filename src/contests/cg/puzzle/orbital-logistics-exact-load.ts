// 🎮 CodinGame Puzzle - orbital-logistics-exact-load
// https://www.codingame.com/training/medium/orbital-logistics-exact-load

const [capacity, itemCount] = readline().split(" ").map(Number)

// 0/1 knapsack on exact weight: best[w] = max value reaching weight w exactly (-1 = unreachable)
const best = new Int32Array(capacity + 1).fill(-1)
best[0] = 0
for (let i = 0; i < itemCount; i++) {
  const [weight, value] = readline().split(" ").map(Number)
  for (let w = capacity; w >= weight; w--) {
    const from = best[w - weight]
    if (from >= 0 && from + value > best[w]) best[w] = from + value
  }
}
console.log(best[capacity])
