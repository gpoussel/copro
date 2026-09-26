// 🎮 CodinGame Puzzle - rearrange-string-to-two-numbers
// https://www.codingame.com/training/medium/rearrange-string-to-two-numbers
// Numbers are handled as digit strings: at most 18 digits, or exactly 10^18 (19 digits).

const inputString = readline().trim()
const initialCounts: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
for (const ch of inputString) initialCounts[+ch]++
const digitTotal = inputString.length
const sumCounts = (counts: number[]): number => counts.reduce((a, b) => a + b, 0)

// Smallest valid number using exactly the given digits, or null
const smallestArrangement = (counts: number[]): string | null => {
  const total = sumCounts(counts)
  if (total === 0 || total > 19) return null
  if (total === 19) return counts[1] === 1 && counts[0] === 18 ? "1" + "0".repeat(18) : null
  if (total === 1) return String(counts.indexOf(1))
  let lead = 1
  while (lead <= 9 && counts[lead] === 0) lead++
  if (lead > 9) return null
  let out = String(lead)
  for (let d = 0; d <= 9; d++) out += String(d).repeat(counts[d] - (d === lead ? 1 : 0))
  return out
}

// Removes 10^18's digits from the counts, or null if impossible
const withoutMaxNumber = (counts: number[]): number[] | null => {
  if (counts[1] < 1 || counts[0] < 18) return null
  const rest = counts.slice()
  rest[1]--
  rest[0] -= 18
  return rest
}

const solve = (): string => {
  for (let lenA = 1; lenA <= Math.min(19, digitTotal - 1); lenA++) {
    const lenB = digitTotal - lenA
    if (lenB > 19) continue
    if (lenA === 19) {
      const rest = withoutMaxNumber(initialCounts)
      const b = rest && smallestArrangement(rest)
      if (b) return "1" + "0".repeat(18) + " " + b
      continue
    }
    if (lenB === 19) {
      const rest = withoutMaxNumber(initialCounts)
      const a = rest && smallestArrangement(rest)
      if (a) return a + " 1" + "0".repeat(18)
      continue
    }
    // Both numbers have at most 18 digits: build A greedily, keeping a valid B possible
    const counts = initialCounts.slice()
    const canFinish = (remainingA: number): boolean => {
      if (lenB === 1) return true
      const zeros = counts[0]
      const nonZeros = sumCounts(counts) - zeros
      return nonZeros - Math.max(0, remainingA - zeros) >= 1
    }
    let a = ""
    for (let pos = 0; pos < lenA; pos++) {
      let chosen = -1
      for (let d = pos === 0 && lenA > 1 ? 1 : 0; d <= 9 && chosen < 0; d++) {
        if (counts[d] === 0) continue
        counts[d]--
        if (canFinish(lenA - pos - 1)) chosen = d
        else counts[d]++
      }
      if (chosen < 0) break
      a += chosen
    }
    if (a.length < lenA) continue
    const b = smallestArrangement(counts)
    if (b) return a + " " + b
  }
  return "-1 -1"
}

console.log(solve())
