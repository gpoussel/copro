// 🎮 CodinGame Puzzle - simple-load-balancing
// https://www.codingame.com/training/easy/simple-load-balancing

const n = parseInt(readline())
const k = parseInt(readline())
const loads = readline().split(" ").map(Number)

loads.sort((a, b) => a - b)

// Strategy: greedily raise the bottom servers up to match higher levels.
// sorted loads: L[0] <= L[1] <= ... <= L[n-1]
// At step i, group of (i+1) servers all at level L[i].
// Cost to raise them all to L[i+1]: (i+1) * (L[i+1] - L[i]).
// If affordable, do it; otherwise distribute remaining evenly in the group.

let remaining = k
let result!: number

let leveled = false
for (let i = 0; i < n - 1; i++) {
  const groupSize = i + 1
  const cost = groupSize * (loads[i + 1] - loads[i])
  if (cost <= remaining) {
    remaining -= cost
    // Group now at level loads[i+1]; continue
  } else {
    // Distribute 'remaining' among 'groupSize' servers all at level loads[i]
    const newMin = loads[i] + Math.floor(remaining / groupSize)
    const imbalance = loads[n - 1] - newMin
    result = Math.max(0, imbalance)
    leveled = true
    break
  }
}

if (!leveled) {
  // All servers leveled to loads[n-1], still have remaining jobs
  // Distribute among all n servers
  const perServer = Math.floor(remaining / n)
  const extra = remaining % n
  const newMax = loads[n - 1] + perServer + (extra > 0 ? 1 : 0)
  const newMin = loads[n - 1] + perServer
  result = newMax - newMin
}

console.log(result + 0)
