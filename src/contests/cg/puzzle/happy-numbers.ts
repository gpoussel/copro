// 🎮 CodinGame Puzzle - happy-numbers
// https://www.codingame.com/training/easy/happy-numbers

function isHappy(numStr: string): boolean {
  // Use BigInt arithmetic to handle very large numbers (up to 10^26)
  // Then sum of squares of digits will quickly reduce to a manageable size
  const seen = new Set<string>()

  let current = numStr

  while (current !== "1") {
    if (seen.has(current)) {
      return false
    }
    seen.add(current)

    // Compute sum of squares of digits
    let sum = BigInt(0)
    for (const ch of current) {
      const d = BigInt(ch)
      sum += d * d
    }
    current = sum.toString()
  }

  return true
}

const n = parseInt(readline())
for (let i = 0; i < n; i++) {
  const x = readline().trim()
  const happy = isHappy(x)
  console.log(`${x} ${happy ? ":)" : ":("}`)
}
