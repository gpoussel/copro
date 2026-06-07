// 🎮 CodinGame Puzzle - byte-pair-encoding
// https://www.codingame.com/training/medium/byte-pair-encoding

const firstLine = readline().split(" ")
const N = parseInt(firstLine[0])
const M = parseInt(firstLine[1])

// Read N lines and concatenate into a single string
let s = ""
for (let i = 0; i < N; i++) {
  s += readline()
}

// BPE algorithm:
// - Find the most common non-overlapping pair of consecutive characters
// - If tie, choose the leftmost pair (first occurrence in the string)
// - Replace all non-overlapping occurrences with a new non-terminal character
// - Track rules in order
// - Stop when no pair appears more than once

const rules: string[] = []
let nextChar = 90 // 'Z' = 90, then Y=89, X=88, ...

/**
 * Count all non-overlapping occurrences of a pair in the string,
 * and return the leftmost position where the pair first appears.
 */
function findBestPair(str: string): { pair: string; count: number; firstPos: number } | null {
  // Count non-overlapping occurrences of each pair, and track leftmost position
  const counts = new Map<string, number>()
  const firstPos = new Map<string, number>()

  for (let i = 0; i < str.length - 1; i++) {
    const pair = str[i] + str[i + 1]
    if (!counts.has(pair)) {
      counts.set(pair, 0)
      firstPos.set(pair, i)
    }
    // Non-overlapping: count greedily left to right
    // We need to do the actual non-overlapping count separately
  }

  // For non-overlapping count, we need to scan left to right and skip after match
  const nonOverlappingCounts = new Map<string, number>()
  const leftmostPos = new Map<string, number>()

  for (let i = 0; i < str.length - 1; i++) {
    const pair = str[i] + str[i + 1]
    if (!leftmostPos.has(pair)) {
      leftmostPos.set(pair, i)
    }
  }

  // Now count non-overlapping occurrences for each unique pair
  const uniquePairs = new Set<string>()
  for (let i = 0; i < str.length - 1; i++) {
    uniquePairs.add(str[i] + str[i + 1])
  }

  for (const pair of uniquePairs) {
    let count = 0
    let i = 0
    while (i < str.length - 1) {
      if (str[i] === pair[0] && str[i + 1] === pair[1]) {
        count++
        i += 2 // skip to avoid overlapping
      } else {
        i++
      }
    }
    nonOverlappingCounts.set(pair, count)
  }

  // Find the pair with maximum count > 1
  // If tie, choose the leftmost pair (smallest firstPos)
  let bestPair: string | null = null
  let bestCount = 1 // must be > 1 to be worth replacing
  let bestPos = Infinity

  for (const [pair, count] of nonOverlappingCounts) {
    if (count > bestCount) {
      bestPair = pair
      bestCount = count
      bestPos = leftmostPos.get(pair)!
    } else if (count === bestCount && count > 1) {
      const pos = leftmostPos.get(pair)!
      if (pos < bestPos) {
        bestPair = pair
        bestPos = pos
      }
    }
  }

  if (bestPair === null) return null
  return { pair: bestPair, count: bestCount, firstPos: bestPos }
}

/**
 * Replace all non-overlapping occurrences of `pair` in `str` with `replacement`.
 */
function replaceAll(str: string, pair: string, replacement: string): string {
  let result = ""
  let i = 0
  while (i < str.length) {
    if (i < str.length - 1 && str[i] === pair[0] && str[i + 1] === pair[1]) {
      result += replacement
      i += 2
    } else {
      result += str[i]
      i++
    }
  }
  return result
}

// Run BPE algorithm
while (true) {
  const best = findBestPair(s)
  if (best === null) break

  const nonTerminal = String.fromCharCode(nextChar)
  nextChar--

  rules.push(`${nonTerminal} = ${best.pair}`)
  s = replaceAll(s, best.pair, nonTerminal)
}

// Output
console.log(s)
for (const rule of rules) {
  console.log(rule)
}
