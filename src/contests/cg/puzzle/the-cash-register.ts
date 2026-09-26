// 🎮 CodinGame Puzzle - the-cash-register
// https://www.codingame.com/training/medium/the-cash-register

const coins = readline().trim().split(/\s+/).map(Number)
const goal = parseInt(readline())

// minCoins[a] = fewest coins summing to a (Infinity if impossible)
const minCoins: number[] = new Array(goal + 1).fill(Infinity)
minCoins[0] = 0
for (let a = 1; a <= goal; a++)
  for (const c of coins) if (c <= a && minCoins[a - c] + 1 < minCoins[a]) minCoins[a] = minCoins[a - c] + 1

if (goal === 0) console.log("0")
else if (minCoins[goal] === Infinity) console.log("IMPOSSIBLE")
else {
  // Greedily take the largest coin that still leads to an optimal solution
  const result: number[] = []
  let rest = goal
  while (rest > 0) {
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i]
      if (c <= rest && minCoins[rest - c] === minCoins[rest] - 1) {
        result.push(c)
        rest -= c
        break
      }
    }
  }
  console.log(result.join(" "))
}
