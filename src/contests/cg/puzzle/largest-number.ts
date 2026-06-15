// 🎮 CodinGame Puzzle - largest-number
// https://www.codingame.com/training/easy/largest-number

const number: string = readline()
const d: bigint = BigInt(readline())

const candidates: Set<string> = new Set<string>()
const n: number = number.length

// Remove 0, 1, or 2 digits while keeping order.
candidates.add(number)
for (let i = 0; i < n; i++) {
  candidates.add(number.slice(0, i) + number.slice(i + 1))
  for (let j = i + 1; j < n; j++) {
    candidates.add(number.slice(0, i) + number.slice(i + 1, j) + number.slice(j + 1))
  }
}

let best: bigint = -1n
for (const candidate of candidates) {
  if (candidate.length === 0) {
    continue
  }
  const value: bigint = BigInt(candidate)
  if (value % d === 0n && value > best) {
    best = value
  }
}

console.log((best < 0n ? 0n : best).toString())
