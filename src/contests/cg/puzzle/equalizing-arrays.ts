// 🎮 CodinGame Puzzle - equalizing-arrays
// https://www.codingame.com/training/medium/equalizing-arrays

// The net flow across each boundary i|i+1 is fixed by prefix sums, and each
// non-zero flow is exactly one operation. The flows form a DAG on a path, so
// any currently executable operation can be applied without blocking the
// others: greedily apply the lexicographically smallest executable one.
const arraySize = parseInt(readline())
const arrayA = readline().split(" ").map(Number)
const arrayB = readline().split(" ").map(Number)

interface Transfer {
  from: number // 0-based
  direction: number
  amount: number
}

const pending: Transfer[] = []
let prefixA = 0
let prefixB = 0
for (let i = 0; i < arraySize - 1; i++) {
  prefixA += arrayA[i]
  prefixB += arrayB[i]
  const flow = prefixA - prefixB
  if (flow > 0) pending.push({ from: i, direction: 1, amount: flow })
  else if (flow < 0) pending.push({ from: i + 1, direction: -1, amount: -flow })
}

const answerLines: string[] = [String(pending.length)]
while (pending.length > 0) {
  let chosen = -1
  for (let k = 0; k < pending.length; k++) {
    const t = pending[k]
    if (arrayA[t.from] < t.amount) continue
    if (chosen < 0) {
      chosen = k
      continue
    }
    const c = pending[chosen]
    if (t.from < c.from || (t.from === c.from && t.direction < c.direction)) chosen = k
  }
  const [transfer] = pending.splice(chosen, 1)
  arrayA[transfer.from] -= transfer.amount
  arrayA[transfer.from + transfer.direction] += transfer.amount
  answerLines.push(`${transfer.from + 1} ${transfer.direction} ${transfer.amount}`)
}
console.log(answerLines.join("\n"))
