// 🎮 CodinGame Puzzle - darts-checkout-routes
// https://www.codingame.com/

const score: number = parseInt(readline(), 10)
const darts: number = parseInt(readline(), 10)

const singles: number[] = []
for (let i = 1; i <= 20; i++) singles.push(i)
singles.push(25)

const doubles: number[] = singles.map(s => s * 2)
const trebles: number[] = []
for (let i = 1; i <= 20; i++) trebles.push(i * 3)

const anyThrow: number[] = [...singles, ...doubles, ...trebles]

// ways[d][s] = number of ordered sequences using exactly d non-final darts summing to s
const maxDarts: number = darts
let total: bigint = 0n

if (darts >= 1) {
  // dp over number of leading (non-final) darts: 0 .. darts-1
  // each leading dart can be any throw; final dart must be a double
  // ways to reach partial sum p with exactly k leading darts
  let ways: bigint[] = new Array<bigint>(score + 1).fill(0n)
  ways[0] = 1n // k = 0 leading darts

  for (let k = 0; k <= maxDarts - 1; k++) {
    // for this k, add contributions where final double completes the score
    for (let p = 0; p <= score; p++) {
      if (ways[p] === 0n) continue
      for (const d of doubles) {
        if (p + d === score) total += ways[p]
      }
    }
    // advance to k+1 leading darts
    if (k < maxDarts - 1) {
      const next: bigint[] = new Array<bigint>(score + 1).fill(0n)
      for (let p = 0; p <= score; p++) {
        if (ways[p] === 0n) continue
        for (const t of anyThrow) {
          if (p + t <= score) next[p + t] += ways[p]
        }
      }
      ways = next
    }
  }
}

console.log(total.toString())
