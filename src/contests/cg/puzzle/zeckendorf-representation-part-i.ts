// 🎮 CodinGame Puzzle - zeckendorf-representation-part-i
// https://www.codingame.com/training/easy/zeckendorf-representation-part-i

const n: bigint = BigInt(readline())

const fibs: bigint[] = [1n, 2n]
while (fibs[fibs.length - 1] < n) {
  fibs.push(fibs[fibs.length - 1] + fibs[fibs.length - 2])
}

const parts: bigint[] = []
let remaining: bigint = n
for (let i = fibs.length - 1; i >= 0; i--) {
  if (fibs[i] <= remaining) {
    parts.push(fibs[i])
    remaining -= fibs[i]
  }
}

console.log(parts.join("+"))
