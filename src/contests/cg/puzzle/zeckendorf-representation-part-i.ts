// 🎮 CodinGame Puzzle - zeckendorf-representation-part-i
// https://www.codingame.com/training/easy/zeckendorf-representation-part-i

let n = parseInt(readline())
const fibs: number[] = [1, 2]
while (fibs[fibs.length - 1] < n) {
  fibs.push(fibs[fibs.length - 1] + fibs[fibs.length - 2])
}
const parts: number[] = []
for (let i = fibs.length - 1; i >= 0; i--) {
  if (fibs[i] <= n) {
    parts.push(fibs[i])
    n -= fibs[i]
  }
}
console.log(parts.join("+"))
